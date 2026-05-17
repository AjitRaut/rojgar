"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { CenteredSpinner, ErrorState } from "@/components/shared/States";
import { JOB_CATEGORIES } from "@/lib/constants";
import { useJob, useUpdateJob } from "@/lib/hooks/use-jobs";
import { useAuth } from "@/lib/hooks/use-auth";
import { jobCreateSchema, type JobCreateInput } from "@/lib/validators/forms";

export default function EditJobPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const jobId = parseInt(params.id, 10);
  const { user } = useAuth();

  const { data: job, isLoading, isError } = useJob(jobId);
  const update = useUpdateJob();
  const [skillsInput, setSkillsInput] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobCreateInput>({
    resolver: zodResolver(jobCreateSchema),
  });

  const category = watch("category");

  useEffect(() => {
    if (job) {
      reset({
        title: job.title,
        description: job.description,
        category: job.category,
        skills_required: job.skills_required,
        workers_needed: job.workers_needed,
        daily_wage: job.daily_wage,
        duration_days: job.duration_days,
        city: job.city,
        state: job.state || "",
        pincode: job.pincode || "",
        address: job.address || "",
        is_urgent: job.is_urgent,
      });
      setSkillsInput((job.skills_required || []).join(", "));
    }
  }, [job, reset]);

  if (isLoading) return <CenteredSpinner />;
  if (isError || !job) return <ErrorState message="Job not found" />;
  if (job.posted_by_id !== user?.id) {
    return <ErrorState message="You can only edit jobs you posted" />;
  }

  const onSubmit = (data: JobCreateInput) => {
    const skills = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
    update.mutate(
      {
        id: jobId,
        payload: {
          ...data,
          skills_required: skills,
          state: data.state || undefined,
          pincode: data.pincode || undefined,
          address: data.address || undefined,
        },
      },
      { onSuccess: () => router.push(`/jobs/${jobId}`) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Job" description="Update the details of your job posting" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} {...register("description")} />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setValue("category", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills required (comma separated)</Label>
                <Input
                  id="skills"
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
                <Input id="city" {...register("city")} />
                {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
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

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="daily_wage">Daily wage (₹)</Label>
                <Input id="daily_wage" type="number" min={1} {...register("daily_wage")} />
                {errors.daily_wage && (
                  <p className="text-xs text-destructive">{errors.daily_wage.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="workers_needed">Workers needed</Label>
                <Input id="workers_needed" type="number" min={1} {...register("workers_needed")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_days">Duration (days)</Label>
                <Input id="duration_days" type="number" min={1} {...register("duration_days")} />
              </div>
            </div>

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