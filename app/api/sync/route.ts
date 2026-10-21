import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryUrl = searchParams.get("url");
    const envUrl = process.env.GOOGLE_SHEETS_URL;
    const targetUrl = queryUrl ? queryUrl.trim() : envUrl ? envUrl.trim() : "";

    if (!targetUrl) {
      return NextResponse.json(
        { status: "error", message: "Nenhuma URL informada. Cole a URL do Google Apps Script antes de sincronizar." },
        { status: 400 }
      );
    }

    if (!targetUrl.startsWith("https://script.google.com/macros/s/") || !targetUrl.endsWith("/exec")) {
      return NextResponse.json(
        {
          status: "error",
          message: "Formato de URL inválido. A URL precisa começar com 'https://script.google.com/macros/s/' e terminar com '/exec' (não use o link terminado em /dev ou o link normal da planilha)."
        },
        { status: 400 }
      );
    }

    const res = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      headers: { Accept: "application/json" }
    });

    const rawText = await res.text();

    if (rawText.trim().startsWith("<!DOCTYPE html") || rawText.includes("<html")) {
      return NextResponse.json(
        {
          status: "error",
          message: "O Google bloqueou o acesso (retornou uma página de login HTML). Lá no Apps Script, vá em 'Implantar > Nova implantação' e mude 'Quem tem acesso' para 'Qualquer pessoa'."
        },
        { status: 403 }
      );
    }

    try {
      const data = JSON.parse(rawText);
      if (data.status === "error") {
        return NextResponse.json({ status: "error", message: data.message || "Erro retornado pelo script da planilha." }, { status: 400 });
      }
      return NextResponse.json(data);
    } catch {
      return NextResponse.json(
        { status: "error", message: `A planilha não retornou um JSON válido. Resposta recebida: ${rawText.slice(0, 120)}` },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: `Falha de conexão com o Google Sheets: ${err?.message || "Erro desconhecido"}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const envUrl = process.env.GOOGLE_SHEETS_URL;
    const targetUrl = body.sheetApiUrl ? String(body.sheetApiUrl).trim() : envUrl ? envUrl.trim() : "";

    if (!targetUrl) {
      return NextResponse.json(
        { status: "error", message: "URL do Google Sheets está vazia." },
        { status: 400 }
      );
    }

    if (!targetUrl.startsWith("https://script.google.com/macros/s/") || !targetUrl.endsWith("/exec")) {
      return NextResponse.json(
        { status: "error", message: "URL inválida. Certifique-se de que ela termina em '/exec'." },
        { status: 400 }
      );
    }

    const res = await fetch(targetUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body.payload)
    });

    const rawText = await res.text();

    if (rawText.trim().startsWith("<!DOCTYPE html") || rawText.includes("<html")) {
      return NextResponse.json(
        {
          status: "error",
          message: "Permissão negada ao gravar na planilha (HTML recebido). Verifique se a implantação do Apps Script possui a função doPost(e) e está aberta para 'Qualquer pessoa'."
        },
        { status: 403 }
      );
    }

    try {
      const data = JSON.parse(rawText);
      if (data.status === "error") {
        return NextResponse.json({ status: "error", message: data.message }, { status: 400 });
      }
      return NextResponse.json(data);
    } catch {
      return NextResponse.json(
        { status: "error", message: `Erro ao interpretar resposta de gravação da planilha: ${rawText.slice(0, 120)}` },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: `Falha ao enviar lançamentos para o Google Sheets: ${err?.message || "Erro de rede"}` },
      { status: 500 }
    );
  }
}