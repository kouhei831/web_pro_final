function toAppLog(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    note: row.note,
    location: { lat: row.lat, lng: row.lng },
    image: { dataUrl: row.image_data_url, name: row.image_name },
    weather: row.weather ?? null,
  };
}

export async function listLogs() {
  const res = await fetch("/.netlify/functions/logs");
  if (!res.ok) {
    throw new Error("ログ一覧の取得に失敗しました");
  }
  const data = await res.json();
  return (data.logs ?? []).map(toAppLog);
}

export async function createLog(log) {
  const res = await fetch("/.netlify/functions/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(log),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`ログ追加に失敗しました: ${t}`);
  }

  const data = await res.json();
  return toAppLog(data.log);
}

export async function deleteLog(id) {
  const res = await fetch(
    `/.netlify/functions/logs?id=${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`ログ削除に失敗しました: ${t}`);
  }
}
