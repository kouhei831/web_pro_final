function weatherCodeToText(code) {
  const map = new Map([
    [0, "快晴"],
    [1, "晴れ"],
    [2, "薄曇り"],
    [3, "曇り"],
    [45, "霧"],
    [48, "霧（着氷）"],
    [51, "霧雨（弱）"],
    [53, "霧雨（中）"],
    [55, "霧雨（強）"],
    [61, "雨（弱）"],
    [63, "雨（中）"],
    [65, "雨（強）"],
    [71, "雪（弱）"],
    [73, "雪（中）"],
    [75, "雪（強）"],
    [80, "にわか雨（弱）"],
    [81, "にわか雨（中）"],
    [82, "にわか雨（強）"],
    [95, "雷雨"],
  ]);
  return map.get(code) ?? `天気コード: ${code}`;
}

export async function fetchCurrentWeather(lat, lng) {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${encodeURIComponent(lat)}` +
    `&longitude=${encodeURIComponent(lng)}` +
    "&current_weather=true" +
    "&timezone=Asia%2FTokyo";

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("天気APIの取得に失敗しました");
  }

  const data = await res.json();
  const cw = data.current_weather;
  if (!cw) {
    throw new Error("天気データが見つかりません");
  }

  return {
    provider: "open-meteo",
    fetchedAt: new Date().toISOString(),
    temperatureC: cw.temperature,
    windspeed: cw.windspeed,
    weathercode: cw.weathercode,
    label: weatherCodeToText(cw.weathercode),
  };
}
