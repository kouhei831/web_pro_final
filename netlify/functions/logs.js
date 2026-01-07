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

exports.handler = async (event) => {
  try {
    const supabase = getSupabase();

    // GET: 一覧取得
    if (event.httpMethod === "GET") {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        return json(500, { error: error.message });
      }
      return json(200, { logs: data });
    }

    // POST: 追加
    if (event.httpMethod === "POST") {
      const raw = event.body ? JSON.parse(event.body) : null;
      if (!raw) {
        return json(400, { error: "Body is required." });
      }

      if (
        !raw.id ||
        !raw.createdAt ||
        !raw.note ||
        !raw.location ||
        typeof raw.location.lat !== "number" ||
        typeof raw.location.lng !== "number" ||
        !raw.image ||
        !raw.image.dataUrl ||
        !raw.image.name
      ) {
        return json(400, { error: "Invalid log payload." });
      }

      const row = {
        id: raw.id,
        created_at: raw.createdAt,
        note: raw.note,
        lat: raw.location.lat,
        lng: raw.location.lng,
        image_data_url: raw.image.dataUrl,
        image_name: raw.image.name,
        weather: raw.weather ?? null,
      };

      const { data, error } = await supabase
        .from("logs")
        .insert(row)
        .select("*")
        .single();

      if (error) {
        return json(500, { error: error.message });
      }
      return json(201, { log: data });
    }

    // DELETE: 削除
    if (event.httpMethod === "DELETE") {
      const id = event.queryStringParameters?.id;
      if (!id) {
        return json(400, { error: "id is required." });
      }

      const { error } = await supabase.from("logs").delete().eq("id", id);
      if (error) {
        return json(500, { error: error.message });
      }
      return json(200, { ok: true });
    }

    return json(405, { error: "Method Not Allowed" });
  } catch (e) {
    return json(500, { error: String(e?.message ?? e) });
  }
};
