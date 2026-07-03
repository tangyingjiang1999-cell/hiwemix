import { kv } from "@vercel/kv";
import { mockCarMakes, mockColors, mockFormulas } from "./mock-data";
import type { CarMake, Color, Formula, AppSettings } from "@/types";

// KV keys
const KV_BRANDS = "formula:brands";
const KV_COLORS = "formula:colors";
const KV_FORMULAS = "formula:formulas";
const KV_SETTINGS = "formula:settings";

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  finishes: ["Solid", "Metallic", "Pearl", "Matte", "Candy"],
  types: ["Basecoat", "Clearcoat", "Single Stage", "Primer", "Topcoat"],
  yearMin: 1990,
  yearMax: 2026,
};

// ====== 本地内存存储兜底（Vercel KV 未配置时使用）======

let localBrands: CarMake[] | null = null;
let localColors: Color[] | null = null;
let localFormulas: Formula[] | null = null;
let localSettings: AppSettings | null = null;

function isKVAvailable(): boolean {
  return !!(process.env.KV_URL || process.env.KV_REST_API_URL);
}

function seedLocalFromMock() {
  if (!localBrands) localBrands = [...mockCarMakes];
  if (!localColors) localColors = [...mockColors];
  if (!localFormulas) localFormulas = [...mockFormulas];
  if (!localSettings) localSettings = { ...DEFAULT_SETTINGS, finishes: [...DEFAULT_SETTINGS.finishes], types: [...DEFAULT_SETTINGS.types] };
}

// --- Brands ---
export async function getBrands(): Promise<CarMake[]> {
  try {
    if (!isKVAvailable()) throw new Error("KV not configured");
    const stored = await kv.get<string>(KV_BRANDS);
    if (stored) return JSON.parse(stored);
    await kv.set(KV_BRANDS, JSON.stringify(mockCarMakes));
    return mockCarMakes;
  } catch {
    seedLocalFromMock();
    return localBrands!;
  }
}

export async function saveBrands(data: CarMake[]): Promise<void> {
  try {
    if (!isKVAvailable()) throw new Error("KV not configured");
    await kv.set(KV_BRANDS, JSON.stringify(data));
  } catch {
    localBrands = [...data];
  }
}

// --- Colors ---
export async function getColors(): Promise<Color[]> {
  try {
    if (!isKVAvailable()) throw new Error("KV not configured");
    const stored = await kv.get<string>(KV_COLORS);
    if (stored) return JSON.parse(stored);
    await kv.set(KV_COLORS, JSON.stringify(mockColors));
    return mockColors;
  } catch {
    seedLocalFromMock();
    return localColors!;
  }
}

export async function saveColors(data: Color[]): Promise<void> {
  try {
    if (!isKVAvailable()) throw new Error("KV not configured");
    await kv.set(KV_COLORS, JSON.stringify(data));
  } catch {
    localColors = [...data];
  }
}

// --- Formulas ---
export async function getFormulas(): Promise<Formula[]> {
  try {
    if (!isKVAvailable()) throw new Error("KV not configured");
    const stored = await kv.get<string>(KV_FORMULAS);
    if (stored) return JSON.parse(stored);
    await kv.set(KV_FORMULAS, JSON.stringify(mockFormulas));
    return mockFormulas;
  } catch {
    seedLocalFromMock();
    return localFormulas!;
  }
}

export async function saveFormulas(data: Formula[]): Promise<void> {
  try {
    if (!isKVAvailable()) throw new Error("KV not configured");
    await kv.set(KV_FORMULAS, JSON.stringify(data));
  } catch {
    localFormulas = [...data];
  }
}

// --- Settings ---
export async function getSettings(): Promise<AppSettings> {
  try {
    if (!isKVAvailable()) throw new Error("KV not configured");
    const stored = await kv.get<string>(KV_SETTINGS);
    if (stored) return JSON.parse(stored);
    return DEFAULT_SETTINGS;
  } catch {
    seedLocalFromMock();
    return localSettings!;
  }
}

export async function saveSettings(data: AppSettings): Promise<void> {
  try {
    if (!isKVAvailable()) throw new Error("KV not configured");
    await kv.set(KV_SETTINGS, JSON.stringify(data));
  } catch {
    localSettings = { ...data, finishes: [...data.finishes], types: [...data.types] };
  }
}

// --- Force seed from mock data ---
export async function seedFromMockData(): Promise<void> {
  try {
    if (!isKVAvailable()) throw new Error("KV not configured");
    await kv.set(KV_BRANDS, JSON.stringify(mockCarMakes));
    await kv.set(KV_COLORS, JSON.stringify(mockColors));
    await kv.set(KV_FORMULAS, JSON.stringify(mockFormulas));
    await kv.set(KV_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  } catch {
    localBrands = [...mockCarMakes];
    localColors = [...mockColors];
    localFormulas = [...mockFormulas];
    localSettings = { ...DEFAULT_SETTINGS, finishes: [...DEFAULT_SETTINGS.finishes], types: [...DEFAULT_SETTINGS.types] };
  }
}
