import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];
export type OpportunityInsert = Database["public"]["Tables"]["opportunities"]["Insert"];
export type OpportunityType = Database["public"]["Enums"]["opportunity_type"];

export interface ListOpportunitiesOpts {
  search?: string;
  type?: OpportunityType | "all";
  page?: number;
  pageSize?: number;
}

export async function listOpportunities({
  search,
  type,
  page = 0,
  pageSize = 10,
}: ListOpportunitiesOpts = {}) {
  let q = supabase
    .from("opportunities")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (type && type !== "all") q = q.eq("type", type);
  if (search) q = q.ilike("title", `%${search}%`);

  q = q.range(page * pageSize, page * pageSize + pageSize - 1);
  const { data, error, count } = await q;
  if (error) throw error;
  return { items: data ?? [], count: count ?? 0 };
}

export async function createOpportunity(payload: Omit<OpportunityInsert, "created_by">) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("opportunities")
    .insert({ ...payload, created_by: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOpportunity(id: string, patch: Partial<OpportunityInsert>) {
  const { data, error } = await supabase
    .from("opportunities")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteOpportunity(id: string) {
  const { error } = await supabase.from("opportunities").delete().eq("id", id);
  if (error) throw error;
}

export async function listSavedIds(userId: string) {
  const { data, error } = await supabase
    .from("saved_opportunities")
    .select("opportunity_id")
    .eq("user_id", userId);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.opportunity_id));
}

export async function toggleSave(userId: string, opportunityId: string, isSaved: boolean) {
  if (isSaved) {
    const { error } = await supabase
      .from("saved_opportunities")
      .delete()
      .eq("user_id", userId)
      .eq("opportunity_id", opportunityId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("saved_opportunities")
      .insert({ user_id: userId, opportunity_id: opportunityId });
    if (error) throw error;
  }
}
