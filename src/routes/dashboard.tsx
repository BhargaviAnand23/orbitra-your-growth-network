import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { opportunities, suggestedUsers, type Opportunity } from "@/lib/mockData";
import { Bookmark, BookmarkCheck, ExternalLink, MapPin, MessageCircle, Plus, Sparkles, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Orbitra" },
      { name: "description", content: "Your personalized feed of opportunities and people on Orbitra." },
    ],
  }),
  component: Dashboard,
});

const TYPE_STYLES: Record<Opportunity["type"], string> = {
  Internship: "bg-primary/15 text-primary border-primary/30",
  Gig: "bg-accent/15 text-accent border-accent/30",
  Event: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  Collaboration: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

function Dashboard() {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [connected, setConnected] = useState<Set<string>>(new Set());

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleConnect = (id: string) => {
    setConnected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="text-xs uppercase tracking-widest text-accent">Welcome back</div>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Hey Alex, <span className="text-gradient-primary">your orbit is buzzing.</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            5 new opportunities and 4 people matched your skills today.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* MAIN — Opportunity feed */}
          <div className="lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                <Sparkles className="h-4 w-4 text-accent" /> Opportunities for you
              </h2>
              <div className="flex gap-1 text-xs text-muted-foreground">
                <button className="rounded-full bg-primary/20 px-3 py-1 text-foreground">All</button>
                <button className="rounded-full px-3 py-1 hover:text-foreground">Saved · {saved.size}</button>
              </div>
            </div>

            <div className="space-y-4">
              {opportunities.map((o, i) => {
                const isSaved = saved.has(o.id);
                return (
                  <motion.article
                    key={o.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="group rounded-2xl border border-border bg-card-glass p-6 transition hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className={TYPE_STYLES[o.type]}>
                            {o.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{o.org}</span>
                        </div>
                        <h3 className="font-display text-lg font-semibold">{o.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{o.description}</p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {o.location}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {o.tags.map((t) => (
                              <span key={t} className="rounded-md bg-secondary/60 px-2 py-0.5">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleSave(o.id)}
                          className="h-9 w-9"
                          aria-label={isSaved ? "Unsave" : "Save"}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="h-4 w-4 text-accent" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-9 w-9" aria-label="Open">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            {/* Profile summary */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card-glass p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary font-display text-lg font-bold text-primary-foreground shadow-glow">
                  AC
                </div>
                <div>
                  <div className="font-display text-base font-semibold">Alex Chen</div>
                  <div className="text-xs text-muted-foreground">CS student · Berlin</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <Stat label="Profile" value="78%" />
                <Stat label="Saved" value={String(saved.size)} />
                <Stat label="Network" value={String(connected.size)} />
              </div>

              <div className="mt-5">
                <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {["React", "TypeScript", "UI Design", "ML"].map((s) => (
                    <Badge key={s} variant="secondary" className="bg-primary/15 text-foreground">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button variant="outline" className="mt-5 w-full">
                Edit profile
              </Button>
            </div>

            {/* Suggested people */}
            <div className="rounded-2xl border border-border bg-card-glass p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold">
                <TrendingUp className="h-4 w-4 text-accent" /> People to know
              </h3>
              <div className="space-y-3">
                {suggestedUsers.map((u) => {
                  const isConn = connected.has(u.id);
                  return (
                    <div key={u.id} className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold text-primary-foreground shadow-glow"
                        style={{
                          background: `linear-gradient(135deg, oklch(0.68 0.19 ${u.hue}), oklch(0.78 0.14 ${u.hue - 30}))`,
                        }}
                      >
                        {u.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{u.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{u.role}</div>
                      </div>
                      <Button
                        size="sm"
                        variant={isConn ? "secondary" : "outline"}
                        onClick={() => toggleConnect(u.id)}
                        className="h-8"
                      >
                        {isConn ? (
                          <>
                            <MessageCircle className="mr-1 h-3 w-3" /> Chat
                          </>
                        ) : (
                          <>
                            <Plus className="mr-1 h-3 w-3" /> Connect
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-2">
      <div className="font-display text-base font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
