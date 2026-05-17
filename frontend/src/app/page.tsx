import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  IndianRupee,
  Search,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JOB_CATEGORIES } from "@/lib/constants";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Worker Matching",
    description:
      "Our AI ranks workers by skill, location, rating, and experience so you get the best match in seconds.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Profiles",
    description:
      "Aadhaar-verified workers and GST-verified companies. Trust built into every hire.",
  },
  {
    icon: IndianRupee,
    title: "Fair Daily Wages",
    description:
      "AI-suggested fair wages based on skill, city, and experience. No more bargaining.",
  },
  {
    icon: Users,
    title: "B2C + B2B",
    description:
      "From single household jobs to bulk hiring for construction sites — one platform for all.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b">
          <div
            className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.18),transparent_60%),radial-gradient(circle_at_bottom_left,hsl(var(--accent)/0.18),transparent_50%)]"
            aria-hidden
          />
          <div className="container py-16 lg:py-24">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="space-y-6">
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  <Sparkles className="mr-1 h-3 w-3 text-primary" />
                  AI-powered hiring
                </Badge>
                <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                  Hire <span className="gradient-text">local workers</span> in seconds.
                  Find <span className="gradient-text">daily jobs</span> faster.
                </h1>
                <p className="max-w-xl text-lg text-muted-foreground">
                  Rojgar connects households, companies, and skilled workers — plumbers,
                  electricians, carpenters, painters, and more — with AI-powered matching,
                  verified profiles, and fair wages.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href="/register">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/login">I have an account</Link>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-4">
                  {JOB_CATEGORIES.slice(0, 8).map((c) => (
                    <Badge key={c} variant="outline" className="font-normal">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Card className="overflow-hidden border-2 shadow-2xl">
                  <CardContent className="grid grid-cols-2 gap-4 p-6">
                    {[
                      { icon: Search, label: "Find workers", color: "primary" },
                      { icon: Briefcase, label: "Post jobs", color: "accent" },
                      { icon: Wrench, label: "Skilled labor", color: "primary" },
                      { icon: Users, label: "Bulk hiring", color: "accent" },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="flex flex-col items-start gap-3 rounded-xl border bg-muted/30 p-4"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <p className="text-sm font-medium">{item.label}</p>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b">
          <div className="container py-16 lg:py-20">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Built for the modern workforce
              </h2>
              <p className="mt-3 text-muted-foreground">
                Everything you need to hire smartly or get hired faster.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <Card key={f.title} className="h-full">
                    <CardContent className="space-y-3 p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold">{f.title}</h3>
                      <p className="text-sm text-muted-foreground">{f.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <div className="container py-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Ready to <span className="gradient-text">get started</span>?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Join Rojgar and find your next worker or your next job today.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/register">Create free account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} Rojgar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
