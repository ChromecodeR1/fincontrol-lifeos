import { NextResponse } from "next/server";
import { createServerSupabase } from "../../lib/supabase/server";

function toInternalEmail(usernameOrEmail: string): string {
  const clean = usernameOrEmail.trim().toLowerCase();
  if (clean.includes("@")) return clean;
  const slug = clean.replace(/[^a-z0-9._-]/g, "");
  return `${slug || "owner"}@coindex.app`;
}

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        hasOwner: false,
        ownerUsername: null,
        sheetsConfigured: false,
        cloudError: "Chaves NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY ausentes no .env.local."
      });
    }

    const supabase = await createServerSupabase();

    // 1. Verifica no banco se a conta proprietária única já existe
    const { data: ownerStatus, error: rpcError } = await supabase.rpc("get_coindex_owner_status");
    const hasOwner = Boolean(ownerStatus?.hasOwner);
    const ownerUsername = ownerStatus?.ownerUsername || null;

    // 2. Verifica se já existe sessão ativa no navegador
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      const { data: settings } = await supabase
        .from("user_settings")
        .select("username, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      const displayUsername =
        settings?.username ||
        user.user_metadata?.username ||
        (user.email ? user.email.split("@")[0] : "Proprietário");

      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          username: displayUsername,
          avatarUrl: settings?.avatar_url || ""
        },
        hasOwner: true,
        ownerUsername: displayUsername,
        sheetsConfigured: true,
        cloudError: null
      });
    }

    return NextResponse.json({
      authenticated: false,
      user: null,
      hasOwner,
      ownerUsername,
      sheetsConfigured: true,
      cloudError: rpcError ? `Aviso RPC: ${rpcError.message}` : null
    });
  } catch (err: any) {
    return NextResponse.json({
      authenticated: false,
      user: null,
      hasOwner: false,
      ownerUsername: null,
      sheetsConfigured: false,
      cloudError: `Erro ao conectar ao Supabase: ${err?.message || "Falha de rede"}`
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, username, password } = body;
    const supabase = await createServerSupabase();

    // 1. LOGOUT
    if (action === "logout") {
      await supabase.auth.signOut();
      return NextResponse.json({ status: "success", message: "Sessão encerrada." });
    }

    const cleanUser = String(username || "").replace(/[<>]/g, "").trim();
    const rawPass = String(password || "");

    if (!cleanUser || !rawPass) {
      return NextResponse.json(
        { status: "error", message: "Preencha seu usuário e sua senha." },
        { status: 400 }
      );
    }

    const email = toInternalEmail(cleanUser);

    // 2. PRIMEIRO ACESSO — CRIAR CONTA PROPRIETÁRIA ÚNICA
    if (action === "register") {
      const { data: ownerStatus } = await supabase.rpc("get_coindex_owner_status");
      if (ownerStatus?.hasOwner) {
        return NextResponse.json(
          {
            status: "error",
            message: "O Coindex já possui uma conta proprietária registrada no Supabase. Faça login com ela."
          },
          { status: 403 }
        );
      }

      if (rawPass.length < 8) {
        return NextResponse.json(
          { status: "error", message: "A senha deve ter no mínimo 8 caracteres." },
          { status: 400 }
        );
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: rawPass,
        options: {
          data: { username: cleanUser }
        }
      });

      if (signUpError || !signUpData.user) {
        return NextResponse.json(
          { status: "error", message: signUpError?.message || "Erro ao criar conta no Supabase." },
          { status: 400 }
        );
      }

      // Cria a linha inicial de configurações do proprietário
      await supabase.from("user_settings").upsert({
        user_id: signUpData.user.id,
        username: cleanUser,
        theme_mode: "tradicional"
      });

      return NextResponse.json({
        status: "success",
        user: {
          id: signUpData.user.id,
          username: cleanUser,
          avatarUrl: ""
        }
      });
    }

    // 3. LOGIN
    if (action === "login") {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: rawPass
      });

      if (signInError || !signInData.user) {
        return NextResponse.json(
          { status: "error", message: "Usuário ou senha incorretos." },
          { status: 401 }
        );
      }

      const { data: settings } = await supabase
        .from("user_settings")
        .select("username, avatar_url")
        .eq("user_id", signInData.user.id)
        .maybeSingle();

      const displayUsername =
        settings?.username ||
        signInData.user.user_metadata?.username ||
        cleanUser;

      return NextResponse.json({
        status: "success",
        user: {
          id: signInData.user.id,
          username: displayUsername,
          avatarUrl: settings?.avatar_url || ""
        }
      });
    }

    return NextResponse.json({ status: "error", message: "Ação inválida." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: `Erro interno: ${err?.message || "Falha inesperada"}` },
      { status: 500 }
    );
  }
}