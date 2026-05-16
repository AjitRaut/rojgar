"use client";

import Link from "next/link";
import { useState } from "react";
import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { JobCard } from "@/components/jobs/JobCard";
import { CenteredSpinner, EmptyState, ErrorState } from "@/components/shared/States";
import { useMyPostedJobs } from "@/lib/hooks/use-jobs";

export default function MyJobsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useMyPostedJobs(page, 12);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Posted Jobs"
        description="Jobs you've posted on Rojgar Find"
        action={
          <Button asChild>
            <Link href="/jobs/new">
              <Plus className="h-4 w-4" /> Post a Job
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <CenteredSpinner />
      ) : isError ? (
        <ErrorState />
      ) : data?.items.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          description="Post your first job to start hiring."
          action={
            <Button asChild className="mt-2">
              <Link href="/jobs/new">Post a Job</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data?.items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          {data && data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {data.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.total_pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
