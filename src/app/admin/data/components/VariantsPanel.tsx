"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ColorVariant } from "@/types";
import { generateVariantId } from "@/lib/id-generator";
import { FONT, HEADER_BG, CELL_FONT_SIZE, COLUMN_BG, ROW_BG, HOVER_BG, HOVER_TRANSITION, tableContainerSx, tableSx, cellSx, headerCellSx, getRowSx, actionButtonSx, deleteButtonSx } from "@/components/admin-table-styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function VariantsPanel() {
  const [variants, setVariants] = useState<ColorVariant[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ColorVariant | null>(null);
  const [form, setForm] = useState({ id: "", name: "" });
  const [originalId, setOriginalId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const idManuallyEdited = useRef(false);

  useEffect(() => { if (!editing && !idManuallyEdited.current && form.name) setForm((prev) => ({ ...prev, id: generateVariantId(form.name) })); }, [form.name, editing]);
  const fetchVariants = useCallback(async () => { try { const r = await fetch("/api/admin/variants"); if (r.ok) setVariants(await r.json()); } catch { /* network error */ } }, []);
  useEffect(() => { fetchVariants(); }, [fetchVariants]);

  useEffect(() => {
    setPage(0);
  }, [variants]);

  function openCreate() { setEditing(null); setForm({ id: "", name: "" }); setError(""); idManuallyEdited.current = false; setOriginalId(null); setShowModal(true); }
  function openEdit(v: ColorVariant) { setEditing(v); setForm({ id: v.id, name: v.name }); setError(""); setOriginalId(v.id); setShowModal(true); }
  async function handleSave() {
    setError(""); if (!form.id || !form.name) { setError("ID 和名称不能为空"); return; }
    try {
      const m = editing ? "PUT" : "POST";
      const body: Record<string, string> = { ...form, year_range: "" };
      // 编辑时发送原始 ID，以便后端定位旧记录
      if (editing && originalId) body.originalId = originalId;
      const r = await fetch("/api/admin/variants", { method: m, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (r.ok) { setShowModal(false); fetchVariants(); } else { const d = await r.json(); setError(d.error || "保存失败"); }
    } catch { setError("网络错误，请重试"); }
  }
  async function handleDelete(v: ColorVariant) {
    if (!confirm(`确定删除配方类型「${v.name}」吗？`)) return;
    try {
      const res = await fetch("/api/admin/variants", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: v.id }) });
      if (res.ok) { fetchVariants(); } else { const d = await res.json(); alert(d.error || "删除失败"); }
    } catch { alert("网络错误，请重试"); }
  }

  const pageRows = variants.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1.5 }}>
        <Button onClick={openCreate} variant="contained" size="small">+ 新增配方类型</Button>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={tableContainerSx}>
        <Table sx={tableSx}>
          <TableHead>
            <TableRow sx={{ bgcolor: HEADER_BG }}>
              <TableCell sx={{ ...headerCellSx, width: 120 }}>ID</TableCell>
              <TableCell sx={{ ...headerCellSx, width: 200 }}>名称</TableCell>
              <TableCell sx={{ ...headerCellSx, width: 100 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map((variant, rowIndex) => (
              <TableRow key={variant.id} sx={getRowSx(rowIndex)}>
                <TableCell sx={{ ...cellSx, bgcolor: COLUMN_BG.odd }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, color: "#374151", fontWeight: 500 }}>
                    {variant.id}
                  </Typography>
                </TableCell>
                <TableCell sx={{ ...cellSx, bgcolor: COLUMN_BG.even }}>
                  <Typography noWrap sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, color: "#1a1a1a" }}>
                    {variant.name}
                  </Typography>
                </TableCell>
                <TableCell sx={{ ...cellSx, bgcolor: COLUMN_BG.even, textAlign: "center" }}>
                  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                    <IconButton onClick={() => openEdit(variant)} size="small" sx={actionButtonSx}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(variant)} size="small" sx={deleteButtonSx}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={variants.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="每页行数"
        />
      </TableContainer>
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? "编辑配方类型" : "新增配方类型"}</DialogTitle>
        <DialogContent><Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
          <TextField label="ID" value={form.id} onChange={(e) => { idManuallyEdited.current = true; setForm({ ...form, id: e.target.value }); }} size="small" fullWidth helperText={editing ? "修改 ID 将自动更新所有引用" : ""} />
          <TextField label="名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} size="small" fullWidth />
          {error && <Box sx={{ color: "error.main", fontSize: "0.8125rem" }}>{error}</Box>}
        </Box></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setShowModal(false)} variant="outlined">取消</Button><Button onClick={handleSave} variant="contained">保存</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
