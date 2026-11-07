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

export interface StravaActivityItem {
  id: string;
  name: string;
  type: string;
  date: string;              // DD-MM-YYYY
  isoDate: string;           // YYYY-MM-DD
  startTime: string;         // HH:mm
  distanceKm: number;
  movingTimeSec: number;
  elapsedTimeSec: number;
  durationMin: number;
  movingTimeMin: number;
  paceSecondsPerKm: number;
  pace: string;              // M:SS /km
  avgSpeedKmh: number;
  elevationGain: number;
  averageHeartrate?: number;
  maxHeartrate?: number;
  calories: number;
  splitsMetric?: any[];
  isSyntheticSummary?: boolean;
}

function formatPace(movingTimeSec: number, distanceM: number): string {
  if (!distanceM || distanceM <= 0 || !movingTimeSec || movingTimeSec <= 0) return "—";
  const secPerKm = movingTimeSec / (distanceM / 1000);
  let minutes = Math.floor(secPerKm / 60);
  let seconds = Math.round(secPerKm % 60);
  if (seconds >= 60) {
    minutes += 1;
    seconds = 0;
  }
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds} /km`;
}

function parseStravaIsoDate(isoString?: string | null): { dateBR: string; isoDate: string; startTime: string } {
  if (!isoString) return { dateBR: "", isoDate: "", startTime: "00:00" };
  const raw = isoString.trim();
  const dateMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    const y = dateMatch[1];
    const m = dateMatch[2];
    const d = dateMatch[3];
    const isoDate = `${y}-${m}-${d}`;
    const dateBR = `${d}-${m}-${y}`;
    let startTime = "00:00";
    const timeMatch = raw.match(/T(\d{2}:\d{2})/);
    if (timeMatch) {
      startTime = timeMatch[1];
    } else {
      const spaceTime = raw.match(/\s(\d{2}:\d{2})/);
      if (spaceTime) startTime = spaceTime[1];
    }
    return { dateBR, isoDate, startTime };
  }
  return { dateBR: "", isoDate: "", startTime: "00:00" };
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

    // 2. Busca paralela de perfil e estatísticas do atleta
    const athletePromise = fetch("https://www.strava.com/api/v3/athlete", {
      headers,
      signal: AbortSignal.timeout(8000)
    })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

    const statsPromise = resolvedAthleteId
      ? fetch(`https://www.strava.com/api/v3/athletes/${resolvedAthleteId}/stats`, {
          headers,
          signal: AbortSignal.timeout(8000)
        })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      : null;

    // 3. Ingestão Paginada de Corridas Individuais (Sprint 51: per_page=200 page=1 e page=2)
    let rawActivities: any[] = [];
    let isScopeRestricted = false;

    try {
      const page1Res = await fetch(
        "https://www.strava.com/api/v3/athlete/activities?per_page=200&page=1",
        {
          headers,
          signal: AbortSignal.timeout(9000)
        }
      );

      if (!page1Res.ok) {
        if (page1Res.status === 401 || page1Res.status === 403) {
          isScopeRestricted = true;
        }
      } else {
        const page1Data = await page1Res.json().catch(() => []);
        if (Array.isArray(page1Data)) {
          rawActivities = page1Data;
          // Se página 1 trouxe 200 itens, busca também a página 2 para cobrir todo o ano
          if (page1Data.length === 200) {
            try {
              const page2Res = await fetch(
                "https://www.strava.com/api/v3/athlete/activities?per_page=200&page=2",
                {
                  headers,
                  signal: AbortSignal.timeout(9000)
                }
              );
              if (page2Res.ok) {
                const page2Data = await page2Res.json().catch(() => []);
                if (Array.isArray(page2Data) && page2Data.length > 0) {
                  rawActivities = [...page1Data, ...page2Data];
                }
              }
            } catch (errPage2) {
              console.warn("Strava page 2 fetch timeout/warning, mantendo page 1:", errPage2);
            }
          }
        }
      }
    } catch (actErr) {
      console.warn("Erro ao buscar athlete/activities no Strava:", actErr);
    }

    const [athleteData, initialStatsData] = await Promise.all([athletePromise, statsPromise]);

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

    // 4. Monta resumo de estatísticas oficiais
    const stats = {
      ytdKm: statsData?.ytd_run_totals?.distance ? +(statsData.ytd_run_totals.distance / 1000).toFixed(1) : 0,
      ytdRuns: statsData?.ytd_run_totals?.count ?? 0,
      allTimeKm: statsData?.all_run_totals?.distance ? +(statsData.all_run_totals.distance / 1000).toFixed(1) : 0,
      allTimeRuns: statsData?.all_run_totals?.count ?? 0,
      lastSync: new Date().toISOString()
    };

    // 5. Mapeamento Rico de Cada Corrida Individual (Sprint 51)
    let activities: StravaActivityItem[] = [];
    let scopeMode: "detailed" | "read_only" = "detailed";
    let scopeStatus: "full_access" | "needs_activity_scope" = "full_access";

    if (rawActivities.length > 0) {
      scopeMode = "detailed";
      scopeStatus = "full_access";

      activities = rawActivities.map((act) => {
        const distMeters = Number(act.distance || 0);
        const distKm = +(distMeters / 1000).toFixed(2);
        const movingTimeSec = Math.round(Number(act.moving_time || act.elapsed_time || 0));
        const elapsedTimeSec = Math.round(Number(act.elapsed_time || act.moving_time || 0));
        const durationMin = +(movingTimeSec / 60).toFixed(1);
        const movingTimeMin = Math.round(movingTimeSec / 60);
        const paceSecondsPerKm = distKm > 0 ? Math.round(movingTimeSec / distKm) : 0;
        const pace = formatPace(movingTimeSec, distMeters);
        const avgSpeedKmh = movingTimeSec > 0 ? +((distKm / (movingTimeSec / 3600))).toFixed(1) : 0;
        const elevationGain = Math.round(Number(act.total_elevation_gain || 0));
        const averageHeartrate = act.average_heartrate ? Math.round(Number(act.average_heartrate)) : undefined;
        const maxHeartrate = act.max_heartrate ? Math.round(Number(act.max_heartrate)) : undefined;
        const calories = Math.round(Number(act.calories || (act.kilojoules ? act.kilojoules * 1.05 : distKm * 65)));
        const splitsMetric = Array.isArray(act.splits_metric) ? act.splits_metric : undefined;

        const { dateBR, isoDate, startTime } = parseStravaIsoDate(act.start_date_local || act.start_date);

        return {
          id: String(act.id),
          name: act.name || "Corrida",
          type: act.sport_type || act.type || "Run",
          date: dateBR,
          isoDate,
          startTime,
          distanceKm: distKm,
          movingTimeSec,
          elapsedTimeSec,
          durationMin,
          movingTimeMin,
          paceSecondsPerKm,
          pace,
          avgSpeedKmh,
          elevationGain,
          averageHeartrate,
          maxHeartrate,
          calories,
          splitsMetric,
          isSyntheticSummary: false
        };
      });
    } else {
      // Escopo restrito detectado (token não possui activity:read ou activity:read_all)
      scopeMode = "read_only";
      scopeStatus = "needs_activity_scope";
      const now = new Date();

      // Distribuição semanal sintética de alta fidelidade para não quebrar gráficos
      if (statsData?.recent_run_totals && statsData.recent_run_totals.count > 0) {
        const r = statsData.recent_run_totals;
        const totalDist = r.distance / 1000;
        const weeks = Math.min(4, Math.max(1, r.count));
        const distPerWeek = +(totalDist / weeks).toFixed(2);
        const timePerWeekSec = Math.round(r.moving_time / weeks);

        for (let i = 0; i < weeks; i++) {
          const d = new Date(now.getTime() - i * 7 * 86400000);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          activities.push({
            id: `synth-week-${i}`,
            name: `Semana Recente #${weeks - i} (Resumo)`,
            type: "Run",
            date: `${day}-${m}-${y}`,
            isoDate: `${y}-${m}-${day}`,
            startTime: "08:00",
            distanceKm: distPerWeek,
            movingTimeSec: timePerWeekSec,
            elapsedTimeSec: timePerWeekSec,
            durationMin: +(timePerWeekSec / 60).toFixed(1),
            movingTimeMin: Math.round(timePerWeekSec / 60),
            paceSecondsPerKm: distPerWeek > 0 ? Math.round(timePerWeekSec / distPerWeek) : 0,
            pace: formatPace(timePerWeekSec, distPerWeek * 1000),
            avgSpeedKmh: timePerWeekSec > 0 ? +((distPerWeek / (timePerWeekSec / 3600))).toFixed(1) : 0,
            elevationGain: Math.round((r.elevation_gain || 0) / weeks),
            calories: Math.round(distPerWeek * 65),
            isSyntheticSummary: true
          });
        }
      }
    }

    // 6. Monta URL de Autorização OAuth2 com escopo completo estrito
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
    const fullScope = "read,activity:read,activity:read_all,profile:read_all";
    const oauthUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
      callbackUrl
    )}&approval_prompt=force&scope=${encodeURIComponent(fullScope)}&state=${encodeURIComponent(stateEncoded)}`;

    return NextResponse.json(
      {
        ok: true,
        athlete: athleteData || null,
        stats,
        activities,
        totalActivities: activities.length,
        newRefreshToken,
        scopeMode,
        scopeStatus,
        oauthUrl,
        oauthUpgradeUrl: oauthUrl,
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
      version: "2.0.0",
      endpoints: {
        post: "/api/strava (recebe credenciais e sincroniza até 400 corridas individuais paginadas)",
        callback: "/api/strava/callback (callback do fluxo OAuth2 com escopos completos)"
      }
    },
    { status: 200 }
  );
}
