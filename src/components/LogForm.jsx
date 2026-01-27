import { useState } from "react";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import { getCurrentPosition } from "../lib/geolocation";
import { fileToDataUrl } from "../lib/image";
import { fetchCurrentWeather } from "../lib/weather";

const GRID_DEG = 0.003; 

function quantizeLatLng(lat, lng) {
  return {
    lat: Math.round(lat / GRID_DEG) * GRID_DEG,
    lng: Math.round(lng / GRID_DEG) * GRID_DEG,
  };
}

export default function LogForm({ onAdd }) {
  const [note, setNote] = useState("");

  // 保存・表示用（粗い）
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  // 天気取得用（生の座標）
  const [rawLat, setRawLat] = useState(null);
  const [rawLng, setRawLng] = useState(null);

  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");

  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [weather, setWeather] = useState(null);
  const [weatherStatus, setWeatherStatus] = useState("idle"); 
  const [weatherError, setWeatherError] = useState("");

  async function handleGetLocation() {
    setStatus("locating");
    setErrorMessage("");
    setWeatherStatus("idle");
    setWeatherError("");
    setWeather(null);

    try {
      const pos = await getCurrentPosition();

      const nextRawLat = pos.coords.latitude;
      const nextRawLng = pos.coords.longitude;

      // 生の座標を保持（天気用）
      setRawLat(nextRawLat);
      setRawLng(nextRawLng);

      // 表示・保存用は約300mで丸める
      const q = quantizeLatLng(nextRawLat, nextRawLng);
      setLat(q.lat);
      setLng(q.lng);

      setStatus("ready");

      // 天気取得（生の座標で）
      setWeatherStatus("loading");
      try {
        const w = await fetchCurrentWeather(nextRawLat, nextRawLng);
        setWeather(w);
        setWeatherStatus("ready");
      } catch (err) {
        const msg =
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "天気の取得に失敗しました";
        setWeather(null);
        setWeatherError(msg);
        setWeatherStatus("error");
      }
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "位置情報の取得に失敗しました";
      setErrorMessage(msg);
      setStatus("error");
    }
  }

  async function handleImageChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setImageDataUrl("");
      setImageName("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("画像ファイルを選択してください");
      setStatus("error");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setImageDataUrl(dataUrl);
      setImageName(file.name);
      setErrorMessage("");
      if (status !== "locating") {
        setStatus("ready");
      }
    } catch {
      setErrorMessage("画像の読み込みに失敗しました");
      setStatus("error");
    }
  }

  function canSubmit() {
    return (
      note.trim().length > 0 &&
      typeof lat === "number" &&
      typeof lng === "number" &&
      imageDataUrl.length > 0
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (!canSubmit()) {
      setStatus("error");
      setErrorMessage("メモ・位置情報・画像を揃えてから保存してください");
      return;
    }

    const now = new Date();
    const newLog = {
      id: crypto.randomUUID(),
      createdAt: now.toISOString(),
      note: note.trim(),
      location: { lat, lng }, // 保存は粗い方
      image: { dataUrl: imageDataUrl, name: imageName || "image" },
      weather: weather,
    };

    onAdd(newLog);

    // reset
    setNote("");
    setLat(null);
    setLng(null);
    setRawLat(null);
    setRawLng(null);
    setImageDataUrl("");
    setImageName("");
    setWeather(null);
    setWeatherStatus("idle");
    setWeatherError("");
    setStatus("idle");
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Typography variant="h6">新規ログ</Typography>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <TextField
          label="メモ"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          multiline
          minRows={2}
        />

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="contained"
            onClick={handleGetLocation}
            type="button"
            disabled={status === "locating"}
          >
            現在地を取得
          </Button>

          {status === "locating" && <CircularProgress size={22} />}

          {typeof lat === "number" && typeof lng === "number" && (
            <Typography variant="body2">
              lat {lat.toFixed(3)} / lng {lng.toFixed(3)}  ※表示は約300m単位
            </Typography>
          )}
        </Stack>

        {/* 天気表示 */}
        <Stack spacing={1}>
          <Typography variant="subtitle2">天気（現在地）</Typography>

          {weatherStatus === "idle" && (
            <Typography variant="body2">位置情報から天気を表示します</Typography>
          )}

          {weatherStatus === "loading" && (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={22} />
              <Typography variant="body2">天気を取得中...</Typography>
            </Stack>
          )}

          {weatherStatus === "error" && (
            <Alert severity="warning">
              {weatherError || "天気の取得に失敗しました"}
            </Alert>
          )}

          {weatherStatus === "ready" && weather && (
            <Typography variant="body2">
              {weather.label} / {weather.temperatureC}℃ / 風 {weather.windspeed} m/s
            </Typography>
          )}
        </Stack>

        <Stack spacing={1}>
          <Button variant="outlined" component="label">
            画像を選択
            <input
              hidden
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
            />
          </Button>

          {imageName && <Typography variant="body2">選択中: {imageName}</Typography>}

          {imageDataUrl && (
            <img
              src={imageDataUrl}
              alt="preview"
              style={{ maxWidth: "100%", borderRadius: 8 }}
            />
          )}
        </Stack>

        <Button variant="contained" type="submit" disabled={!canSubmit()}>
          保存
        </Button>
      </Stack>
    </form>
  );
}
