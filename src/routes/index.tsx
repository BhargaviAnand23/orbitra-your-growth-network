import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Compass, Users, Sparkles, MessageCircle, Target, Rocket } from "lucide-react";
import heroImage from "@/assets/hero-orbit.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orbitra — Find your people. Build your future." },
      {
        name: "description",
        content:
          "Orbitra is the social platform for students, creators, and early job seekers to discover opportunities and connect with peers who share their goals.",
      },
      { property: "og:title", content: "Orbitra — Find your people. Build your future." },
      {
        property: "og:description",
        content: "Discover internships, gigs, events, and collaborators. Build your skills profile and grow with your generation.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-orbit-pulse" />
            A new social layer for ambitious 12–25 year olds
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
          >
            Find your people.
            <br />
            <span className="text-gradient-primary">Build your future.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg"
          >
            Skip the noise. Orbitra connects you with real opportunities and peers who share your skills, interests, and ambition.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link to="/auth" search={{ mode: "signup" }}>
              <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow h-12 px-7 text-base">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="ghost" className="h-12 px-6 text-base">
                See how it works
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-16 flex items-center gap-8 text-xs text-muted-foreground"
          >
            <div>
              <div className="font-display text-2xl text-foreground">10k+</div>
              <div>Young builders</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="font-display text-2xl text-foreground">2.4k</div>
              <div>Opportunities</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="font-display text-2xl text-foreground">180+</div>
              <div>Skill clusters</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 max-w-2xl">
          <div className="mb-3 text-xs uppercase tracking-widest text-accent">Built for growth</div>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Not another feed.
            <br />
            <span className="text-gradient">A launchpad.</span>
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "Skill-based profiles",
              desc: "Showcase what you're great at, what you're learning, and what you want to build next.",
            },
            {
              icon: Compass,
              title: "Opportunity feed",
              desc: "Internships, gigs, hackathons, and collabs — curated for your skills and goals.",
            },
            {
              icon: Users,
              title: "Peer connections",
              desc: "Discover people on the same trajectory. Collaborate, learn, and grow together.",
            },
            {
              icon: MessageCircle,
              title: "Direct messaging",
              desc: "Frictionless 1-to-1 chat with connections — no algorithms in between.",
            },
            {
              icon: Target,
              title: "Goal tracking",
              desc: "Set ambitions publicly and let your network help you get there faster.",
            },
            {
              icon: Rocket,
              title: "Project showcase",
              desc: "Pin your work and let your shipped projects speak louder than your follower count.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card-glass p-6 transition hover:border-primary/40"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl opacity-0 transition group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 text-center">
          <div className="mb-3 text-xs uppercase tracking-widest text-accent">How it works</div>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Three steps to your <span className="text-gradient-primary">orbit</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { n: "01", t: "Build your profile", d: "Add your skills, projects, and what you're chasing. Takes under 2 minutes." },
            { n: "02", t: "Discover opportunities", d: "Get a personalized feed of internships, gigs, and events that fit your trajectory." },
            { n: "03", t: "Connect & collaborate", d: "Reach out to peers and mentors. Ship things together. Build proof of work." },
          ].map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-border bg-card-glass p-8">
              <div className="mb-4 font-display text-5xl font-bold text-gradient-primary">{s.n}</div>
              <h3 className="mb-2 font-display text-xl font-semibold">{s.t}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-5xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card-glass p-12 text-center shadow-elevated md:p-20">
          <div className="absolute inset-0 opacity-50">
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Your generation is <span className="text-gradient-primary">already here.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
              Join the network where talent finds traction — not just likes.
            </p>
            <div className="mt-8">
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow h-12 px-8 text-base">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-xs text-muted-foreground md:flex-row">
          <div>© 2026 Orbitra. Built for the next generation.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
