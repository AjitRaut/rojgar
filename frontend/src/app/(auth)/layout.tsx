import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Logo } from "@/components/shared/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.15),transparent_60%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.15),transparent_55%)]"
        aria-hidden
      />
      <header className="border-b bg-background/60 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Home
            </Link>
          </div>
        </div>
      </header>
      <main className="container flex flex-1 items-center justify-center py-10">
        {children}
      </main>
    </div>
  );
}
