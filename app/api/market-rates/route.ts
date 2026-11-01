import { NextResponse } from "next/server";

interface BcbSgsResponseItem {
  data: string;
  valor: string;
}

export interface MarketRatesResponse {
  cdiAnnualRate: number;
  dailyFactor252: number;
  updatedAt: string;
  source: string;
}

const FALLBACK_CDI_ANNUAL = 12.15;
const FALLBACK_DAILY_FACTOR = Math.pow(1 + FALLBACK_CDI_ANNUAL / 100, 1 / 252) - 1;

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    // Série 4389: Taxa de juros - CDI anualizada base 252
    const res = await fetch(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.4389/dados/ultimos/1?formato=json",
      {
        signal: controller.signal,
        next: { revalidate: 3600 },
        headers: {
          Accept: "application/json"
        }
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`BCB SGS respondeu com status ${res.status}`);
    }

    const data = (await res.json()) as BcbSgsResponseItem[];
    if (!Array.isArray(data) || data.length === 0 || !data[0]?.valor) {
      throw new Error("Formato inesperado na resposta do BCB SGS");
    }

    const parsedRate = parseFloat(data[0].valor.replace(",", "."));
    const cdiAnnualRate = !isNaN(parsedRate) && parsedRate > 0 ? parsedRate : FALLBACK_CDI_ANNUAL;
    const dailyFactor252 = Math.pow(1 + cdiAnnualRate / 100, 1 / 252) - 1;

    const payload: MarketRatesResponse = {
      cdiAnnualRate,
      dailyFactor252,
      updatedAt: data[0].data || new Date().toISOString(),
      source: "BCB-SGS"
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400"
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    // Fallback seguro em caso de indisponibilidade da API do Banco Central ou offline
    const payload: MarketRatesResponse = {
      cdiAnnualRate: FALLBACK_CDI_ANNUAL,
      dailyFactor252: FALLBACK_DAILY_FACTOR,
      updatedAt: new Date().toISOString(),
      source: `BCB-SGS (Fallback Offline: ${message})`
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }
}
