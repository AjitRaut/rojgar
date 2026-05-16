"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  IndianRupee,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/PageHeader";
import { CenteredSpinner, ErrorState } from "@/components/shared/States";
import {
  useApplyJob,
  useCompleteJob,
  useDecideApplication,
  useJob,
  useJobApplications,
} from "@/lib/hooks/use-jobs";
import { useAuth } from "@/lib/hooks/use-auth";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const jobId = parseInt(params.id, 10);
  const { user } = useAuth();

  const { data: job, isLoading, isError } = useJob(jobId);
  const applyMut = useApplyJob();
  const completeMut = useCompleteJob();
  const decideMut = useDecideApplication();

  const isOwner = job?.posted_by_id === user?.id;
  const applications = useJobApplications(jobId);

  const [coverMsg, setCoverMsg] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [applyOpen, setApplyOpen] = useState(false);

  if (isLoading) return <CenteredSpinner />;
  if (isError || !job) return <ErrorState message="Job not found" />;

  const canApply = user?.role === "worker" && !isOwner && job.status === "open";
  const canComplete = isOwner && job.status === "in_progress";

  const handleApply = () => {
    applyMut.mutate(
      {
        jobId: job.id,
        payload: {
          cover_message: coverMsg || undefined,
          proposed_rate: proposedRate ? parseFloat(proposedRate) : undefined,
        },
      },
      {
        onSuccess: () => {
          setApplyOpen(false);
          setCoverMsg("");
          setProposedRate("");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title={job.title} description={`Posted ${formatRelativeTime(job.created_at)}`} />

      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="uppercase">
              {job.status.replace("_", " ")}
            </Badge>
            {job.is_urgent && <Badge variant="destructive">Urgent</Badge>}
            <Badge variant="secondary">{job.category}</Badge>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{job.description}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <IndianRupee className="h-3 w-3" /> Daily wage
              </p>
              <p className="mt-1 font-semibold">{formatCurrency(job.daily_wage)}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" /> Workers needed
              </p>
              <p className="mt-1 font-semibold">{job.workers_needed}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> Duration
              </p>
              <p className="mt-1 font-semibold">{job.duration_days} days</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> Location
              </p>
              <p className="mt-1 font-semibold">{job.city}</p>
            </div>
          </div>

          {job.skills_required.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Skills required
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.skills_required.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Posted by{" "}
              <span className="font-medium text-foreground">{job.poster?.full_name || "—"}</span>
            </p>
            <div className="flex gap-2">
              {canApply && (
                <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Briefcase className="h-4 w-4" /> Apply for this job
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply to {job.title}</DialogTitle>
                      <DialogDescription>
                        Add an optional cover message and your proposed rate.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="cover">Cover message (optional)</Label>
                        <Textarea
                          id="cover"
                          rows={3}
                          value={coverMsg}
                          onChange={(e) => setCoverMsg(e.target.value)}
                          placeholder="Why are you a good fit?"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="rate">Proposed daily rate (₹)</Label>
                        <Input
                          id="rate"
                          type="number"
                          min={1}
                          value={proposedRate}
                          onChange={(e) => setProposedRate(e.target.value)}
                          placeholder={String(job.daily_wage)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setApplyOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleApply} disabled={applyMut.isPending}>
                        {applyMut.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Send application"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {canComplete && (
                <Button onClick={() => completeMut.mutate(job.id)} disabled={completeMut.isPending}>
                  <CheckCircle2 className="h-4 w-4" /> Mark completed
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isOwner && (
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold">
              Applications ({applications.data?.length ?? 0})
            </h2>
            {applications.isLoading ? (
              <CenteredSpinner />
            ) : applications.data?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No applications yet.</p>
            ) : (
              <div className="space-y-3">
                {applications.data?.map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">Worker #{a.worker_id}</p>
                      {a.cover_message && (
                        <p className="mt-1 text-sm text-muted-foreground">{a.cover_message}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Applied {formatDate(a.created_at)}
                        {a.proposed_rate && ` · Proposed ₹${a.proposed_rate}/day`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{a.status}</Badge>
                      {a.status === "applied" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => decideMut.mutate({ id: a.id, status: "accepted" })}
                            disabled={decideMut.isPending}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => decideMut.mutate({ id: a.id, status: "rejected" })}
                            disabled={decideMut.isPending}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
