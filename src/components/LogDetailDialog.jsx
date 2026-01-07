import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function LogDetailDialog({ open, log, onClose }) {
  if (!log) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>ログ詳細</DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2">{formatDate(log.createdAt)}</Typography>

          <Typography variant="body1">{log.note}</Typography>

          <Typography variant="body2">
            lat: {log.location.lat.toFixed(5)} / lng:{" "}
            {log.location.lng.toFixed(5)}
          </Typography>

          {/* 天気情報（あれば表示） */}
          {log.weather && (
            <Typography variant="body2">
              天気: {log.weather.label} / {log.weather.temperatureC}℃ / 風{" "}
              {log.weather.windspeed} m/s
            </Typography>
          )}

          {log.image?.dataUrl && (
            <img
              src={log.image.dataUrl}
              alt={log.image.name || "log image"}
              style={{ maxWidth: "100%", borderRadius: 8 }}
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
}
