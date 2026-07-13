"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CarMake } from "@/types";
import { generateBrandId } from "@/lib/id-generator";
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
import MenuItem from "@mui/material/MenuItem";

const REGIONS = ["JPN", "EUR", "USA", "CHN", "KOR"] as const;

export default function BrandsPanel() {
  const [brands, setBrands] = useState<CarMake[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CarMake | null>(null);
  const [form, setForm] = useState({ id: "", name: "", region: "JPN" as CarMake["region"] });
  const [error, setError] = useState("");
  const idManuallyEdited = useRef(false);

  useEffect(() => {
    if (!editing && !idManuallyEdited.current && form.name) {
      setForm((prev) => ({ ...prev, id: generateBrandId(form.name) }));
    }
  }, [form.name, editing]);

  const fetchBrands = useCallback(async () => {
    const res = await fetch("/api/admin/brands");
    if (res.ok) setBrands(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  function openCreate() {
    setEditing(null); setForm({ id: "", name: "", region: "JPN" }); setError(""); idManuallyEdited.current = false; setShowModal(true);
  }

  function openEdit(brand: CarMake) {
    setEditing(brand); setForm({ id: brand.id, name: brand.name, region: brand.region }); setError(""); setShowModal(true);
  }

  async function handleSave() {
    setError("");
    if (!form.id || !form.name) { setError("ID 和名称不能为空"); return; }
    const method = editing ? "PUT" : "POST";
    const res = await fetch("/api/admin/brands", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setShowModal(false); fetchBrands(); }
    else { const d = await res.json(); setError(d.error || "保存失败"); }
  }

  async function handleDelete(brand: CarMake) {
    if (!confirm(`确定删除品牌「${brand.name}」吗？`)) return;
    await fetch("/api/admin/brands", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: brand.id }) });
    fetchBrands();
  }

  if (loading) return <Box sx={{ textAlign: "center", py: 2 }}><Button disabled>加载中...</Button></Box>;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button onClick={openCreate} variant="contained" size="small">+ 新增品牌</Button>
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell sx={{ fontWeight: 500 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>名称</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>产地</TableCell>
              <TableCell align="right" sx={{ fontWeight: 500 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brands.map((b) => (
              <TableRow key={b.id}>
                <TableCell sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>{b.id}</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>{b.name}</TableCell>
                <TableCell sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>{b.region}</TableCell>
                <TableCell align="right">
                  <Button onClick={() => openEdit(b)} size="small" sx={{ mr: 1 }}>编辑</Button>
                  <Button onClick={() => handleDelete(b)} size="small" color="error">删除</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? "编辑品牌" : "新增品牌"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
            <TextField label="ID（自动生成，可手动修改）" value={form.id} onChange={(e) => { idManuallyEdited.current = true; setForm({ ...form, id: e.target.value }); }} disabled={!!editing} size="small" fullWidth />
            <TextField label="名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} size="small" fullWidth />
            <TextField select label="产地" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value as CarMake["region"] })} size="small" fullWidth>
              {REGIONS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
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
