"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { CenteredSpinner, EmptyState, ErrorState } from "@/components/shared/States";
import { useMyApplications } from "@/lib/hooks/use-jobs";
import { formatDate } from "@/lib/utils";

export default function MyApplicationsPage() {
  const { data, isLoading, isError } = useMyApplications();

  return (
    <div className="space-y-6">
      <PageHeader title="My Applications" description="Track the jobs you've applied to" />

      {isLoading ? (
        <CenteredSpinner />
      ) : isError ? (
        <ErrorState />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No applications yet"
          description="Browse available jobs and start applying."
          action={
            <Button asChild className="mt-2">
              <Link href="/jobs">Browse jobs</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {data.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <Link
                    href={`/jobs/${a.job_id}`}
                    className="font-semibold hover:text-primary hover:underline"
                  >
                    Job #{a.job_id}
                  </Link>
                  {a.cover_message && (
                    <p className="mt-1 text-sm text-muted-foreground">{a.cover_message}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Applied {formatDate(a.created_at)}
                    {a.proposed_rate && ` · Proposed ₹${a.proposed_rate}/day`}
                  </p>
                </div>
                <Badge
                  variant={
                    a.status === "accepted"
                      ? "default"
                      : a.status === "rejected"
                      ? "destructive"
                      : "outline"
                  }
                  className="uppercase"
                >
                  {a.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
