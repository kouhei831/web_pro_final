import { useMemo, useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import LogDetailDialog from "./LogDetailDialog";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function LogList({ logs, onDelete }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return logs;
    }
    return logs.filter((l) =>
      String(l.note).toLowerCase().includes(q)
    );
  }, [logs, query]);

  return (
    <Stack spacing={2}>
      <Typography variant="h6">ログ一覧</Typography>

      <TextField
        label="検索（メモ）"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length === 0 ? (
        <Typography variant="body2">ログがありません</Typography>
      ) : (
        filtered.map((log) => (
          <Card key={log.id}>
            <CardContent>
              <Typography variant="body2">
                {formatDate(log.createdAt)}
              </Typography>

              <Typography variant="body1" sx={{ mt: 1 }}>
                {log.note}
              </Typography>

              {/* 天気情報（あれば表示） */}
              {log.weather && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  天気: {log.weather.label} /{" "}
                  {log.weather.temperatureC}℃
                </Typography>
              )}

              {/* 画像サムネイル */}
              {log.image?.dataUrl && (
                <img
                  src={log.image.dataUrl}
                  alt={log.image.name || "thumb"}
                  style={{
                    maxWidth: "100%",
                    marginTop: 12,
                    borderRadius: 8,
                  }}
                />
              )}
            </CardContent>

            <CardActions>
              <Button onClick={() => setSelected(log)}>詳細</Button>
              <Button color="error" onClick={() => onDelete(log.id)}>
                削除
              </Button>
            </CardActions>
          </Card>
        ))
      )}

      {/* 詳細ダイアログ */}
      <LogDetailDialog
        open={Boolean(selected)}
        log={selected}
        onClose={() => setSelected(null)}
      />
    </Stack>
  );
}
