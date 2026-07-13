"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CarMake, Color, ColorVariant } from "@/types";
import { generateColorId } from "@/lib/id-generator";
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
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";

const COLOR_TYPES = ["solid", "metallic", "pearl", "matte", "candy", "special"] as const;

export default function ColorsPanel() {
  const [colors, setColors] = useState<Color[]>([]);
  const [brands, setBrands] = useState<CarMake[]>([]);
  const [allVariants, setAllVariants] = useState<ColorVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Color | null>(null);
  const [form, setForm] = useState({ id: "", make_id: "", color_code: "", color_name: "", color_type: "solid" as Color["color_type"], hex_preview: "#FFFFFF", car_model: "" });
  const [variantIds, setVariantIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const idManuallyEdited = useRef(false);

  useEffect(() => {
    if (!editing && !idManuallyEdited.current && form.make_id && form.color_code) {
      setForm((prev) => ({ ...prev, id: generateColorId(form.make_id, form.color_code) }));
    }
  }, [form.make_id, form.color_code, editing]);

  const fetchColors = useCallback(async () => {
    const res = await fetch("/api/admin/colors");
    if (res.ok) setColors(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchColors();
    fetch("/api/admin/brands").then((r) => r.ok ? r.json() : []).then(setBrands);
    fetch("/api/admin/variants").then((r) => r.ok ? r.json() : []).then(setAllVariants);
  }, [fetchColors]);

  function openCreate() {
    setEditing(null); setForm({ id: "", make_id: "", color_code: "", color_name: "", color_type: "solid", hex_preview: "#FFFFFF", car_model: "" });
    setVariantIds([]); setError(""); idManuallyEdited.current = false; setShowModal(true);
  }
  function openEdit(color: Color) {
    setEditing(color); setForm({ id: color.id, make_id: color.make_id, color_code: color.color_code, color_name: color.color_name,
      color_type: color.color_type, hex_preview: color.hex_preview, car_model: color.car_model ?? "" });
    setVariantIds(color.variants.map((v) => v.id)); setError(""); setShowModal(true);
  }

  async function handleSave() {
    setError("");
    if (!form.id || !form.make_id || !form.color_code || !form.color_name) { setError("所有字段不能为空"); return; }
    const method = editing ? "PUT" : "POST";
    const res = await fetch("/api/admin/colors", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, variantIds }) });
    if (res.ok) { setShowModal(false); fetchColors(); }
    else { const d = await res.json(); setError(d.error || "保存失败"); }
  }

  async function handleDelete(color: Color) {
    if (!confirm(`确定删除颜色「${color.color_name}」吗？`)) return;
    await fetch("/api/admin/colors", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: color.id }) });
    fetchColors();
  }

  function toggleVariant(id: string) { setVariantIds((prev) => prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]); }

  if (loading) return <Box sx={{ textAlign: "center", py: 2 }}><Button disabled>加载中...</Button></Box>;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button onClick={openCreate} variant="contained" size="small">+ 新增颜色</Button>
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell sx={{ fontWeight: 500 }}>预览</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>颜色代码</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>颜色名称</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>车型</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>品牌</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>类型</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>变体</TableCell>
              <TableCell align="right" sx={{ fontWeight: 500 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {colors.map((c) => (
              <TableRow key={c.id}>
                <TableCell><Box sx={{ width: 24, height: 24, borderRadius: 0.5, border: 1, borderColor: "grey.200", bgcolor: c.hex_preview }} /></TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>{c.color_code}</TableCell>
                <TableCell sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>{c.color_name}</TableCell>
                <TableCell sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>{c.car_model || "—"}</TableCell>
                <TableCell sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>{brands.find((b) => b.id === c.make_id)?.name || c.make_id}</TableCell>
                <TableCell sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>{c.color_type}</TableCell>
                <TableCell sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>{c.variants.length}</TableCell>
                <TableCell align="right">
                  <Button onClick={() => openEdit(c)} size="small" sx={{ mr: 1 }}>编辑</Button>
                  <Button onClick={() => handleDelete(c)} size="small" color="error">删除</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "编辑颜色" : "新增颜色"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField label="ID（自动生成，可手动修改）" value={form.id} onChange={(e) => { idManuallyEdited.current = true; setForm({ ...form, id: e.target.value }); }} disabled={!!editing} size="small" fullWidth />
            <TextField select label="品牌" value={form.make_id} onChange={(e) => setForm({ ...form, make_id: e.target.value })} size="small" fullWidth>
              <MenuItem value="">请选择品牌</MenuItem>
              {brands.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField label="颜色代码" value={form.color_code} onChange={(e) => setForm({ ...form, color_code: e.target.value })} size="small" fullWidth />
              <TextField label="颜色名称" value={form.color_name} onChange={(e) => setForm({ ...form, color_name: e.target.value })} size="small" fullWidth />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField select label="类型" value={form.color_type} onChange={(e) => setForm({ ...form, color_type: e.target.value as Color["color_type"] })} size="small" fullWidth>
                {COLOR_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              <TextField label="预览色" type="color" value={form.hex_preview} onChange={(e) => setForm({ ...form, hex_preview: e.target.value })} size="small" sx={{ "& input": { height: 32, p: 0.5 } }} fullWidth />
            </Stack>
            <TextField label="车型" value={form.car_model} onChange={(e) => setForm({ ...form, car_model: e.target.value })} placeholder="例如 Camry / Corolla" size="small" fullWidth />
            <Box>
              <Box sx={{ fontSize: "0.8125rem", fontWeight: 500, mb: 1 }}>关联变体</Box>
              <Box sx={{ maxHeight: 160, overflow: "auto", border: 1, borderColor: "grey.300", borderRadius: 1, p: 1 }}>
                {allVariants.length === 0 && <Box sx={{ fontSize: "0.8125rem", color: "text.disabled" }}>暂无变体</Box>}
                {allVariants.map((v) => (
                  <FormControlLabel
                    key={v.id}
                    control={<Checkbox checked={variantIds.includes(v.id)} onChange={() => toggleVariant(v.id)} size="small" />}
                    label={`${v.name} (${v.year_range})`}
                    sx={{ display: "flex", fontSize: "0.8125rem" }}
                  />
                ))}
              </Box>
            </Box>
            {error && <Box sx={{ color: "error.main", fontSize: "0.8125rem" }}>{error}</Box>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowModal(false)} variant="outlined">取消</Button>
          <Button onClick={handleSave} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
