import { useEffect, useMemo, useState } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// 曜日別
function toWeekdayChartData(byWeekday) {
  const labels = [
    { key: "Sun", label: "Sun" },
    { key: "Mon", label: "Mon" },
    { key: "Tue", label: "Tue" },
    { key: "Wed", label: "Wed" },
    { key: "Thu", label: "Thu" },
    { key: "Fri", label: "Fri" },
    { key: "Sat", label: "Sat" },
  ];

  return labels.map((x) => ({
    weekday: x.label,
    count: Number(byWeekday?.[x.key] ?? 0),
  }));
}

// 天気カテゴリ別
function toWeatherChartData(byWeatherCategory) {
  const order = ["Clear", "Cloudy", "Rain", "Snow", "Fog", "Thunder", "Other", "Unknown"];
  return order.map((k) => ({
    weather: k,
    count: Number(byWeatherCategory?.[k] ?? 0),
  }));
}

export default function StatsPanel() {
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [byWeekday, setByWeekday] = useState(null);
  const [byWeatherCategory, setByWeatherCategory] = useState(null);

  async function load() {
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/.netlify/functions/stats");
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t);
      }

      const data = await res.json();
      setTotal(Number(data.total ?? 0));
      setByWeekday(data.byWeekday ?? null);
      setByWeatherCategory(data.byWeatherCategory ?? null);
      setStatus("ready");
    } catch (e) {
      setError(String(e?.message ?? e));
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const weekdayChartData = useMemo(
    () => toWeekdayChartData(byWeekday),
    [byWeekday]
  );

  const weatherChartData = useMemo(
    () => toWeatherChartData(byWeatherCategory),
    [byWeatherCategory]
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">統計</Typography>
          <Button variant="outlined" onClick={load}>
            更新
          </Button>
        </Stack>

        {status === "loading" && (
          <Stack direction="row" spacing={2} alignItems="center">
            <CircularProgress size={22} />
            <Typography variant="body2">統計を読み込み中...</Typography>
          </Stack>
        )}

        {status === "error" && <Alert severity="error">{error}</Alert>}

        {status === "ready" && (
          <Stack spacing={2}>
            <Typography variant="body2">総ログ数: {total}</Typography>

            {/* 曜日別 */}
            <Typography variant="body2">曜日別ログ数</Typography>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={weekdayChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="weekday" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 天気カテゴリ別 */}
            <Typography variant="body2" sx={{ mt: 2 }}>
              天気別ログ数
            </Typography>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={weatherChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="weather" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
