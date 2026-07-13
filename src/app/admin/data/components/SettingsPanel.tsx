"use client";

import { useState, useEffect } from "react";
import type { AppSettings } from "@/types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

export default function SettingsPanel() {
  const [finishesText, setFinishesText] = useState("");
  const [typesText, setTypesText] = useState("");
  const [yearMin, setYearMin] = useState(1990);
  const [yearMax, setYearMax] = useState(2026);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.ok ? r.json() : null)
      .then((data: AppSettings | null) => {
        if (data) { setFinishesText(data.finishes.join("\n")); setTypesText(data.types.join("\n")); setYearMin(data.yearMin); setYearMax(data.yearMax); }
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true); setMessage("");
    const finishes = finishesText.split("\n").map((s) => s.trim()).filter(Boolean);
    const types = typesText.split("\n").map((s) => s.trim()).filter(Boolean);
    const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ finishes, types, yearMin, yearMax }) });
    setSaving(false); setMessage(res.ok ? "保存成功" : "保存失败");
  }

  if (loading) return <Box sx={{ textAlign: "center", py: 2 }}><Typography variant="body2" color="text.secondary">加载中...</Typography></Box>;

  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3 }}>
        漆面类型和配方类型每行一个值
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <TextField label="漆面类型（每行一个）" value={finishesText} onChange={(e) => setFinishesText(e.target.value)} multiline rows={6} size="small" fullWidth />
        <TextField label="配方类型（每行一个）" value={typesText} onChange={(e) => setTypesText(e.target.value)} multiline rows={6} size="small" fullWidth />
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField label="最小年份" type="number" value={yearMin} onChange={(e) => setYearMin(Number(e.target.value))} size="small" sx={{ width: 128 }} />
          <TextField label="最大年份" type="number" value={yearMax} onChange={(e) => setYearMax(Number(e.target.value))} size="small" sx={{ width: 128 }} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button onClick={handleSave} disabled={saving} variant="contained" size="small">{saving ? "保存中..." : "保存设置"}</Button>
          {message && <Typography variant="body2" color={message === "保存成功" ? "success.main" : "error.main"}>{message}</Typography>}
        </Box>
      </Box>
    </Paper>
  );
}
