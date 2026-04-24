import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef, type FormEvent } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { listConversations, listMessages, sendMessage, getOrCreateConversation } from "@/services/messaging";
import { listProfiles, type Profile } from "@/services/profiles";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
type Message = Database["public"]["Tables"]["messages"]["Row"];

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — Orbitra" }] }),
  component: MessagesPage,
});

function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth", search: { mode: "login" } });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    listConversations(user.id).then(async (convs) => {
      setConversations(convs);
      // fetch profiles for all participants
      const ids = new Set<string>();
      convs.forEach((c) => { ids.add(c.user_a); ids.add(c.user_b); });
      ids.delete(user.id);
      if (ids.size > 0) {
        const { data } = await supabase.from("profiles").select("*").in("id", [...ids]);
        const m = new Map<string, Profile>();
        (data ?? []).forEach((p) => m.set(p.id, p));
        setProfiles(m);
      }
      if (convs[0] && !activeId) setActiveId(convs[0].id);
    }).catch((e) => toast.error(e.message));
  }, [user]);

  useEffect(() => {
    if (!activeId) return;
    listMessages(activeId).then(setMessages).catch((e) => toast.error(e.message));

    // realtime subscription
    const channel = supabase
      .channel(`messages:${activeId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const t = setTimeout(() => {
      listProfiles(search).then((rows) => setSearchResults(rows.filter((r) => r.id !== user?.id)));
    }, 250);
    return () => clearTimeout(t);
  }, [search, user]);

  const startChat = async (otherId: string) => {
    if (!user) return;
    try {
      const conv = await getOrCreateConversation(user.id, otherId);
      const exists = conversations.find((c) => c.id === conv.id);
      if (!exists) setConversations([conv, ...conversations]);
      setActiveId(conv.id);
      setSearch("");
      setSearchResults([]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !activeId || !body.trim()) return;
    const text = body;
    setBody("");
    try {
      await sendMessage(activeId, user.id, text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Send failed");
      setBody(text);
    }
  };

  if (authLoading || !user) return <div className="min-h-screen bg-background"><Navbar /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto grid h-[calc(100vh-4rem)] max-w-6xl grid-cols-1 gap-0 overflow-hidden md:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="border-r border-border p-4 overflow-y-auto">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find people…" className="mb-3" />
          {searchResults.length > 0 && (
            <div className="mb-4 space-y-1">
              <p className="px-2 text-xs uppercase text-muted-foreground">Start a chat</p>
              {searchResults.map((p) => (
                <button key={p.id} onClick={() => startChat(p.id)} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">
                  {p.full_name || "Unnamed"}
                </button>
              ))}
            </div>
          )}
          <p className="px-2 text-xs uppercase text-muted-foreground">Chats</p>
          {conversations.length === 0 ? (
            <p className="mt-2 px-2 text-sm text-muted-foreground">No chats yet — search for someone above.</p>
          ) : (
            <ul className="mt-1 space-y-1">
              {conversations.map((c) => {
                const otherId = c.user_a === user.id ? c.user_b : c.user_a;
                const p = profiles.get(otherId);
                return (
                  <li key={c.id}>
                    <button onClick={() => setActiveId(c.id)} className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${activeId === c.id ? "bg-primary/15 text-foreground" : "hover:bg-muted"}`}>
                      {p?.full_name || "Unnamed"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Chat */}
        <section className="flex flex-col">
          {activeId ? (
            <>
              <div className="flex-1 overflow-y-auto p-6">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">Say hi 👋</p>
                ) : (
                  <ul className="space-y-2">
                    {messages.map((m) => {
                      const mine = m.sender_id === user.id;
                      return (
                        <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-gradient-primary text-primary-foreground" : "bg-muted"}`}>
                            {m.body}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <div ref={endRef} />
              </div>
              <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-4">
                <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type a message…" />
                <Button type="submit" disabled={!body.trim()} className="bg-gradient-primary text-primary-foreground">Send</Button>
              </form>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">Select a chat</div>
          )}
        </section>
      </main>
    </div>
  );
}
