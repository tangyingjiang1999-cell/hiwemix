import { supabase } from "./supabase-client";
import { getSupabaseAdmin } from "./supabase-server";
import type { GuideCategory, Guide } from "@/types";

// ====== 读（anon，受 RLS，仅公开数据）======

export async function getGuideCategories(): Promise<GuideCategory[]> {
  const { data, error } = await supabase
    .from("guide_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapCategoryRow);
}

export async function getGuides(): Promise<Guide[]> {
  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapGuideRow);
}

// ====== 写（getSupabaseAdmin()，BYPASSRLS，仅服务端 API 调用）======

export async function saveGuideCategory(cat: GuideCategory): Promise<GuideCategory> {
  const { data, error } = await getSupabaseAdmin()
    .from("guide_categories")
    .upsert({
      id: cat.id,
      name: cat.name,
      name_zh: cat.nameZh,
      sort_order: cat.sortOrder ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  return mapCategoryRow(data as Record<string, unknown>);
}

export async function deleteGuideCategory(id: string): Promise<void> {
  const { error } = await getSupabaseAdmin().from("guide_categories").delete().eq("id", id);
  if (error) throw error;
}

export async function saveGuide(guide: Guide): Promise<Guide> {
  const { data, error } = await getSupabaseAdmin()
    .from("guides")
    .upsert({
      id: guide.id,
      category_id: guide.categoryId,
      title: guide.title,
      title_zh: guide.titleZh,
      content: guide.content ?? "",
      content_zh: guide.contentZh ?? "",
      sort_order: guide.sortOrder ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  return mapGuideRow(data as Record<string, unknown>);
}

export async function deleteGuide(id: string): Promise<void> {
  const { error } = await getSupabaseAdmin().from("guides").delete().eq("id", id);
  if (error) throw error;
}

// ====== 内部映射（snake_case → camelCase）======

function mapCategoryRow(row: Record<string, unknown>): GuideCategory {
  return {
    id: row.id as string,
    name: row.name as string,
    nameZh: row.name_zh as string,
    sortOrder: row.sort_order as number,
  };
}

function mapGuideRow(row: Record<string, unknown>): Guide {
  return {
    id: row.id as string,
    categoryId: row.category_id as string,
    title: row.title as string,
    titleZh: row.title_zh as string,
    content: row.content as string,
    contentZh: row.content_zh as string,
    sortOrder: row.sort_order as number,
    updatedAt: row.updated_at as string,
  };
}
