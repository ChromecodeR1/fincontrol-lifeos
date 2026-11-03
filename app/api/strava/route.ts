import { NextResponse } from "next/server";

interface StravaTokenResponse {
  token_type: string;
  access_token: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  athlete?: {
    id: number;
    username?: string;
    firstname?: string;
    lastname?: string;
    city?: string;
    country?: string;
    profile_medium?: string;
    profile?: string;
  };
}

interface StravaTotals {
  count: number;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  elevation_gain: number;
  achievement_count?: number;
}

interface StravaStatsResponse {
  recent_run_totals?: StravaTotals;
  all_run_totals?: StravaTotals;
  ytd_run_totals?: StravaTotals;
  recent_ride_totals?: StravaTotals;
  all_ride_totals?: StravaTotals;
  ytd_ride_totals?: StravaTotals;
}

interface RawStravaActivity {
  id: number | string;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time?: number;
  total_elevation_gain?: number;
  type?: string;
  sport_type?: string;
  start_date: string;
  start_date_local?: string;
  calories?: number;
  average_speed?: number;
  max_speed?: number;
}

function formatPace(movingTimeSec: number, distanceM: number): string {
  if (!distanceM || distanceM <= 0 || !movingTimeSec || movingTimeSec <= 0) return "—";
  const secPerKm = movingTimeSec / (distanceM / 1000);
  let minutes = Math.floor(secPerKm / 60);
  let seconds = Math.round(secPerKm % 60);
  if (seconds === 60) {
    minutes += 1;
    seconds = 0;
  }
  if (minutes > 30 || minutes < 2) return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}/km`;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}/km`;
}

function formatDateToBR(isoString: string): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString.slice(0, 10);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return isoString.slice(0, 10);
  }
}

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const athleteId = (body.athleteId || process.env.STRAVA_ATHLETE_ID || "").toString().trim();
    const clientId = (body.clientId || process.env.STRAVA_CLIENT_ID || "").toString().trim();
    const clientSecret = (body.clientSecret || process.env.STRAVA_CLIENT_SECRET || "").toString().trim();
    const refreshToken = (body.refreshToken || process.env.STRAVA_REFRESH_TOKEN || "").toString().trim();

    if (!clientId || !clientSecret || !refreshToken) {
      return NextResponse.json(
        { ok: false, error: "Preencha Client ID, Client Secret e Refresh Token." },
        { status: 400 }
      );
    }

    // 1. Renovação OAuth2 (POST https://www.strava.com/oauth/token) com timeout de 8000ms
    let tokenRes: Response;
    try {
      tokenRes = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token"
        }),
        signal: AbortSignal.timeout(8000)
      });
    } catch (fetchErr: any) {
      console.error("Erro na chamada de renovação Strava OAuth2:", fetchErr);
      return NextResponse.json(
        { ok: false, error: "Timeout ou falha de conexão com os servidores do Strava. Tente novamente." },
        { status: 504 }
      );
    }

    if (!tokenRes.ok) {
      const errData = await tokenRes.json().catch(() => ({}));
      console.error("Strava recusou credenciais:", errData);
      return NextResponse.json(
        {
          ok: false,
          error: `Credenciais ou Refresh Token recusados pelo Strava. Verifique o Client ID (${clientId || "293414"}), Client Secret e Refresh Token.`
        },
        { status: 401 }
      );
    }

    const tokenData: StravaTokenResponse = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const newRefreshToken = tokenData.refresh_token || refreshToken;
    let resolvedAthleteId = athleteId || String(tokenData.athlete?.id || "");

    const headers = { Authorization: `Bearer ${accessToken}` };

    // 2. Busca paralela: Perfil (/athlete) e Atividades (/athlete/activities)
    const athletePromise = fetch("https://www.strava.com/api/v3/athlete", {
      headers,
      signal: AbortSignal.timeout(8000)
    })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

    const activitiesPromise = fetch("https://www.strava.com/api/v3/athlete/activities?per_page=30", {
      headers,
      signal: AbortSignal.timeout(8000)
    }).catch(() => null);

    // Se resolvedAthleteId já for conhecido, busca stats em paralelo
    const statsPromise = resolvedAthleteId
      ? fetch(`https://www.strava.com/api/v3/athletes/${resolvedAthleteId}/stats`, {
          headers,
          signal: AbortSignal.timeout(8000)
        })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      : null;

    const [athleteData, activitiesRes, initialStatsData] = await Promise.all([
      athletePromise,
      activitiesPromise,
      statsPromise
    ]);

    // Se não tínhamos o athleteId antes, resolvemos agora a partir do perfil
    let statsData: StravaStatsResponse | null = initialStatsData;
    if (!resolvedAthleteId && athleteData?.id) {
      resolvedAthleteId = String(athleteData.id);
      statsData = await fetch(`https://www.strava.com/api/v3/athletes/${resolvedAthleteId}/stats`, {
        headers,
        signal: AbortSignal.timeout(8000)
      })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
    }

    // 3. Monta resumo de estatísticas oficiais
    const stats = {
      ytdKm: statsData?.ytd_run_totals?.distance ? +(statsData.ytd_run_totals.distance / 1000).toFixed(1) : 0,
      ytdRuns: statsData?.ytd_run_totals?.count ?? 0,
      allTimeKm: statsData?.all_run_totals?.distance ? +(statsData.all_run_totals.distance / 1000).toFixed(1) : 0,
      allTimeRuns: statsData?.all_run_totals?.count ?? 0,
      lastSync: new Date().toISOString()
    };

    // 4. Mapeamento Inteligente de Atividades (Compatível com escopo read e activity:read_all)
    let activities: any[] = [];
    let scopeMode: "detailed" | "read_only" = "detailed";

    if (activitiesRes && activitiesRes.ok) {
      const rawActivities: RawStravaActivity[] = await activitiesRes.json().catch(() => []);
      if (Array.isArray(rawActivities) && rawActivities.length > 0) {
        activities = rawActivities.map((act) => {
          const distMeters = act.distance || 0;
          const distKm = +(distMeters / 1000).toFixed(2);
          const movingTimeMin = Math.round((act.moving_time || 0) / 60);
          const elevationGain = Math.round(act.total_elevation_gain || 0);
          const pace = formatPace(act.moving_time || 0, distMeters);
          const calories = act.calories ? Math.round(act.calories) : Math.round(distKm * 65);
          return {
            id: String(act.id),
            name: act.name || "Corrida Strava",
            type: act.type || act.sport_type || "Run",
            date: formatDateToBR(act.start_date_local || act.start_date),
            distanceKm: distKm,
            movingTimeMin,
            pace,
            elevationGain,
            calories
          };
        });
      } else {
        activities = [];
      }
    } else {
      // Se activitiesRes for 401 ou 403 (ou falhar por escopo "read"), não lança erro!
      // Constrói cards consolidados a partir de statsData reais:
      scopeMode = "read_only";
      const currentYear = new Date().getFullYear();

      if (statsData?.recent_run_totals && statsData.recent_run_totals.count > 0) {
        const r = statsData.recent_run_totals;
        const distKm = +(r.distance / 1000).toFixed(2);
        activities.push({
          id: "recent-runs",
          name: `Corridas Recentes (${r.count} treinos nas últimas 4 semanas)`,
          type: "Run",
          date: "Últimas 4 Semanas",
          distanceKm: distKm,
          movingTimeMin: Math.round(r.moving_time / 60),
          pace: formatPace(r.moving_time, r.distance),
          elevationGain: Math.round(r.elevation_gain || 0),
          calories: Math.round(distKm * 65)
        });
      }

      if (statsData?.ytd_run_totals && statsData.ytd_run_totals.count > 0) {
        const y = statsData.ytd_run_totals;
        const distKm = +(y.distance / 1000).toFixed(2);
        activities.push({
          id: "ytd-runs",
          name: `Acumulado no Ano (${y.count} corridas em ${currentYear})`,
          type: "Run",
          date: `Ano ${currentYear}`,
          distanceKm: distKm,
          movingTimeMin: Math.round(y.moving_time / 60),
          pace: formatPace(y.moving_time, y.distance),
          elevationGain: Math.round(y.elevation_gain || 0),
          calories: Math.round(distKm * 65)
        });
      }

      if (statsData?.all_run_totals && statsData.all_run_totals.count > 0) {
        const a = statsData.all_run_totals;
        const distKm = +(a.distance / 1000).toFixed(2);
        activities.push({
          id: "all-runs",
          name: `Histórico Total no Strava (${a.count} corridas)`,
          type: "Run",
          date: "Histórico Total",
          distanceKm: distKm,
          movingTimeMin: Math.round(a.moving_time / 60),
          pace: formatPace(a.moving_time, a.distance),
          elevationGain: Math.round(a.elevation_gain || 0),
          calories: Math.round(distKm * 65)
        });
      }
    }

    // 5. Monta URL de Autorização OAuth2 com escopo completo "activity:read_all"
    const hostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const protoHeader = request.headers.get("x-forwarded-proto") || (hostHeader.includes("localhost") ? "http" : "https");
    const origin = `${protoHeader}://${hostHeader}`;
    const callbackUrl = `${origin}/api/strava/callback`;

    const statePayload = JSON.stringify({
      clientId,
      clientSecret,
      athleteId: resolvedAthleteId
    });
    const stateEncoded = Buffer.from(statePayload, "utf-8").toString("base64");
    const oauthUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
      callbackUrl
    )}&approval_prompt=force&scope=read,activity:read_all&state=${encodeURIComponent(stateEncoded)}`;

    return NextResponse.json(
      {
        ok: true,
        athlete: athleteData || null,
        stats,
        activities,
        newRefreshToken,
        scopeMode,
        oauthUrl,
        syncedAt: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (err: any) {
    if (err?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw err;
    }
    console.error("Erro interno no /api/strava:", err);
    return NextResponse.json(
      {
        ok: false,
        error: `Erro interno no servidor Strava: ${err?.message || "Erro desconhecido"}`
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "Coindex Strava API Proxy",
      version: "1.0.0",
      endpoints: {
        post: "/api/strava (recebe credenciais e sincroniza dados com o Strava)",
        callback: "/api/strava/callback (callback do fluxo OAuth2 com escopo activity:read_all)"
      }
    },
    { status: 200 }
  );
}
