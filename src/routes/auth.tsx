import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { OrbitBackground } from "@/components/OrbitBackground";
import { Orbit, X } from "lucide-react";

type AuthMode = "login" | "signup";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search.mode === "login" ? "login" : "signup") as AuthMode,
  }),
  head: () => ({
    meta: [
      { title: "Sign in to Orbitra" },
      { name: "description", content: "Join Orbitra and start finding opportunities and people who match your ambition." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<string[]>(["React"]);
  const [skillInput, setSkillInput] = useState("");

  const setMode = (m: AuthMode) => navigate({ to: "/auth", search: { mode: m } });

  const addSkill = () => {
    const v = skillInput.trim();
    if (v && !skills.includes(v)) setSkills([...skills, v]);
    setSkillInput("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 opacity-50">
        <OrbitBackground />
      </div>

      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Orbit className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl font-bold">Orbitra</span>
        </Link>

        <div className="rounded-3xl border border-border bg-card-glass p-8 shadow-elevated">
          {/* Toggle */}
          <div className="mb-8 grid grid-cols-2 gap-1 rounded-full border border-border bg-background/40 p-1">
            <button
              onClick={() => setMode("login")}
              className={`rounded-full py-2 text-sm font-medium transition ${
                mode === "login" ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`rounded-full py-2 text-sm font-medium transition ${
                mode === "signup" ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign up
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="mb-1 font-display text-2xl font-bold">
                {mode === "login" ? "Welcome back" : "Join Orbitra"}
              </h1>
              <p className="mb-6 text-sm text-muted-foreground">
                {mode === "login" ? "Log in to your orbit." : "Create your profile and find your people."}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" placeholder="Alex Chen" className="mt-1.5" required />
                  </div>
                )}

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@orbitra.app" className="mt-1.5" required />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" className="mt-1.5" required />
                </div>

                {mode === "signup" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="age">Age</Label>
                        <Input id="age" type="number" min={12} max={25} placeholder="19" className="mt-1.5" />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" placeholder="Berlin" className="mt-1.5" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="skills">Skills</Label>
                      <div className="mt-1.5 flex gap-2">
                        <Input
                          id="skills"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSkill();
                            }
                          }}
                          placeholder="Add a skill and press Enter"
                        />
                        <Button type="button" variant="secondary" onClick={addSkill}>
                          Add
                        </Button>
                      </div>
                      {skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {skills.map((s) => (
                            <Badge
                              key={s}
                              variant="secondary"
                              className="gap-1 bg-primary/15 text-foreground hover:bg-primary/25"
                            >
                              {s}
                              <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))}>
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="mt-2 h-11 w-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
                >
                  {mode === "login" ? "Log in" : "Create account"}
                </Button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing, you agree to Orbitra's Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
