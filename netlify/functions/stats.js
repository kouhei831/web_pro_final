require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定です");
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function weekdayKeyJST(iso) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    weekday: "short",
  }).format(new Date(iso));
}

function weatherCategoryFromWeather(weather) {
  const code = Number(weather?.weathercode);
  if (!Number.isFinite(code)) {
    return "Unknown";
  }

  if (code === 0 || code === 1) return "Clear";
  if (code === 2 || code === 3) return "Cloudy";
  if (code === 45 || code === 48) return "Fog";
  if ((code >= 51 && code <= 55) || (code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code === 95 || code === 96 || code === 99) return "Thunder";
  return "Other";
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") {
      return json(405, { error: "Method Not Allowed" });
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("logs")
      .select("created_at, weather");

    if (error) {
      return json(500, { error: error.message });
    }

    const total = data.length;

    const byWeekday = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    const byWeatherCategory = {
      Clear: 0,
      Cloudy: 0,
      Fog: 0,
      Rain: 0,
      Snow: 0,
      Thunder: 0,
      Other: 0,
      Unknown: 0,
    };

    for (const row of data) {
      const wd = weekdayKeyJST(row.created_at);
      if (wd in byWeekday) {
        byWeekday[wd]++;
      }

      const wc = weatherCategoryFromWeather(row.weather);
      if (wc in byWeatherCategory) {
        byWeatherCategory[wc]++;
      } else {
        byWeatherCategory.Other++;
      }
    }

    return json(200, { total, byWeekday, byWeatherCategory });
  } catch (e) {
    return json(500, { error: String(e?.message ?? e) });
  }
};
