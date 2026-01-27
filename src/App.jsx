import { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import AppHeader from "./components/AppHeader";
import LogForm from "./components/LogForm";
import LogList from "./components/LogList";
import StatsPanel from "./components/StatsPanel";
import MapPanel from "./components/MapPanel";

import { listLogs, createLog, deleteLog } from "./lib/api";

export default function App() {
  const [logs, setLogs] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading"); 
  const [error, setError] = useState("");

  const [showGuide, setShowGuide] = useState(true);

  function handleCloseGuide() {
    setShowGuide(false);
  }
  // =======================================================

  async function reload() {
    setLoadStatus("loading");
    setError("");
    try {
      const data = await listLogs();
      setLogs(data);
      setLoadStatus("ready");
    } catch (e) {
      setError(String(e?.message ?? e));
      setLoadStatus("error");
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleAdd(newLog) {
    setLogs((prev) => [newLog, ...prev]);
    try {
      const saved = await createLog(newLog);
      setLogs((prev) => [saved, ...prev.filter((l) => l.id !== newLog.id)]);
    } catch (e) {
      setError(String(e?.message ?? e));
      setLogs((prev) => prev.filter((l) => l.id !== newLog.id));
    }
  }

  async function handleDelete(id) {
    const backup = logs;
    setLogs((prev) => prev.filter((l) => l.id !== id));
    try {
      await deleteLog(id);
    } catch (e) {
      setError(String(e?.message ?? e));
      setLogs(backup);
    }
  }

  function handleClearAll() {
    setError("全削除はサーバー側API未対応です");
  }

  return (
    <div>
      <AppHeader />

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Stack spacing={3}>
          {/* ===== 毎回表示するガイド ===== */}
          {showGuide && (
            <Alert
              severity="info"
              action={
                <Button color="inherit" size="small" onClick={handleCloseGuide}>
                  閉じる
                </Button>
              }
            >
              このアプリでは、位置情報をそのまま保存せず、
              <br />
              <strong>約300m単位に丸めて</strong>表示・保存しています。
              <br />
              プライバシーに配慮した設計です。
            </Alert>
          )}
          {/* ============================ */}

          {error && <Alert severity="error">{error}</Alert>}

          <Paper sx={{ p: 2 }}>
            <LogForm onAdd={handleAdd} />
          </Paper>

          <Divider />

          <StatsPanel />
          <MapPanel logs={logs} />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">保存件数: {logs.length}</Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={reload}>
                再読み込み
              </Button>
              <Button color="error" variant="outlined" onClick={handleClearAll}>
                全削除
              </Button>
            </Stack>
          </Stack>

          <Paper sx={{ p: 2 }}>
            {loadStatus === "loading" ? (
              <Stack direction="row" spacing={2} alignItems="center">
                <CircularProgress size={22} />
                <Typography variant="body2">読み込み中...</Typography>
              </Stack>
            ) : (
              <LogList logs={logs} onDelete={handleDelete} />
            )}
          </Paper>
        </Stack>
      </Container>
    </div>
  );
}
