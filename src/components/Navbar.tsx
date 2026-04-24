import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import logo from "@/assets/orbitra-logo.jpg";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2" aria-label="Orbitra home">
          <img
            src={logo}
            alt="Orbitra logo"
            className="h-10 w-auto object-contain"
            style={{ mixBlendMode: "screen" }}
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/dashboard" className="text-sm text-muted-foreground transition hover:text-foreground">
            Feed
          </Link>
          <Link to="/messages" className="text-sm text-muted-foreground transition hover:text-foreground">
            Messages
          </Link>
          <Link to="/profile" className="text-sm text-muted-foreground transition hover:text-foreground">
            Profile
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Log out
            </Button>
          ) : (
            <>
              <Link to="/auth" search={{ mode: "login" }}>
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
