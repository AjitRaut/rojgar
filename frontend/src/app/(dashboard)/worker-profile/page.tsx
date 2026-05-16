"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/PageHeader";
import { CenteredSpinner, ErrorState } from "@/components/shared/States";
import { useMyWorkerProfile, useUpdateMyWorkerProfile } from "@/lib/hooks/use-workers";
import { useOptimizeProfile } from "@/lib/hooks/use-ai";
import { workerProfileSchema, type WorkerProfileInput } from "@/lib/validators/forms";

export default function WorkerProfilePage() {
  const profileQ = useMyWorkerProfile();
  const update = useUpdateMyWorkerProfile();
  const optimize = useOptimizeProfile();
  const [skillsInput, setSkillsInput] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WorkerProfileInput>({
    resolver: zodResolver(workerProfileSchema),
    defaultValues: { is_available: true, experience_years: 0 },
  });

  useEffect(() => {
    if (profileQ.data) {
      reset({
        primary_skill: profileQ.data.primary_skill || "",
        skills: profileQ.data.skills || [],
        experience_years: profileQ.data.experience_years,
        daily_rate: profileQ.data.daily_rate ?? undefined,
        hourly_rate: profileQ.data.hourly_rate ?? undefined,
        bio: profileQ.data.bio || "",
        city: profileQ.data.city || "",
        state: profileQ.data.state || "",
        pincode: profileQ.data.pincode || "",
        address: profileQ.data.address || "",
        is_available: profileQ.data.is_available,
      });
      setSkillsInput((profileQ.data.skills || []).join(", "));
    }
  }, [profileQ.data, reset]);

  const bio = watch("bio") || "";
  const exp = watch("experience_years");

  const runOptimize = async () => {
    const skills = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
    const result = await optimize.mutateAsync({
      bio,
      skills,
      experience_years: exp || 0,
    });
    setValue("bio", result.improved_bio);
  };

  const onSubmit = (data: WorkerProfileInput) => {
    const skills = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
    update.mutate({
      ...data,
      skills,
      primary_skill: data.primary_skill || undefined,
      bio: data.bio || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      pincode: data.pincode || undefined,
      address: data.address || undefined,
    });
  };

  if (profileQ.isLoading) return <CenteredSpinner />;
  if (profileQ.isError) return <ErrorState />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Worker Profile"
        description="Keep your profile sharp to win more jobs"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primary_skill">Primary skill</Label>
                <Input id="primary_skill" placeholder="e.g. Plumbing" {...register("primary_skill")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience_years">Experience (years)</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min={0}
                  max={80}
                  {...register("experience_years")}
                />
                {errors.experience_years && (
                  <p className="text-xs text-destructive">{errors.experience_years.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <Input
                id="skills"
                placeholder="plumbing, pipe-fitting, water-heater installation"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="daily_rate">Daily rate (₹)</Label>
                <Input id="daily_rate" type="number" min={0} {...register("daily_rate")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly rate (₹)</Label>
                <Input id="hourly_rate" type="number" min={0} {...register("hourly_rate")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">About me</Label>
              <Textarea
                id="bio"
                rows={4}
                placeholder="Briefly describe your experience and specialties..."
                {...register("bio")}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={runOptimize}
                disabled={optimize.isPending}
              >
                {optimize.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                AI: rewrite my bio
              </Button>
              {optimize.data?.suggestions && optimize.data.suggestions.length > 0 && (
                <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                  <p className="mb-1 font-semibold">AI suggestions:</p>
                  <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
                    {optimize.data.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <h3 className="font-semibold">Location</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register("city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" {...register("state")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" {...register("pincode")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register("address")} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register("is_available")}
                className="h-4 w-4 rounded border-input"
              />
              I'm currently available for jobs
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
