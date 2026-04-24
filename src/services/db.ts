/**
 * Generic data access layer for Supabase.
 * All RLS rules are enforced server-side; these helpers are thin wrappers
 * with consistent error handling, logging, and pagination.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type PublicTable = keyof Database["public"]["Tables"];

export interface ListOptions {
  filters?: Record<string, string | number | boolean | null>;
  search?: { column: string; query: string };
  orderBy?: { column: string; ascending?: boolean };
  page?: number;
  pageSize?: number;
  select?: string;
}

function log(scope: string, payload: unknown) {
  if (import.meta.env.DEV) console.debug(`[db:${scope}]`, payload);
}

export async function getAll<T extends PublicTable>(
  table: T,
  opts: ListOptions = {}
) {
  const {
    filters = {},
    search,
    orderBy = { column: "created_at", ascending: false },
    page = 0,
    pageSize = 20,
    select = "*",
  } = opts;

  let q = (supabase.from(table) as any).select(select, { count: "exact" });

  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null) q = q.eq(k, v as never);
  }
  if (search?.query) q = q.ilike(search.column, `%${search.query}%`);
  q = q.order(orderBy.column, { ascending: orderBy.ascending ?? false });
  q = q.range(page * pageSize, page * pageSize + pageSize - 1);

  const { data, error, count } = await q;
  if (error) {
    log(`getAll:${table}:error`, error);
    throw error;
  }
  log(`getAll:${table}`, { count, returned: data?.length });
  return { data: (data ?? []) as unknown[], count: count ?? 0 };
}

export async function getById<T extends PublicTable>(
  table: T,
  id: string,
  select = "*"
) {
  const { data, error } = await (supabase.from(table) as any)
    .select(select)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    log(`getById:${table}:error`, error);
    throw error;
  }
  return data;
}

export async function createRecord<T extends PublicTable>(
  table: T,
  payload: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from(table)
    .insert(payload as never)
    .select()
    .single();
  if (error) {
    log(`create:${table}:error`, error);
    throw error;
  }
  return data;
}

export async function updateRecord<T extends PublicTable>(
  table: T,
  id: string,
  patch: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from(table)
    .update(patch as never)
    .eq("id" as never, id as never)
    .select()
    .single();
  if (error) {
    log(`update:${table}:error`, error);
    throw error;
  }
  return data;
}

export async function deleteRecord<T extends PublicTable>(table: T, id: string) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq("id" as never, id as never);
  if (error) {
    log(`delete:${table}:error`, error);
    throw error;
  }
  return true;
}
