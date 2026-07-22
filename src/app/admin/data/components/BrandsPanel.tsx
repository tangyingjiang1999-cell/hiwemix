"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CarMake, Region } from "@/types";
import { generateBrandId } from "@/lib/id-generator";
import { FONT, HEADER_BG, CELL_FONT_SIZE, COLUMN_BG, tableContainerSx, tableSx, cellSx, headerCellSx, getRowSx, actionButtonSx, deleteButtonSx } from "@/components/admin-table-styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import CustomPagination from "@/components/ui/CustomPagination";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export default function BrandsPanel() {
  const [brands, setBrands] = useState<CarMake[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [editing, setEditing] = useState<CarMake | null>(null);
  const [brandForm, setBrandForm] = useState({ id: "", name: "", region: "" });
  const [regionForm, setRegionForm] = useState({ code: "" });
  const [brandError, setBrandError] = useState("");
  const [regionError, setRegionError] = useState("");
  const [regionToDelete, setRegionToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const idManuallyEdited = useRef(false);

  // Fetch brands
  const fetchBrands = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/brands");
      if (res.ok) setBrands(await res.json());
    } catch { /* network error */ }
  }, []);

  // Fetch regions
  const defaultRegionSet = useRef(false);
  const fetchRegions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/regions");
      if (res.ok) {
        const data: Region[] = await res.json();
        setRegions(data);
        if (!defaultRegionSet.current && data.length > 0) {
          defaultRegionSet.current = true;
          setBrandForm((prev) => prev.region ? prev : { ...prev, region: data[0].code });
        }
      }
    } catch { /* network error */ }
  }, []);

  useEffect(() => {
    fetchBrands();
    fetchRegions();
  }, [fetchBrands, fetchRegions]);

  useEffect(() => {
    setPage(0);
  }, [brands]);

  // Auto-generate brand ID from name
  useEffect(() => {
    if (!editing && !idManuallyEdited.current && brandForm.name) {
      setBrandForm((prev) => ({ ...prev, id: generateBrandId(brandForm.name) }));
    }
  }, [brandForm.name, editing]);

  function openCreateBrand() {
    setEditing(null);
    setBrandForm({ id: "", name: "", region: regions[0]?.code || "JPN" });
    setBrandError("");
    idManuallyEdited.current = false;
    setShowBrandModal(true);
  }

  function openEditBrand(brand: CarMake) {
    setEditing(brand);
    setBrandForm({ id: brand.id, name: brand.name, region: brand.region });
    setBrandError("");
    setShowBrandModal(true);
  }

  function openCreateRegion() {
    setRegionForm({ code: "" });
    setRegionError("");
    setShowRegionModal(true);
  }

  async function handleSaveBrand() {
    setBrandError("");
    if (!brandForm.id || !brandForm.name) { setBrandError("ID 和名称不能为空"); return; }
    try {
      const method = editing ? "PUT" : "POST";
      const res = await fetch("/api/admin/brands", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(brandForm) });
      if (res.ok) { setShowBrandModal(false); fetchBrands(); }
      else { const data = await res.json(); setBrandError(data.error || "保存失败"); }
    } catch { setBrandError("网络错误，请重试"); }
  }

  async function handleDeleteBrand(brand: CarMake) {
    if (!confirm(`确定删除品牌「${brand.name}」吗？`)) return;
    try {
      const res = await fetch("/api/admin/brands", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: brand.id }) });
      if (res.ok) { fetchBrands(); } else { const d = await res.json(); alert(d.error || "删除失败"); }
    } catch { alert("网络错误，请重试"); }
  }

  async function handleSaveRegion() {
    setRegionError("");
    if (!regionForm.code.trim()) { setRegionError("产地代码不能为空"); return; }
    try {
      const res = await fetch("/api/admin/regions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(regionForm) });
      if (res.ok) { setShowRegionModal(false); fetchRegions(); }
      else { const data = await res.json(); setRegionError(data.error || "保存失败"); }
    } catch { setRegionError("网络错误，请重试"); }
  }

  async function handleDeleteRegion(code: string) {
    try {
      const res = await fetch("/api/admin/regions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      if (res.ok) fetchRegions();
      else { const data = await res.json(); alert(data.error || "删除失败"); }
    } catch { alert("网络错误，请重试"); }
  }

  const pageRows = brands.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      {/* Header with buttons */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 1.5 }}>
        <Button onClick={openCreateRegion} variant="outlined" size="small" startIcon={<AddIcon />}>
          新增产地
        </Button>
        <Button onClick={openCreateBrand} variant="contained" size="small">
          新增品牌
        </Button>
      </Box>

      {/* Brands table */}
      <TableContainer component={Paper} variant="outlined" sx={tableContainerSx}>
        <Table sx={tableSx}>
          <TableHead>
            <TableRow sx={{ bgcolor: HEADER_BG }}>
              <TableCell sx={{ ...headerCellSx, width: 120 }}>ID</TableCell>
              <TableCell sx={{ ...headerCellSx, width: 200 }}>名称</TableCell>
              <TableCell sx={{ ...headerCellSx, width: 150 }}>产地</TableCell>
              <TableCell sx={{ ...headerCellSx, width: 100 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map((brand, rowIndex) => (
              <TableRow key={brand.id} sx={getRowSx(rowIndex)}>
                <TableCell sx={{ ...cellSx, bgcolor: COLUMN_BG.odd }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, color: "text.secondary", fontWeight: 500 }}>
                    {brand.id}
                  </Typography>
                </TableCell>
                <TableCell sx={{ ...cellSx, bgcolor: COLUMN_BG.even }}>
                  <Typography noWrap sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, color: "text.primary" }}>
                    {brand.name}
                  </Typography>
                </TableCell>
                <TableCell sx={{ ...cellSx, bgcolor: COLUMN_BG.odd }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: CELL_FONT_SIZE, color: "text.secondary" }}>
                    {brand.region}
                  </Typography>
                </TableCell>
                <TableCell sx={{ ...cellSx, bgcolor: COLUMN_BG.even, textAlign: "center" }}>
                  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                    <IconButton onClick={() => openEditBrand(brand)} size="small" sx={actionButtonSx}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteBrand(brand)} size="small" sx={deleteButtonSx}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <CustomPagination
          totalCount={brands.length}
          page={page}
          pageSize={rowsPerPage}
          onPageChange={setPage}
          unitName="brands"
        />
      </TableContainer>

      {/* Regions list */}
      <Box sx={{ mt: 2, p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          已有产地：
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {regions.map((region) => (
            <Chip
              key={region.code}
              label={region.code}
              onDelete={() => setRegionToDelete(region.code)}
              size="small"
              variant="outlined"
              sx={{
                borderRadius: 2,
                fontSize: "0.8125rem",
                borderColor: "divider",
                bgcolor: "grey.50",
                "& .MuiChip-deleteIcon": {
                  color: "text.disabled",
                  fontSize: 16,
                  "&:hover": { color: "error.main" },
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Region delete confirmation dialog */}
      <Dialog open={!!regionToDelete} onClose={() => setRegionToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            确定删除产地「{regionToDelete}」吗？此操作不可撤销。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRegionToDelete(null)} variant="outlined">取消</Button>
          <Button
            onClick={() => {
              if (regionToDelete) {
                handleDeleteRegion(regionToDelete);
                setRegionToDelete(null);
              }
            }}
            variant="contained"
            color="error"
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>

      {/* Brand creation/edit dialog */}
      <Dialog open={showBrandModal} onClose={() => setShowBrandModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? "编辑品牌" : "新增品牌"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
            <TextField
              label="ID（自动生成）"
              value={brandForm.id}
              onChange={(e) => {
                idManuallyEdited.current = true;
                setBrandForm({ ...brandForm, id: e.target.value });
              }}
              disabled={!!editing}
              size="small"
              fullWidth
            />
            <TextField
              label="名称"
              value={brandForm.name}
              onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              select
              label="产地"
              value={brandForm.region}
              onChange={(e) => setBrandForm({ ...brandForm, region: e.target.value })}
              size="small"
              fullWidth
            >
              {regions.map((r) => (
                <MenuItem key={r.code} value={r.code}>
                  {r.code}
                </MenuItem>
              ))}
            </TextField>
            {brandError && (
              <Box sx={{ color: "error.main", fontSize: "0.8125rem" }}>{brandError}</Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowBrandModal(false)} variant="outlined">
            取消
          </Button>
          <Button onClick={handleSaveBrand} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* Region creation dialog */}
      <Dialog open={showRegionModal} onClose={() => setShowRegionModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>新增产地</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
            <TextField
              label="产地代码"
              value={regionForm.code}
              onChange={(e) => setRegionForm({ ...regionForm, code: e.target.value.toUpperCase() })}
              size="small"
              fullWidth
              placeholder="例如：SEA"
              slotProps={{ htmlInput: { maxLength: 10 } }}
            />
            {regionError && (
              <Box sx={{ color: "error.main", fontSize: "0.8125rem" }}>{regionError}</Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowRegionModal(false)} variant="outlined">
            取消
          </Button>
          <Button onClick={handleSaveRegion} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
