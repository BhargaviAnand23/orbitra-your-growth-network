import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { getProfile, updateProfile, type Profile } from "@/services/profiles";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Orbitra" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth", search: { mode: "login" } });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then((p) => { setProfile(p); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setSaving(true);
    try {
      const updated = await updateProfile(user.id, profile);
      setProfile(updated);
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v || !profile) return;
    if (profile.skills.includes(v)) return;
    setProfile({ ...profile, skills: [...profile.skills, v] });
    setSkillInput("");
  };

  if (authLoading || loading || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <p className="py-20 text-center text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-1 font-display text-3xl font-bold">Your profile</h1>
        <p className="mb-8 text-sm text-muted-foreground">Tell people who you are and what you're working on.</p>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" min={12} max={100} value={profile.age ?? ""} onChange={(e) => setProfile({ ...profile, age: e.target.value ? Number(e.target.value) : null })} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="loc">Location</Label>
              <Input id="loc" value={profile.location ?? ""} onChange={(e) => setProfile({ ...profile, location: e.target.value })} className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={3} value={profile.bio ?? ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="skill">Skills</Label>
            <div className="mt-1.5 flex gap-2">
              <Input id="skill" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} placeholder="Add a skill" />
              <Button type="button" variant="secondary" onClick={addSkill}>Add</Button>
            </div>
            {profile.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {profile.skills.map((s) => (
                  <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => setProfile({ ...profile, skills: profile.skills.filter((x) => x !== s) })}>
                    {s} ✕
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Button type="submit" disabled={saving} className="bg-gradient-primary text-primary-foreground shadow-glow">
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </main>
    </div>
  );
}
