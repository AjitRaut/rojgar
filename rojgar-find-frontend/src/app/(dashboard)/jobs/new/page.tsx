"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/PageHeader";
import { JOB_CATEGORIES } from "@/lib/constants";
import { useCreateJob } from "@/lib/hooks/use-jobs";
import { useCategorizeJob, useSuggestWage } from "@/lib/hooks/use-ai";
import { jobCreateSchema, type JobCreateInput } from "@/lib/validators/forms";

export default function NewJobPage() {
  const router = useRouter();
  const createJob = useCreateJob();
  const categorize = useCategorizeJob();
  const suggestWage = useSuggestWage();
  const [skillsInput, setSkillsInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobCreateInput>({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: {
      workers_needed: 1,
      duration_days: 1,
      is_urgent: false,
      skills_required: [],
    },
  });

  const description = watch("description");
  const category = watch("category");
  const city = watch("city");

  const onSubmit = (data: JobCreateInput) => {
    const skills = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
    createJob.mutate(
      {
        ...data,
        skills_required: skills,
        state: data.state || undefined,
        pincode: data.pincode || undefined,
        address: data.address || undefined,
      },
      { onSuccess: () => router.push("/jobs/my") }
    );
  };

  const runAICategorize = async () => {
    if (!description || description.length < 10) return;
    const result = await categorize.mutateAsync(description);
    setValue("category", result.category);
    if (result.suggested_title && !watch("title")) {
      setValue("title", result.suggested_title);
    }
    setSkillsInput(result.suggested_skills.join(", "));
  };

  const runAIWage = async () => {
    if (!category || !city) return;
    const result = await suggestWage.mutateAsync({
      skill: category,
      city,
      experience_years: 3,
    });
    setValue("daily_wage", result.suggested_daily_wage);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Post a Job"
        description="Describe what you need and AI will help you set it up"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="description">Job description</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="e.g. Need a plumber to fix leaking bathroom tap and install new water heater."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={runAICategorize}
                disabled={!description || description.length < 10 || categorize.isPending}
              >
                {categorize.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                AI: auto-fill title, category &amp; skills
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g. Plumber needed for bathroom" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setValue("category", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills required (comma separated)</Label>
                <Input
                  id="skills"
                  placeholder="plumbing, pipe-fitting"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <h3 className="font-semibold">Location &amp; wage</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="e.g. Phaltan" {...register("city")} />
                {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" placeholder="Maharashtra" {...register("state")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" placeholder="415523" {...register("pincode")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Optional detailed address" {...register("address")} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="daily_wage">Daily wage (₹)</Label>
                <Input
                  id="daily_wage"
                  type="number"
                  min={1}
                  placeholder="800"
                  {...register("daily_wage")}
                />
                {errors.daily_wage && (
                  <p className="text-xs text-destructive">{errors.daily_wage.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="workers_needed">Workers needed</Label>
                <Input
                  id="workers_needed"
                  type="number"
                  min={1}
                  {...register("workers_needed")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_days">Duration (days)</Label>
                <Input
                  id="duration_days"
                  type="number"
                  min={1}
                  {...register("duration_days")}
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={runAIWage}
              disabled={!category || !city || suggestWage.isPending}
            >
              {suggestWage.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              AI: suggest fair daily wage
            </Button>
            {suggestWage.data && (
              <p className="text-xs text-muted-foreground">
                Suggested ₹{suggestWage.data.suggested_daily_wage} (range ₹{suggestWage.data.min_wage}-{suggestWage.data.max_wage}). {suggestWage.data.reasoning}
              </p>
            )}

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register("is_urgent")}
                className="h-4 w-4 rounded border-input"
              />
              Mark as urgent
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={createJob.isPending}>
            {createJob.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Posting...
              </>
            ) : (
              "Post Job"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
