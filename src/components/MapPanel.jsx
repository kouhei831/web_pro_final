import { useEffect, useMemo } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function formatDateJST(iso) {
  try {
    return new Date(iso).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  } catch {
    return iso;
  }
}

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) {
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [map, points]);

  return null;
}

export default function MapPanel({ logs }) {
  const points = useMemo(() => {
    return (logs ?? [])
      .filter((l) => l?.location && typeof l.location.lat === "number" && typeof l.location.lng === "number")
      .map((l) => ({
        id: l.id,
        lat: l.location.lat,
        lng: l.location.lng,
        note: l.note,
        createdAt: l.createdAt,
        weather: l.weather,
      }));
  }, [logs]);

  const defaultCenter = useMemo(() => {
    // ログがあるなら新しいログに寄せる
    if (points.length > 0) {
      return [points[0].lat, points[0].lng];
    }
    // ログなしなら東京駅付近（適当）
    return [35.681236, 139.767125];
  }, [points]);

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">マップ</Typography>
        <Typography variant="body2">
          記録した場所を地図上に表示します（ピンをクリックすると詳細）
        </Typography>
        <Divider />

        <div style={{ width: "100%", height: 360, borderRadius: 12, overflow: "hidden" }}>
          <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom style={{ width: "100%", height: "100%" }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FitBounds points={points} />

            {points.map((p) => (
              <Marker key={p.id} position={[p.lat, p.lng]}>
                <Popup>
                  <div style={{ maxWidth: 240 }}>
                    <div style={{ fontWeight: 600 }}>{formatDateJST(p.createdAt)}</div>
                    <div style={{ marginTop: 6 }}>{p.note}</div>
                    <div style={{ marginTop: 6, fontSize: 12 }}>
                      lat: {p.lat.toFixed(5)} / lng: {p.lng.toFixed(5)}
                    </div>
                    {p.weather && (
                      <div style={{ marginTop: 6, fontSize: 12 }}>
                        天気: {p.weather.label} / {p.weather.temperatureC}℃
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <Typography variant="body2">ピン数: {points.length}</Typography>
      </Stack>
    </Paper>
  );
}
