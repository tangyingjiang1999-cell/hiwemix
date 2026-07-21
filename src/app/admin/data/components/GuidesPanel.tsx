"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Guide, GuideCategory } from "@/types";
import { generateGuideId, generateGuideCategoryId } from "@/lib/id-generator";
import { FONT, HEADER_BG, CELL_FONT_SIZE, COLUMN_BG, ROW_BG, HOVER_BG, HOVER_TRANSITION, tableContainerSx, tableSx, cellSx, headerCellSx, getRowSx, actionButtonSx, deleteButtonSx } from "@/components/admin-table-styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
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

interface GuideRow extends Guide { categoryName: string; }

export default function GuidesPanel() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [categories, setCategories] = useState<GuideCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editing, setEditing] = useState<Guide | null>(null);
  const [form, setForm] = useState({ id: "", categoryId: "", title: "", titleZh: "", content: "", contentZh: "" });
  const [error, setError] = useState("");
  const [catForm, setCatForm] = useState({ id: "", name: "", nameZh: "" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const guideIdEdited = useRef(false);
  const catIdEdited = useRef(false);

  useEffect(() => { if (!editing && !guideIdEdited.current && form.title) setForm((prev) => ({ ...prev, id: generateGuideId(form.title) })); }, [form.title, editing]);
  useEffect(() => { if (!catIdEdited.current && catForm.name) setCatForm((prev) => ({ ...prev, id: generateGuideCategoryId(catForm.name) })); }, [catForm.name]);

  const fetchGuides = useCallback(async () => { try { const r = await fetch("/api/admin/guides"); if (r.ok) setGuides(await r.json()); } catch { /* network error */ } setLoading(false); }, []);
  const fetchCategories = useCallback(async () => { try { const r = await fetch("/api/admin/guide-categories"); if (r.ok) setCategories(await r.json()); } catch { /* network error */ } }, []);
  useEffect(() => { fetchGuides(); fetchCategories(); }, [fetchGuides, fetchCategories]);

  function openCreate() { setEditing(null); setForm({ id: "", categoryId: categories[0]?.id || "", title: "", titleZh: "", content: "", contentZh: "" }); setError(""); guideIdEdited.current = false; setShowModal(true); }
  function openEdit(g: Guide) { setEditing(g); setForm({ id: g.id, categoryId: g.categoryId, title: g.title, titleZh: g.titleZh, content: g.content, contentZh: g.contentZh }); setError(""); setShowModal(true); }
  async function handleSave() {
    setError(""); if (!form.id || !form.categoryId || !form.title || !form.titleZh) { setError("必填字段不能为空"); return; }
    try {
      const m = editing ? "PUT" : "POST";
      const r = await fetch("/api/admin/guides", { method: m, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, sortOrder: 0 }) });
      if (r.ok) { setShowModal(false); fetchGuides(); } else { const d = await r.json(); setError(d.error || "保存失败"); }
    } catch { setError("网络错误，请重试"); }
  }
  async function handleDelete(g: Guide) {
    if (!confirm(`确定删除指南「${g.titleZh}」吗？`)) return;
    try {
      const res = await fetch("/api/admin/guides", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: g.id }) });
      if (res.ok) { fetchGuides(); } else { const d = await res.json(); alert(d.error || "删除失败"); }
    } catch { alert("网络错误，请重试"); }
  }
  async function handleSaveCategory() {
    if (!catForm.id || !catForm.name || !catForm.nameZh) return;
    try {
      const res = await fetch("/api/admin/guide-categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...catForm, sortOrder: 0 }) });
      if (res.ok) { setCatForm({ id: "", name: "", nameZh: "" }); catIdEdited.current = false; fetchCategories(); } else { const d = await res.json(); alert(d.error || "保存失败"); }
    } catch { alert("网络错误，请重试"); }
  }
  async function handleDeleteCategory(cat: GuideCategory) {
    if (!confirm(`确定删除「${cat.nameZh}」吗？`)) return;
    try {
      const res = await fetch("/api/admin/guide-categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: cat.id }) });
      if (res.ok) { fetchCategories(); fetchGuides(); } else { const d = await res.json(); alert(d.error || "删除失败"); }
    } catch { alert("网络错误，请重试"); }
  }

  const catMap = new Map(categories.map((c) => [c.id, c.nameZh]));
  const filtered: GuideRow[] = (filterCat ? guides.filter((g) => g.categoryId === filterCat) : guides).map((g) => ({ ...g, categoryName: catMap.get(g.categoryId) ?? g.categoryId }));

  useEffect(() => {
    setPage(0);
  }, [guides, filterCat]);

  const pageRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ mb: 1.5, alignItems: "center" }}>
        <TextField select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} size="small" sx={{ minWidth: 160 }}>
          <MenuItem value="">全部分类</MenuItem>
          {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.nameZh}</MenuItem>)}
        </TextField>
        <Button onClick={() => setShowCatModal(true)} variant="outlined" size="small">管理分类</Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={openCreate} variant="contained" size="small">+ 新增指南</Button>
      </Stack>

      <TableContainer component={Paper} variant="outlined" sx={tableContainerSx}>
        <Table sx={tableSx}>
          <TableHead>
            <TableRow sx={{ bgcolor: HEADER_BG }}>
              <TableCell sx={{ ...headerCellSx, width: 120 }}>ID</TableCell>
              <TableCell sx={{ ...headerCellSx, width: 200 }}>中文标题</TableCell>
              <TableCell sx={{ ...headerCellSx, width: 200 }}>英文标题</TableCell>
              <TableCell sx={{ ...headerCellSx, width: 120 }}>分类</TableCell>
              <TableCell sx={{ ...headerCellSx, width: 100 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map((guide, rowIndex) => (
              <TableRow key={guide.id} sx={getRowSx(rowIndex)}>
                <TableCell sx={{ ...cellSx, bgcolor: COLUMN_BG.odd }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, color: "#374151", fontWeight: 500 }}>
                    {guide.id}
                  </Typography>
                </TableCell>
                <TableCell sx={{ ...cellSx, bgcolor: COLUMN_BG.even }}>
                  <Typography noWrap sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, color: "#1a1a1a" }}>
                    {guide.titleZh}
                  </Typography>
                </TableCell>
                <TableCell sx={{ ...cellSx, bgcolor: COLUMN_BG.odd }}>
                  <Typography noWrap sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, color: "#374151" }}>
                    {guide.title}
                  </Typography>
                </TableCell>
                <TableCell sx={{ ...cellSx, bgcolor: COLUMN_BG.even }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, color: "#374151" }}>
                    {guide.categoryName}
                  </Typography>
                </TableCell>
                <TableCell sx={{ ...cellSx, bgcolor: COLUMN_BG.odd, textAlign: "center" }}>
                  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                    <IconButton onClick={() => openEdit(guide)} size="small" sx={actionButtonSx}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(guide)} size="small" sx={deleteButtonSx}>
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
          count={filtered.length}
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

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? "编辑指南" : "新增指南"}</DialogTitle>
        <DialogContent><Stack spacing={2} sx={{ pt: 0.5 }}>
          <TextField label="ID" value={form.id} onChange={(e) => { guideIdEdited.current = true; setForm({ ...form, id: e.target.value }); }} disabled={!!editing} size="small" fullWidth />
          <TextField select label="分类" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} size="small" fullWidth>
            <MenuItem value="">请选择</MenuItem>
            {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.nameZh}</MenuItem>)}
          </TextField>
          <Stack direction="row" spacing={2}>
            <TextField label="英文标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} size="small" fullWidth />
            <TextField label="中文标题" value={form.titleZh} onChange={(e) => setForm({ ...form, titleZh: e.target.value })} size="small" fullWidth />
          </Stack>
          <TextField label="英文正文" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} size="small" multiline rows={5} fullWidth />
          <TextField label="中文正文" value={form.contentZh} onChange={(e) => setForm({ ...form, contentZh: e.target.value })} size="small" multiline rows={5} fullWidth />
          {error && <Box sx={{ color: "error.main", fontSize: "0.8125rem" }}>{error}</Box>}
        </Stack></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setShowModal(false)} variant="outlined">取消</Button><Button onClick={handleSave} variant="contained">保存</Button></DialogActions>
      </Dialog>

      <Dialog open={showCatModal} onClose={() => setShowCatModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>管理分类</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: 200, overflow: "auto", mb: 2 }}>
            {categories.map((cat) => (
              <Stack key={cat.id} direction="row" sx={{ justifyContent: "space-between", alignItems: "center", p: 1, border: 1, borderColor: "grey.200", borderRadius: 0 }}>
                <Box sx={{ fontSize: "0.8125rem" }}><Box component="span" sx={{ fontWeight: 500 }}>{cat.nameZh}</Box> <Box component="span" sx={{ color: "text.disabled" }}>({cat.name})</Box></Box>
                <Button onClick={() => handleDeleteCategory(cat)} size="small" color="error">删除</Button>
              </Stack>
            ))}
          </Box>
          <Stack direction="row" spacing={1}>
            <TextField value={catForm.id} onChange={(e) => { catIdEdited.current = true; setCatForm({ ...catForm, id: e.target.value }); }} placeholder="auto" size="small" sx={{ width: 80 }} />
            <TextField value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="英文名" size="small" fullWidth />
            <TextField value={catForm.nameZh} onChange={(e) => setCatForm({ ...catForm, nameZh: e.target.value })} placeholder="中文名" size="small" fullWidth />
          </Stack>
          <Button onClick={handleSaveCategory} variant="contained" size="small" fullWidth sx={{ mt: 1.5 }}>添加分类</Button>
        </DialogContent>
        <DialogActions><Button onClick={() => setShowCatModal(false)} variant="outlined">关闭</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
