function quantizeCoord(value, decimals = 4) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  const p = 10 ** decimals;
  return Math.round(value * p) / p;
}

export function quantizeLatLng(lat, lng, decimals = 4) {
  const qLat = quantizeCoord(lat, decimals);
  const qLng = quantizeCoord(lng, decimals);
  if (qLat === null || qLng === null) {
    return null;
  }
  return { lat: qLat, lng: qLng };
}

/*
 * 現在地を取得して返す
 */
export function getCurrentPosition({
  decimals = 4,
  enableHighAccuracy = false,
  timeout = 30000,
  maximumAge = 600000,
} = {}) {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("このブラウザはGeolocation APIに対応していません"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const q = quantizeLatLng(pos.coords.latitude, pos.coords.longitude, decimals);
        if (q === null) {
          reject(new Error("位置情報の取得結果が不正です"));
          return;
        }

        resolve({
          ...pos,
          coords: {
            ...pos.coords,
            latitude: q.lat,
            longitude: q.lng,
          },
        });
      },
      (err) => {
        reject(err);
      },
      { enableHighAccuracy, timeout, maximumAge }
    );
  });
}
