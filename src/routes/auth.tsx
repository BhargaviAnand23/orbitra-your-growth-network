import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrbitBackground } from "@/components/OrbitBackground";
import { Orbit } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

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
  const { signIn, signUp } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const setMode = (m: AuthMode) => navigate({ to: "/auth", search: { mode: m } });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, fullName);
        toast.success("Account created — welcome to Orbitra!");
      } else {
        await signIn(email, password);
        toast.success("Welcome back");
      }
      navigate({ to: "/dashboard" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
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
                    <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Chen" className="mt-1.5" required />
                  </div>
                )}

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@orbitra.app" className="mt-1.5" required />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1.5" required minLength={6} />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 h-11 w-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
                >
                  {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
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
