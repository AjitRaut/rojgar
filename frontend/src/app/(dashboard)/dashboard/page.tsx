"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  IndianRupee,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/shared/StatCard";
import { JobCard } from "@/components/jobs/JobCard";
import { CenteredSpinner, EmptyState } from "@/components/shared/States";
import { useAuth } from "@/lib/hooks/use-auth";
import { useJobs, useMyApplications, useMyPostedJobs } from "@/lib/hooks/use-jobs";
import { useMyWorkerProfile } from "@/lib/hooks/use-workers";

export default function DashboardPage() {
  const { user } = useAuth();
  const isWorker = user?.role === "worker";
  const isPoster = user?.role === "customer" || user?.role === "company";

  const recentJobs = useJobs({ page: 1, page_size: 6 });
  const myPosted = useMyPostedJobs(1, 5);
  const myApps = useMyApplications();
  const workerProfile = useMyWorkerProfile(isWorker);

  if (!user) return <CenteredSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {user.full_name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here's what's happening on Rojgar Find today.
        </p>
      </div>

      {isPoster && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={ClipboardList}
              label="My Posted Jobs"
              value={myPosted.data?.total ?? "—"}
              tone="default"
            />
            <StatCard
              icon={Briefcase}
              label="Active Open Jobs"
              value={myPosted.data?.items.filter((j) => j.status === "open").length ?? "—"}
              tone="success"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completed"
              value={myPosted.data?.items.filter((j) => j.status === "completed").length ?? "—"}
              tone="info"
            />
            <StatCard
              icon={Sparkles}
              label="AI Suggestions"
              value="Live"
              hint="Get smart worker recommendations"
              tone="warning"
            />
          </div>

          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <div>
                <h2 className="text-xl font-bold">Need workers urgently?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Post a job in 30 seconds and get AI-matched workers.
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/jobs/new">
                    Post a job <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/workers">
                    <Search className="h-4 w-4" /> Find workers
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {isWorker && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Star}
              label="My Rating"
              value={workerProfile.data?.rating_avg.toFixed(1) ?? "0.0"}
              hint={`${workerProfile.data?.total_reviews ?? 0} reviews`}
              tone="warning"
            />
            <StatCard
              icon={CheckCircle2}
              label="Jobs Completed"
              value={workerProfile.data?.total_jobs_completed ?? 0}
              tone="success"
            />
            <StatCard
              icon={ClipboardList}
              label="Applications"
              value={myApps.data?.length ?? "—"}
              tone="info"
            />
            <StatCard
              icon={IndianRupee}
              label="Daily Rate"
              value={workerProfile.data?.daily_rate ? `₹${workerProfile.data.daily_rate}` : "—"}
              hint="Set in profile"
              tone="default"
            />
          </div>

          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <div>
                <h2 className="text-xl font-bold">Browse available jobs</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Find daily work matching your skills nearby.
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/jobs">
                    Browse jobs <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/worker-profile">Update profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {user.role === "admin" && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-4 text-xl font-bold">Admin tools</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage users, complaints, and view platform analytics.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/admin">Go to admin overview</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Latest jobs</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/jobs">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        {recentJobs.isLoading ? (
          <CenteredSpinner />
        ) : recentJobs.data?.items.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs posted yet"
            description="When new jobs are posted, they'll appear here."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentJobs.data?.items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
