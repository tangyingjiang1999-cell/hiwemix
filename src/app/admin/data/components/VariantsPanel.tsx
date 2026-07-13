"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ColorVariant } from "@/types";
import { generateVariantId } from "@/lib/id-generator";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";

export default function VariantsPanel() {
  const [variants, setVariants] = useState<ColorVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ColorVariant | null>(null);
  const [form, setForm] = useState({ id: "", name: "", year_range: "" });
  const [error, setError] = useState("");
  const idManuallyEdited = useRef(false);

  useEffect(() => {
    if (!editing && !idManuallyEdited.current && form.name) {
      setForm((prev) => ({ ...prev, id: generateVariantId(form.name) }));
    }
  }, [form.name, editing]);

  const fetchVariants = useCallback(async () => {
    const res = await fetch("/api/admin/variants");
    if (res.ok) setVariants(await res.json());
    setLoading(false);
  }, []);
  useEffect(() => { fetchVariants(); }, [fetchVariants]);

  function openCreate() { setEditing(null); setForm({ id: "", name: "", year_range: "" }); setError(""); idManuallyEdited.current = false; setShowModal(true); }
  function openEdit(v: ColorVariant) { setEditing(v); setForm({ id: v.id, name: v.name, year_range: v.year_range }); setError(""); setShowModal(true); }

  async function handleSave() {
    setError("");
    if (!form.id || !form.name || !form.year_range) { setError("所有字段不能为空"); return; }
    const method = editing ? "PUT" : "POST";
    const res = await fetch("/api/admin/variants", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setShowModal(false); fetchVariants(); }
    else { const d = await res.json(); setError(d.error || "保存失败"); }
  }

  async function handleDelete(v: ColorVariant) {
    if (!confirm(`确定删除变体「${v.name}」吗？`)) return;
    await fetch("/api/admin/variants", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: v.id }) });
    fetchVariants();
  }

  if (loading) return <Box sx={{ textAlign: "center", py: 2 }}><Button disabled>加载中...</Button></Box>;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button onClick={openCreate} variant="contained" size="small">+ 新增变体</Button>
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell sx={{ fontWeight: 500 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>名称</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>年份范围</TableCell>
              <TableCell align="right" sx={{ fontWeight: 500 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {variants.map((v) => (
              <TableRow key={v.id}>
                <TableCell sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>{v.id}</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>{v.name}</TableCell>
                <TableCell sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>{v.year_range}</TableCell>
                <TableCell align="right">
                  <Button onClick={() => openEdit(v)} size="small" sx={{ mr: 1 }}>编辑</Button>
                  <Button onClick={() => handleDelete(v)} size="small" color="error">删除</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? "编辑变体" : "新增变体"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
            <TextField label="ID（自动生成，可手动修改）" value={form.id} onChange={(e) => { idManuallyEdited.current = true; setForm({ ...form, id: e.target.value }); }} disabled={!!editing} size="small" fullWidth />
            <TextField label="名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} size="small" fullWidth />
            <TextField label="年份范围（如 2018-2022）" value={form.year_range} onChange={(e) => setForm({ ...form, year_range: e.target.value })} size="small" fullWidth />
            {error && <Box sx={{ color: "error.main", fontSize: "0.8125rem" }}>{error}</Box>}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowModal(false)} variant="outlined">取消</Button>
          <Button onClick={handleSave} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
