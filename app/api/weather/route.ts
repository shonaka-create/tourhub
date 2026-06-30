import { NextResponse } from "next/server";

// サーファーズパラダイス沿岸（ゴールドコースト）
const LAT = -28.0023;
const LON = 153.4145;

// 無料・APIキー不要の Open-Meteo を利用（商用可）。
// 気温/体感/湿度/天気/風速/風向/UV は Forecast API、波高は Marine API。
// 満潮（潮汐）は無料・キー不要のソースが無いため取得対象外。
const FORECAST =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index` +
  `&wind_speed_unit=ms&timezone=Australia/Brisbane`;
const MARINE =
  `https://marine-api.open-meteo.com/v1/marine?latitude=${LAT}&longitude=${LON}` +
  `&current=wave_height&timezone=Australia/Brisbane`;

// WMO weather code → 日本語
function weatherText(code: number): string {
  if (code === 0) return "快晴";
  if (code === 1) return "晴れ";
  if (code === 2) return "晴れ時々曇り";
  if (code === 3) return "曇り";
  if (code === 45 || code === 48) return "霧";
  if (code >= 51 && code <= 57) return "霧雨";
  if (code >= 61 && code <= 67) return "雨";
  if (code >= 71 && code <= 77) return "雪";
  if (code >= 80 && code <= 82) return "にわか雨";
  if (code >= 95) return "雷雨";
  return "—";
}

const DIRS = ["北", "北東", "東", "南東", "南", "南西", "西", "北西"];
function windDir(deg: number): string {
  return DIRS[Math.round(deg / 45) % 8];
}

function uvText(uv: number): string {
  if (uv < 3) return "弱い";
  if (uv < 6) return "中程度";
  if (uv < 8) return "強い";
  if (uv < 11) return "非常に強い";
  return "極端";
}

export const revalidate = 600; // 10分キャッシュ

export async function GET() {
  try {
    const [fRes, mRes] = await Promise.all([
      fetch(FORECAST, { next: { revalidate: 600 } }),
      fetch(MARINE, { next: { revalidate: 600 } }),
    ]);
    if (!fRes.ok) throw new Error("forecast " + fRes.status);
    const f = await fRes.json();
    const c = f.current;
    // Marine は稀に失敗するので波高だけ任意扱い
    let wave: number | null = null;
    if (mRes.ok) {
      const m = await mRes.json();
      wave = m?.current?.wave_height ?? null;
    }

    const temp = Math.round(c.temperature_2m);
    const feels = Math.round(c.apparent_temperature);
    const humidity = Math.round(c.relative_humidity_2m);
    const wind = Math.round(c.wind_speed_10m);
    const uv = Math.round(c.uv_index ?? 0);

    const now = new Date().toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Australia/Brisbane",
    });

    return NextResponse.json({
      ok: true,
      updatedAt: now,
      temp,
      feels,
      humidity,
      condition: weatherText(c.weather_code),
      wind,
      windDir: windDir(c.wind_direction_10m),
      windStrong: wind >= 10,
      uv,
      uvText: uvText(uv),
      wave: wave != null ? Number(wave.toFixed(1)) : null,
      waveOver: wave != null ? wave >= 2.0 : false,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "weather fetch failed" },
      { status: 502 }
    );
  }
}
