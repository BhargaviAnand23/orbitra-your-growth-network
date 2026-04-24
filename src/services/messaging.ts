import { supabase } from "@/integrations/supabase/client";

/**
 * Conversations are unique per (user_a, user_b) where user_a < user_b.
 * Sort the two ids to find or create the canonical row.
 */
export async function getOrCreateConversation(meId: string, otherId: string) {
  const [user_a, user_b] = [meId, otherId].sort();

  const { data: existing, error: findErr } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_a", user_a)
    .eq("user_b", user_b)
    .maybeSingle();
  if (findErr) throw findErr;
  if (existing) return existing;

  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_a, user_b })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listConversations(meId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .or(`user_a.eq.${meId},user_b.eq.${meId}`)
    .order("last_message_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function sendMessage(conversationId: string, senderId: string, body: string) {
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, body })
    .select()
    .single();
  if (error) throw error;
  return data;
}
