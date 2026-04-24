import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Bookmark, BookmarkCheck, ExternalLink, MapPin, Pencil, Search, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  listOpportunities, deleteOpportunity, listSavedIds, toggleSave,
  type Opportunity, type OpportunityType,
} from "@/services/opportunities";
import { OpportunityFormDialog, NewOpportunityButton } from "@/components/OpportunityFormDialog";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Orbitra" },
      { name: "description", content: "Your personalized feed of opportunities and people on Orbitra." },
    ],
  }),
  component: Dashboard,
});

const PAGE_SIZE = 8;
const TYPE_STYLES: Record<string, string> = {
  internship: "bg-primary/15 text-primary border-primary/30",
  hackathon: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  event: "bg-accent/15 text-accent border-accent/30",
  job: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  scholarship: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  project: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  other: "bg-muted text-muted-foreground border-border",
};

type OppWithProfile = Opportunity & { profiles?: { full_name: string; avatar_url: string | null } | null };

function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<OppWithProfile[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<OpportunityType | "all">("all");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Opportunity | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth", search: { mode: "login" } });
  }, [authLoading, user, navigate]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [{ items, count }, savedSet] = await Promise.all([
        listOpportunities({ search, type, page, pageSize: PAGE_SIZE }),
        listSavedIds(user.id),
      ]);
      setItems(items as OppWithProfile[]);
      setCount(count);
      setSaved(savedSet);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, [user, search, type, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (id: string) => {
    if (!user) return;
    const isSaved = saved.has(id);
    try {
      await toggleSave(user.id, id, isSaved);
      const next = new Set(saved);
      isSaved ? next.delete(id) : next.add(id);
      setSaved(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteOpportunity(id);
      toast.success("Deleted");
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Your feed</h1>
            <p className="text-sm text-muted-foreground">Opportunities from the Orbitra community.</p>
          </div>
          <NewOpportunityButton onSaved={fetchData} />
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search opportunities…"
              className="pl-9"
            />
          </div>
          <Select value={type} onValueChange={(v) => { setType(v as OpportunityType | "all"); setPage(0); }}>
            <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {(["internship","hackathon","event","job","scholarship","project","other"] as const).map((t) =>
                <SelectItem key={t} value={t}>{t}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <p className="py-16 text-center text-muted-foreground">Loading opportunities…</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center">
            <p className="text-muted-foreground">No opportunities yet. Be the first to post one.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((op, i) => {
              const isMine = op.created_by === user.id;
              const isSaved = saved.has(op.id);
              return (
                <motion.li
                  key={op.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <Badge variant="outline" className={TYPE_STYLES[op.type] ?? TYPE_STYLES.other}>
                          {op.type}
                        </Badge>
                        {op.organization && (
                          <span className="text-sm text-muted-foreground">{op.organization}</span>
                        )}
                      </div>
                      <h3 className="font-display text-lg font-semibold">{op.title}</h3>
                      {op.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{op.description}</p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {op.location && (
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{op.location}</span>
                        )}
                        {op.profiles?.full_name && <span>by {op.profiles.full_name}</span>}
                        {op.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {op.tags.slice(0,4).map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleSave(op.id)} aria-label={isSaved ? "Unsave" : "Save"}>
                        {isSaved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                      </Button>
                      {op.link && (
                        <a href={op.link} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" aria-label="Open link"><ExternalLink className="h-4 w-4" /></Button>
                        </a>
                      )}
                      {isMine && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => setEditing(op)} aria-label="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this opportunity?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(op.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}

        {count > PAGE_SIZE && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        )}
      </main>

      {editing && (
        <OpportunityFormDialog
          existing={editing}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          onSaved={() => { setEditing(null); fetchData(); }}
        />
      )}
    </div>
  );
}
