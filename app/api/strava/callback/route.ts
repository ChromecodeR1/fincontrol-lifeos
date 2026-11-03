import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const errorParam = url.searchParams.get("error");
    const stateParam = url.searchParams.get("state");

    let clientId = url.searchParams.get("clientId") || process.env.STRAVA_CLIENT_ID || "";
    let clientSecret = url.searchParams.get("clientSecret") || process.env.STRAVA_CLIENT_SECRET || "";
    let athleteId = url.searchParams.get("athleteId") || process.env.STRAVA_ATHLETE_ID || "";

    // Decodifica estado se fornecido
    if (stateParam) {
      try {
        const decoded = JSON.parse(Buffer.from(stateParam, "base64").toString("utf-8"));
        if (decoded.clientId && !clientId) clientId = decoded.clientId;
        if (decoded.clientSecret && !clientSecret) clientSecret = decoded.clientSecret;
        if (decoded.athleteId && !athleteId) athleteId = decoded.athleteId;
      } catch {
        // Ignora se não for JSON base64 válido
      }
    }

    if (errorParam) {
      return renderHtmlResponse({
        success: false,
        title: "Autorização Cancelada",
        message: `O Strava retornou o erro: "${errorParam}". Você pode fechar esta janela e tentar novamente.`
      });
    }

    if (!code) {
      return renderHtmlResponse({
        success: false,
        title: "Código Ausente",
        message: "Nenhum código de autorização foi enviado pelo Strava."
      });
    }

    if (!clientId || !clientSecret) {
      return renderHtmlResponse({
        success: false,
        title: "Credenciais Ausentes",
        message:
          "Client ID e Client Secret não foram detectados. Por favor, volte ao Coindex e certifique-se de preencher o Client ID e Client Secret na aba Configurações > Strava."
      });
    }

    // Troca o código pelo token permanente com os novos escopos
    const tokenRes = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code"
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.json().catch(() => ({}));
      return renderHtmlResponse({
        success: false,
        title: "Falha na Troca do Token",
        message: `O Strava não aceitou o código de autorização. Detalhes: ${
          errData?.message || JSON.stringify(errData) || "Erro 400/401"
        }`
      });
    }

    const tokenData = await tokenRes.json();
    const newRefreshToken = tokenData.refresh_token || "";
    const athlete = tokenData.athlete;
    const athleteName = athlete
      ? `${athlete.firstname || ""} ${athlete.lastname || ""}`.trim() || athlete.username || "Atleta"
      : "Atleta";
    const resolvedAthleteId = athlete?.id ? String(athlete.id) : athleteId;

    return renderHtmlResponse({
      success: true,
      title: "Strava Conectado com Sucesso!",
      athleteName,
      athleteAvatar: athlete?.profile_medium || athlete?.profile || "",
      newRefreshToken,
      athleteId: resolvedAthleteId,
      clientId,
      clientSecret
    });
  } catch (err: any) {
    if (err?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw err;
    }
    console.error("Erro no callback Strava:", err);
    return renderHtmlResponse({
      success: false,
      title: "Erro no Servidor",
      message: `Ocorreu uma falha no processamento do callback: ${err?.message || "Erro desconhecido"}`
    });
  }
}

function renderHtmlResponse(options: {
  success: boolean;
  title: string;
  message?: string;
  athleteName?: string;
  athleteAvatar?: string;
  newRefreshToken?: string;
  athleteId?: string;
  clientId?: string;
  clientSecret?: string;
}) {
  const {
    success,
    title,
    message,
    athleteName,
    athleteAvatar,
    newRefreshToken,
    athleteId,
    clientId,
    clientSecret
  } = options;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — Coindex LifeOS</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0B0E14;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      -webkit-font-smoothing: antialiased;
    }
    .card {
      background: #131824;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 28px;
      padding: 36px 32px;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
      text-align: center;
      animation: popIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.96) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 20px;
      background: ${success ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)"};
      color: ${success ? "#10B981" : "#F43F5E"};
      border: 1px solid ${success ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)"};
    }
    .avatar-wrapper {
      margin: 0 auto 18px;
      position: relative;
      width: 76px;
      height: 76px;
    }
    .avatar {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #F97316;
      box-shadow: 0 0 24px rgba(249, 115, 22, 0.35);
    }
    .avatar-fallback {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: linear-gradient(135deg, #F97316, #EA580C);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      color: #FFF;
      box-shadow: 0 0 24px rgba(249, 115, 22, 0.35);
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
      color: #FFFFFF;
    }
    p {
      font-size: 13px;
      color: #94A3B8;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .token-box {
      background: #0B0E14;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 12px 14px;
      margin-bottom: 20px;
      text-align: left;
    }
    .token-label {
      font-size: 11px;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
      display: block;
      margin-bottom: 6px;
    }
    .token-val {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: #F97316;
      word-break: break-all;
      background: rgba(249, 115, 22, 0.08);
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid rgba(249, 115, 22, 0.2);
    }
    .btn-group {
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    .btn {
      cursor: pointer;
      border: none;
      border-radius: 14px;
      padding: 12px 22px;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
    }
    .btn-primary {
      background: linear-gradient(135deg, #F97316, #EA580C);
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
    }
    .btn-primary:hover {
      background: linear-gradient(135deg, #FB923C, #F97316);
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      color: #E2E8F0;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .notice {
      font-size: 11px;
      color: #10B981;
      margin-top: 14px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      ${success ? "✓ Conexão Ativa" : "✕ Erro de Conexão"}
    </div>

    ${
      success
        ? `
      <div class="avatar-wrapper">
        ${
          athleteAvatar
            ? `<img src="${athleteAvatar}" alt="${athleteName}" class="avatar" />`
            : `<div class="avatar-fallback">🏃</div>`
        }
      </div>
      <h1>Olá, ${athleteName}!</h1>
      <p>Sua conta do <strong>Strava</strong> foi autorizada com permissões completas (<code>activity:read_all</code>). Agora você poderá visualizar cada uma das suas 30 corridas detalhadas!</p>

      <div class="token-box">
        <span class="token-label">Novo Refresh Token (Escopo Completo):</span>
        <div class="token-val" id="tokenText">${newRefreshToken}</div>
      </div>

      <div class="btn-group">
        <button class="btn btn-secondary" onclick="copyToken()">📋 Copiar Token</button>
        <button class="btn btn-primary" onclick="returnToCoindex()">⚡ Voltar ao Coindex</button>
      </div>
      <div class="notice" id="autoCloseNotice">Redirecionando de volta ao painel em 3 segundos...</div>
    `
        : `
      <h1>${title}</h1>
      <p>${message || "Não foi possível autorizar o Strava."}</p>
      <div class="btn-group">
        <button class="btn btn-secondary" onclick="returnToCoindex()">Fechar Janela</button>
      </div>
    `
    }
  </div>

  <script>
    const newRefreshToken = "${newRefreshToken || ""}";
    const athleteId = "${athleteId || ""}";
    const clientId = "${clientId || ""}";
    const clientSecret = "${clientSecret || ""}";
    const success = ${success ? "true" : "false"};

    function copyToken() {
      if (!newRefreshToken) return;
      navigator.clipboard.writeText(newRefreshToken).then(() => {
        alert("Refresh Token copiado com sucesso!");
      });
    }

    function returnToCoindex() {
      if (window.opener && !window.opener.closed) {
        window.close();
      } else {
        window.location.href = "/";
      }
    }

    if (success && newRefreshToken) {
      try {
        // Envia mensagem via postMessage para a janela mãe do Coindex
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: "STRAVA_AUTH_SUCCESS",
            refreshToken: newRefreshToken,
            athleteId: athleteId
          }, "*");
        }

        // Salva também no localStorage para sincronização persistida
        try {
          const raw = localStorage.getItem("lifeos_strava_config");
          const existing = raw ? JSON.parse(raw) : {};
          const updated = {
            ...existing,
            refreshToken: newRefreshToken,
            athleteId: athleteId || existing.athleteId || "",
            clientId: clientId || existing.clientId || "",
            clientSecret: clientSecret || existing.clientSecret || ""
          };
          localStorage.setItem("lifeos_strava_config", JSON.stringify(updated));
        } catch (e) {
          console.warn("Não foi possível acessar localStorage:", e);
        }

        // Auto-close após 3.5 segundos se janela aberta via popup
        setTimeout(() => {
          if (window.opener && !window.opener.closed) {
            window.close();
          }
        }, 3500);
      } catch (err) {
        console.error(err);
      }
    }
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: success ? 200 : 400,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate"
    }
  });
}
