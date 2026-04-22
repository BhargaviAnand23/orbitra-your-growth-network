import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Orbit } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Orbit className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Orbitra</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition hover:text-foreground">
            Features
          </a>
          <a href="#how" className="text-sm text-muted-foreground transition hover:text-foreground">
            How it works
          </a>
          <Link
            to="/dashboard"
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/auth" search={{ mode: "login" }}>
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link to="/auth" search={{ mode: "signup" }}>
            <Button size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
