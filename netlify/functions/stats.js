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
  const s = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    weekday: "short",
  }).format(new Date(iso)); 
  return s;
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") {
      return json(405, { error: "Method Not Allowed" });
    }

    const supabase = getSupabase();

    const { data, error } = await supabase.from("logs").select("created_at");

    if (error) {
      return json(500, { error: error.message });
    }

    const total = data.length;

    const byWeekday = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

    for (const row of data) {
      const key = weekdayKeyJST(row.created_at);
      if (key in byWeekday) {
        byWeekday[key]++;
      }
    }

    return json(200, { total, byWeekday });
  } catch (e) {
    return json(500, { error: String(e?.message ?? e) });
  }
};
