import { NextResponse } from "next/server";

export interface TickerHistoryPoint {
  time: string;
  price: number;
}

export interface MarketTickerItem {
  symbol: string;
  name: string;
  priceBRL: number;
  change24hPct: number;
  high24h: number;
  low24h: number;
  history: TickerHistoryPoint[];
}

export interface MarketPulseResponse {
  updatedAt: string;
  tickers: {
    BTC: MarketTickerItem;
    BNB: MarketTickerItem;
    ETH: MarketTickerItem;
    SOL: MarketTickerItem;
    USD: MarketTickerItem;
    EUR: MarketTickerItem;
    CDI: MarketTickerItem;
    IBOV: MarketTickerItem;
  };
}

// Fallback realista caso APIs externas estejam offline ou sob rate-limit
function generateFallbackHistory(basePrice: number, volatilityPct = 0.03, count = 30): TickerHistoryPoint[] {
  const points: TickerHistoryPoint[] = [];
  const now = new Date();
  let current = basePrice * (1 - volatilityPct * 2);

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    const factor = 1 + (Math.sin(i * 0.45) * volatilityPct * 0.5 + (Math.cos(i * 0.3) * 0.01));
    current = Math.round(basePrice * factor * 100) / 100;
    points.push({ time: dayStr, price: current });
  }
  return points;
}

const FALLBACK_TICKERS: Record<string, MarketTickerItem> = {
  BTC: {
    symbol: "BTC",
    name: "Bitcoin",
    priceBRL: 435800.0,
    change24hPct: 2.45,
    high24h: 442500.0,
    low24h: 426100.0,
    history: generateFallbackHistory(435800, 0.04)
  },
  BNB: {
    symbol: "BNB",
    name: "BNB Chain",
    priceBRL: 3750.5,
    change24hPct: 1.15,
    high24h: 3820.0,
    low24h: 3690.0,
    history: generateFallbackHistory(3750.5, 0.03)
  },
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    priceBRL: 16850.0,
    change24hPct: -0.85,
    high24h: 17200.0,
    low24h: 16500.0,
    history: generateFallbackHistory(16850, 0.035)
  },
  SOL: {
    symbol: "SOL",
    name: "Solana",
    priceBRL: 1045.2,
    change24hPct: 4.8,
    high24h: 1080.0,
    low24h: 990.0,
    history: generateFallbackHistory(1045.2, 0.05)
  },
  USD: {
    symbol: "USD",
    name: "Dólar Comercial",
    priceBRL: 5.74,
    change24hPct: 0.35,
    high24h: 5.78,
    low24h: 5.71,
    history: generateFallbackHistory(5.74, 0.015)
  },
  EUR: {
    symbol: "EUR",
    name: "Euro",
    priceBRL: 6.22,
    change24hPct: -0.12,
    high24h: 6.26,
    low24h: 6.19,
    history: generateFallbackHistory(6.22, 0.015)
  },
  CDI: {
    symbol: "CDI",
    name: "CDI 115% (Nubank/Caixinha)",
    priceBRL: 13.97,
    change24hPct: 0.05,
    high24h: 14.15,
    low24h: 13.85,
    history: generateFallbackHistory(13.97, 0.005)
  },
  IBOV: {
    symbol: "IBOV",
    name: "Ibovespa",
    priceBRL: 129400.0,
    change24hPct: 0.72,
    high24h: 130200.0,
    low24h: 128600.0,
    history: generateFallbackHistory(129400, 0.02)
  }
};

export async function GET() {
  const resultTickers: Record<string, MarketTickerItem> = { ...FALLBACK_TICKERS };

  try {
    const cryptoSymbols = [
      { key: "BTC", binancePair: "BTCBRL", name: "Bitcoin" },
      { key: "BNB", binancePair: "BNBBRL", name: "BNB Chain" },
      { key: "ETH", binancePair: "ETHBRL", name: "Ethereum" },
      { key: "SOL", binancePair: "SOLBRL", name: "Solana" }
    ];

    const cryptoPromises = cryptoSymbols.map(async (c) => {
      try {
        const [tickerRes, klinesRes] = await Promise.all([
          fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${c.binancePair}`, {
            signal: AbortSignal.timeout(4500),
            next: { revalidate: 60 },
            headers: { Accept: "application/json" }
          }),
          fetch(`https://api.binance.com/api/v3/klines?symbol=${c.binancePair}&interval=1d&limit=30`, {
            signal: AbortSignal.timeout(4500),
            next: { revalidate: 60 },
            headers: { Accept: "application/json" }
          })
        ]);

        if (tickerRes.ok) {
          const tData = (await tickerRes.json()) as Record<string, unknown>;
          const price = parseFloat(String(tData.lastPrice || 0));
          const changePct = parseFloat(String(tData.priceChangePercent || 0));
          const high = parseFloat(String(tData.highPrice || 0));
          const low = parseFloat(String(tData.lowPrice || 0));

          let history = resultTickers[c.key].history;
          if (klinesRes.ok) {
            const kData = (await klinesRes.json()) as Array<Array<string | number>>;
            if (Array.isArray(kData) && kData.length > 0) {
              history = kData.map((k) => {
                const ts = Number(k[0]);
                const d = new Date(ts);
                const dayStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
                return {
                  time: dayStr,
                  price: parseFloat(String(k[4])) || price
                };
              });
            }
          }

          if (price > 0) {
            resultTickers[c.key] = {
              symbol: c.key,
              name: c.name,
              priceBRL: price,
              change24hPct: changePct,
              high24h: high || price * 1.02,
              low24h: low || price * 0.98,
              history
            };
          }
        }
      } catch (err) {
        console.warn(`[market-pulse] Falha ao consultar Binance para ${c.key}, usando fallback:`, err);
      }
    });

    const fiatPromise = (async () => {
      try {
        const [latestRes, usdHistRes, eurHistRes] = await Promise.all([
          fetch("https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL", {
            signal: AbortSignal.timeout(4500),
            next: { revalidate: 60 },
            headers: { Accept: "application/json" }
          }),
          fetch("https://economia.awesomeapi.com.br/json/daily/USD-BRL/30", {
            signal: AbortSignal.timeout(4500),
            next: { revalidate: 60 },
            headers: { Accept: "application/json" }
          }),
          fetch("https://economia.awesomeapi.com.br/json/daily/EUR-BRL/30", {
            signal: AbortSignal.timeout(4500),
            next: { revalidate: 60 },
            headers: { Accept: "application/json" }
          })
        ]);

        if (latestRes.ok) {
          const lData = (await latestRes.json()) as Record<string, Record<string, string>>;
          if (lData.USDBRL) {
            const p = parseFloat(lData.USDBRL.bid || "5.75");
            const chg = parseFloat(lData.USDBRL.pctChange || "0.2");
            const high = parseFloat(lData.USDBRL.high || String(p * 1.01));
            const low = parseFloat(lData.USDBRL.low || String(p * 0.99));

            let history = resultTickers.USD.history;
            if (usdHistRes.ok) {
              const hData = (await usdHistRes.json()) as Array<Record<string, string>>;
              if (Array.isArray(hData) && hData.length > 0) {
                history = hData
                  .slice()
                  .reverse()
                  .map((item) => {
                    const ts = Number(item.timestamp) * 1000;
                    const d = new Date(ts);
                    const dayStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
                    return {
                      time: dayStr,
                      price: parseFloat(item.bid) || p
                    };
                  });
              }
            }

            resultTickers.USD = {
              symbol: "USD",
              name: "Dólar Comercial",
              priceBRL: p,
              change24hPct: chg,
              high24h: high,
              low24h: low,
              history
            };
          }

          if (lData.EURBRL) {
            const p = parseFloat(lData.EURBRL.bid || "6.22");
            const chg = parseFloat(lData.EURBRL.pctChange || "-0.1");
            const high = parseFloat(lData.EURBRL.high || String(p * 1.01));
            const low = parseFloat(lData.EURBRL.low || String(p * 0.99));

            let history = resultTickers.EUR.history;
            if (eurHistRes.ok) {
              const hData = (await eurHistRes.json()) as Array<Record<string, string>>;
              if (Array.isArray(hData) && hData.length > 0) {
                history = hData
                  .slice()
                  .reverse()
                  .map((item) => {
                    const ts = Number(item.timestamp) * 1000;
                    const d = new Date(ts);
                    const dayStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
                    return {
                      time: dayStr,
                      price: parseFloat(item.bid) || p
                    };
                  });
              }
            }

            resultTickers.EUR = {
              symbol: "EUR",
              name: "Euro",
              priceBRL: p,
              change24hPct: chg,
              high24h: high,
              low24h: low,
              history
            };
          }
        }
      } catch (err) {
        console.warn("[market-pulse] Falha ao consultar AwesomeAPI de câmbio, usando fallback:", err);
      }
    })();

    const bcbPromise = (async () => {
      try {
        const cdiRes = await fetch(
          "https://api.bcb.gov.br/dados/serie/bcdata.sgs.4389/dados/ultimos/1?formato=json",
          {
            signal: AbortSignal.timeout(4500),
            next: { revalidate: 60 },
            headers: { Accept: "application/json" }
          }
        );
        if (cdiRes.ok) {
          const cdiData = (await cdiRes.json()) as Array<{ data: string; valor: string }>;
          if (Array.isArray(cdiData) && cdiData[0]?.valor) {
            const baseCdi = parseFloat(cdiData[0].valor.replace(",", "."));
            if (baseCdi > 0) {
              const cdi115 = Math.round(baseCdi * 1.15 * 100) / 100;
              resultTickers.CDI = {
                symbol: "CDI",
                name: "CDI 115% (Nubank/Caixinha)",
                priceBRL: cdi115,
                change24hPct: 0.05,
                high24h: cdi115 + 0.15,
                low24h: cdi115 - 0.15,
                history: generateFallbackHistory(cdi115, 0.005)
              };
            }
          }
        }
      } catch (err) {
        console.warn("[market-pulse] Falha ao consultar BCB SGS para CDI:", err);
      }
    })();

    await Promise.allSettled([...cryptoPromises, fiatPromise, bcbPromise]);
  } catch (globalErr) {
    console.warn("[market-pulse] Erro global na agregação, retornando fallbacks:", globalErr);
  }

  const payload: MarketPulseResponse = {
    updatedAt: new Date().toISOString(),
    tickers: {
      BTC: resultTickers.BTC,
      BNB: resultTickers.BNB,
      ETH: resultTickers.ETH,
      SOL: resultTickers.SOL,
      USD: resultTickers.USD,
      EUR: resultTickers.EUR,
      CDI: resultTickers.CDI,
      IBOV: resultTickers.IBOV
    }
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300"
    }
  });
}
