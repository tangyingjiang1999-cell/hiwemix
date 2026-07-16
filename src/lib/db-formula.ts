import { supabase } from "./supabase-client";
import { supabaseAdmin } from "./supabase-server";
import type {
  CarMake,
  Color,
  ColorVariant,
  Formula,
  FormulaComponent,
  AppSettings,
} from "@/types";

const DEFAULT_SETTINGS: AppSettings = {
  finishes: ["Solid", "Metallic", "Pearl", "Matte", "Candy"],
  types: ["Single Stage", "Two Stages", "Pearl Paint"],
  yearMin: 1990,
  yearMax: 2026,
};

// ====== Brands ======

export async function getBrands(): Promise<CarMake[]> {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CarMake[];
}

// ====== Color Variants ======

export async function getVariants(): Promise<ColorVariant[]> {
  const { data, error } = await supabase
    .from("color_variants")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ColorVariant[];
}

// ====== Color Years ======

export async function getColorYears(colorId: string): Promise<number[]> {
  const { data, error } = await supabase
    .from("color_years")
    .select("year")
    .eq("color_id", colorId)
    .order("year", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => r.year as number);
}

export async function getAllColorYears(): Promise<Record<string, number[]>> {
  const { data, error } = await supabase
    .from("color_years")
    .select("color_id, year")
    .order("year", { ascending: true });
  if (error) throw error;
  const map: Record<string, number[]> = {};
  for (const row of data ?? []) {
    const colorId = row.color_id as string;
    const year = row.year as number;
    if (!map[colorId]) map[colorId] = [];
    map[colorId].push(year);
  }
  return map;
}

export async function saveColorYears(colorId: string, years: number[]): Promise<void> {
  // 删除现有的年份
  const { error: delErr } = await supabaseAdmin
    .from("color_years")
    .delete()
    .eq("color_id", colorId);
  if (delErr) throw delErr;

  // 插入新的年份
  if (years.length > 0) {
    const rows = years.map((year) => ({ color_id: colorId, year }));
    const { error: insErr } = await supabaseAdmin.from("color_years").insert(rows);
    if (insErr) throw insErr;
  }
}

// ====== Colors ======

export async function getColors(): Promise<Color[]> {
  const { data, error } = await supabase
    .from("colors")
    .select("*, color_variant_map(color_variants(*))")
    .order("color_code", { ascending: true });
  if (error) throw error;

  // 批量获取所有颜色的年份
  const yearsMap = await getAllColorYears();

  return (data ?? []).map((row) => {
    const color = mapColorRow(row);
    color.years = yearsMap[color.id] || [];
    return color;
  });
}

// ====== Formulas ======

export async function getFormulas(): Promise<Formula[]> {
  const { data, error } = await supabase
    .from("formulas")
    .select("*, formula_components(*)")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapFormulaRow);
}

// ====== Settings ======

export async function getSettings(): Promise<AppSettings> {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return DEFAULT_SETTINGS;
  return {
    finishes: data.finishes ?? DEFAULT_SETTINGS.finishes,
    types: data.types ?? DEFAULT_SETTINGS.types,
    yearMin: data.year_min ?? DEFAULT_SETTINGS.yearMin,
    yearMax: data.year_max ?? DEFAULT_SETTINGS.yearMax,
  };
}

// ====== 内部辅助 ======

function mapColorRow(row: Record<string, unknown>): Color {
  const map =
    (row.color_variant_map as Array<{ color_variants: ColorVariant } | null> | null) ?? [];
  const variants: ColorVariant[] = map
    .map((m) => m?.color_variants)
    .filter((v): v is ColorVariant => v != null);
  return {
    id: row.id as string,
    make_id: row.make_id as string,
    color_code: row.color_code as string,
    color_name: row.color_name as string,
    color_type: row.color_type as Color["color_type"],
    hex_preview: row.hex_preview as string,
    car_model: (row.car_model as string) || undefined,
    variants,
  };
}

function mapFormulaRow(row: Record<string, unknown>): Formula {
  const comps =
    (row.formula_components as Array<Record<string, unknown>> | null) ?? [];
  const components: FormulaComponent[] = comps.map((c) => {
    const comp: FormulaComponent = {
      toner_code: c.toner_code as string,
      toner_name: c.toner_name as string,
      percentage: Number(c.percentage),
      grams_per_100g: Number(c.percentage),  // 始终从 percentage 派生
    };
    if (c.density != null) comp.density = Number(c.density);
    if (c.rgb_r != null) {
      comp.rgb_r = c.rgb_r as number;
      comp.rgb_g = c.rgb_g as number;
      comp.rgb_b = c.rgb_b as number;
    }
    if (c.component_group != null) {
      comp.component_group = c.component_group as FormulaComponent["component_group"];
    }
    return comp;
  });
  return {
    id: row.id as string,
    color_id: row.color_id as string,
    variant_id: row.variant_id as string,
    version: row.version as string,
    paint_system: row.paint_system as Formula["paint_system"],
    formula_type: row.formula_type as Formula["formula_type"],
    components,
    notes: (row.notes as string) ?? "",
    updated_at: row.updated_at as string,
  };
}

// ====== 写操作（仅服务端，用 supabaseAdmin，BYPASSRLS）======

// --- Brands ---

export async function saveBrand(brand: CarMake): Promise<CarMake> {
  const { data, error } = await supabaseAdmin
    .from("brands")
    .upsert({ id: brand.id, name: brand.name, region: brand.region })
    .select()
    .single();
  if (error) throw error;
  return data as CarMake;
}

export async function deleteBrand(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("brands").delete().eq("id", id);
  if (error) throw error;
}

// --- Color Variants ---

export async function saveVariant(variant: ColorVariant): Promise<ColorVariant> {
  const { data, error } = await supabaseAdmin
    .from("color_variants")
    .upsert({ id: variant.id, name: variant.name, year_range: variant.year_range })
    .select()
    .single();
  if (error) throw error;
  return data as ColorVariant;
}

export async function deleteVariant(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("color_variants").delete().eq("id", id);
  if (error) throw error;
}

// --- Colors（含变体多对多同步）---

export async function saveColor(
  color: Omit<Color, "variants">,
  variantIds: string[]
): Promise<Color> {
  // 1. upsert 颜色主行
  const { data, error } = await supabaseAdmin
    .from("colors")
    .upsert({
      id: color.id,
      make_id: color.make_id,
      color_code: color.color_code,
      color_name: color.color_name,
      color_type: color.color_type,
      hex_preview: color.hex_preview,
      car_model: color.car_model || null,
    })
    .select()
    .single();
  if (error) throw error;

  // 2. 同步 color_variant_map：先删后插
  const { error: delErr } = await supabaseAdmin
    .from("color_variant_map")
    .delete()
    .eq("color_id", color.id);
  if (delErr) throw delErr;

  if (variantIds.length > 0) {
    const rows = variantIds.map((variant_id) => ({ color_id: color.id, variant_id }));
    const { error: insErr } = await supabaseAdmin.from("color_variant_map").insert(rows);
    if (insErr) throw insErr;
  }

  return data as Color;
}

export async function deleteColor(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("colors").delete().eq("id", id);
  if (error) throw error;
}

// --- Formulas（含色母组件全量同步）---

export async function saveFormula(formula: Formula): Promise<Formula> {
  // 1. upsert 配方主行（variant_id 空字符串转 null）
  const { data, error } = await supabaseAdmin
    .from("formulas")
    .upsert({
      id: formula.id,
      color_id: formula.color_id,
      variant_id: formula.variant_id || null,
      version: formula.version,
      paint_system: formula.paint_system,
      formula_type: formula.formula_type,
      notes: formula.notes ?? "",
    })
    .select()
    .single();
  if (error) throw error;

  // 2. 全量同步 components：先删后插（id 是 SERIAL 自增，无稳定客户端 id）
  const { error: delErr } = await supabaseAdmin
    .from("formula_components")
    .delete()
    .eq("formula_id", formula.id);
  if (delErr) throw delErr;

  if (formula.components.length > 0) {
    const rows = formula.components.map((c) => {
      const row: Record<string, unknown> = {
        formula_id: formula.id,
        toner_code: c.toner_code,
        toner_name: c.toner_name,
        percentage: c.percentage,
        grams_per_100g: c.percentage,  // 始终从 percentage 派生
        density: c.density ?? null,
        rgb_r: c.rgb_r ?? null,
        rgb_g: c.rgb_g ?? null,
        rgb_b: c.rgb_b ?? null,
      };
      if (c.component_group != null) {
        row.component_group = c.component_group;
      }
      return row;
    });
    const { error: insErr } = await supabaseAdmin.from("formula_components").insert(rows);
    if (insErr) throw insErr;
  }

  return data as Formula;
}

export async function deleteFormula(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("formulas").delete().eq("id", id);
  if (error) throw error;
}

// --- Settings ---

export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .upsert({
      id: 1,
      finishes: settings.finishes,
      types: settings.types,
      year_min: settings.yearMin,
      year_max: settings.yearMax,
    })
    .select()
    .single();
  if (error) throw error;
  return {
    finishes: data.finishes ?? [],
    types: data.types ?? [],
    yearMin: data.year_min,
    yearMax: data.year_max,
  };
}
