"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2, UserCircle, UserPlus, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";
import { useAuth, useRegister } from "@/lib/hooks/use-auth";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";

type SignupRole = "customer" | "worker" | "company";

const ROLES: {
  value: SignupRole;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "customer", label: "Customer", icon: UserCircle },
  { value: "worker", label: "Worker", icon: Wrench },
  { value: "company", label: "Company", icon: Building2 },
];

function RegisterPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const roleParam = params.get("role") as SignupRole | null;
  const initialRole: SignupRole =
    roleParam && ["customer", "worker", "company"].includes(roleParam)
      ? roleParam
      : "customer";

  const { accessToken, hydrated } = useAuth();
  const reg = useRegister();

  useEffect(() => {
    if (hydrated && accessToken) router.replace("/dashboard");
  }, [hydrated, accessToken, router]);

  const {
    register: formReg,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: initialRole },
  });

  const selectedRole = watch("role");

  return (
    <Card className="w-full max-w-lg border-border/60 shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Create your account</CardTitle>
        <CardDescription>Get started with Rojgar Find in seconds</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((d) => reg.mutate({ ...d, phone: d.phone || undefined }))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>I am a</Label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const active = selectedRole === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setValue("role", r.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-sm font-medium transition-all",
                      active
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/40 hover:bg-muted"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {r.label}
                  </button>
                );
              })}
            </div>
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">
              {selectedRole === "company" ? "Company name" : "Full name"}
            </Label>
            <Input
              id="full_name"
              autoComplete="name"
              placeholder={selectedRole === "company" ? "ABC Construction Pvt Ltd" : "Your name"}
              {...formReg("full_name")}
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...formReg("email")}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="9876543210"
                {...formReg("phone")}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              {...formReg("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={reg.isPending}>
            {reg.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating account...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" /> Create account
              </>
            )}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageInner />
    </Suspense>
  );
}