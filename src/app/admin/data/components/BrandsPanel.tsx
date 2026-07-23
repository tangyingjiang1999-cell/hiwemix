"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CarMake, Region } from "@/types";
import { generateBrandId } from "@/lib/id-generator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Plus, X } from "lucide-react";

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
  const ROWS_PER_PAGE = 10;
  const idManuallyEdited = useRef(false);

  const fetchBrands = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/brands");
      if (res.ok) setBrands(await res.json());
    } catch {}
  }, []);

  const defaultRegionSet = useRef(false);
  const fetchRegions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/regions");
      if (res.ok) {
        const data: Region[] = await res.json();
        setRegions(data);
        if (!defaultRegionSet.current && data.length > 0) {
          defaultRegionSet.current = true;
          setBrandForm((prev) => (prev.region ? prev : { ...prev, region: data[0].code }));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchBrands();
    fetchRegions();
  }, [fetchBrands, fetchRegions]);

  useEffect(() => { setPage(0); }, [brands]);

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

  const totalPages = Math.max(1, Math.ceil(brands.length / ROWS_PER_PAGE));
  const pageRows = brands.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE);

  return (
    <div>
      {/* Header buttons */}
      <div className="flex justify-end gap-2 mb-4">
        <Button onClick={openCreateRegion} variant="outline" size="sm" className="rounded-lg text-[13px]">
          <Plus className="size-4" /> 新增产地
        </Button>
        <Button onClick={openCreateBrand} size="sm" className="rounded-lg bg-[#2487ca] text-[13px] hover:bg-[#1d6fb0]">
          新增品牌
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead className="w-[120px] py-2.5 text-xs font-semibold text-gray-500 uppercase text-center">ID</TableHead>
              <TableHead className="w-[200px] py-2.5 text-xs font-semibold text-gray-500 uppercase text-center">名称</TableHead>
              <TableHead className="w-[150px] py-2.5 text-xs font-semibold text-gray-500 uppercase text-center">产地</TableHead>
              <TableHead className="w-[100px] py-2.5 text-xs font-semibold text-gray-500 uppercase text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((brand, i) => (
              <TableRow key={brand.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50">
                <TableCell className="py-3 text-center text-[13px] text-gray-500">{brand.id}</TableCell>
                <TableCell className="py-3 text-center text-[13px] text-gray-900 truncate max-w-[180px]">{brand.name}</TableCell>
                <TableCell className="py-3 text-center text-[13px] text-gray-500">{brand.region}</TableCell>
                <TableCell className="py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => openEditBrand(brand)}
                      className="inline-flex size-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBrand(brand)}
                      className="inline-flex size-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <p className="text-sm font-semibold text-primary">Found {brands.length} brands</p>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-gray-500">{page + 1} / {totalPages}</span>
            <Button size="icon" variant="ghost" disabled={page === 0} onClick={() => setPage(page - 1)} className="size-8 rounded-lg">‹</Button>
            <Button size="icon" variant="ghost" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="size-8 rounded-lg">›</Button>
          </div>
        </div>
      </div>

      {/* Regions list */}
      <div className="mt-4 rounded-xl border border-gray-200 p-4">
        <p className="mb-2 text-sm font-semibold text-gray-700">已有产地：</p>
        <div className="flex flex-wrap gap-2">
          {regions.map((region) => (
            <span
              key={region.code}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-[13px] text-gray-600"
            >
              {region.code}
              <button
                onClick={() => setRegionToDelete(region.code)}
                className="inline-flex size-4 items-center justify-center rounded-full text-gray-400 hover:text-red-500"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Region delete confirmation */}
      <Dialog open={!!regionToDelete} onOpenChange={() => setRegionToDelete(null)}>
        <DialogContent className="max-w-sm bg-white">
          <DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">确定删除产地「{regionToDelete}」吗？此操作不可撤销。</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegionToDelete(null)} className="rounded-lg">取消</Button>
            <Button
              onClick={() => { if (regionToDelete) { handleDeleteRegion(regionToDelete); setRegionToDelete(null); } }}
              className="rounded-lg bg-red-600 hover:bg-red-700"
            >删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Brand create/edit dialog */}
      <Dialog open={showBrandModal} onOpenChange={(v) => { if (!v) setShowBrandModal(false); }}>
        <DialogContent className="max-w-sm bg-white">
          <DialogHeader><DialogTitle>{editing ? "编辑品牌" : "新增品牌"}</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-gray-700">ID（自动生成）</Label>
              <Input
                value={brandForm.id}
                onChange={(e) => { idManuallyEdited.current = true; setBrandForm({ ...brandForm, id: e.target.value }); }}
                disabled={!!editing}
                className="h-9 rounded-lg"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-gray-700">名称</Label>
              <Input value={brandForm.name} onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })} className="h-9 rounded-lg" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-gray-700">产地</Label>
              <Select value={brandForm.region} onValueChange={(v) => setBrandForm({ ...brandForm, region: v || "" })}>
                <SelectTrigger className="h-9 w-full rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent className="z-[130] max-h-[200px]">
                  {regions.map((r) => (<SelectItem key={r.code} value={r.code}>{r.code}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            {brandError && <p className="text-[13px] font-medium text-red-600">{brandError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBrandModal(false)} className="rounded-lg">取消</Button>
            <Button onClick={handleSaveBrand} className="rounded-lg bg-[#2487ca] hover:bg-[#1d6fb0]">保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Region create dialog */}
      <Dialog open={showRegionModal} onOpenChange={(v) => { if (!v) setShowRegionModal(false); }}>
        <DialogContent className="max-w-sm bg-white">
          <DialogHeader><DialogTitle>新增产地</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-gray-700">产地代码</Label>
              <Input
                value={regionForm.code}
                onChange={(e) => setRegionForm({ ...regionForm, code: e.target.value.toUpperCase() })}
                className="h-9 rounded-lg"
                placeholder="例如：SEA"
                maxLength={10}
              />
            </div>
            {regionError && <p className="text-[13px] font-medium text-red-600">{regionError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegionModal(false)} className="rounded-lg">取消</Button>
            <Button onClick={handleSaveRegion} className="rounded-lg bg-[#2487ca] hover:bg-[#1d6fb0]">保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
