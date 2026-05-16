"use client";

import {
  Briefcase,
  Building2,
  CheckCircle2,
  ClipboardList,
  ShieldAlert,
  Users,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { CenteredSpinner, ErrorState } from "@/components/shared/States";
import { useAdminAnalytics } from "@/lib/hooks/use-admin";

export default function AdminOverviewPage() {
  const { data, isLoading, isError } = useAdminAnalytics();

  if (isLoading) return <CenteredSpinner />;
  if (isError || !data) return <ErrorState />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Overview"
        description="Platform analytics and key metrics"
      />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Users
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Total Users" value={data.users.total} tone="default" />
          <StatCard icon={Wrench} label="Workers" value={data.users.workers} tone="success" />
          <StatCard
            icon={Users}
            label="Customers"
            value={data.users.customers}
            tone="info"
          />
          <StatCard
            icon={Building2}
            label="Companies"
            value={data.users.companies}
            tone="warning"
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Jobs
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Briefcase}
            label="Total Jobs"
            value={data.jobs.total}
            tone="default"
          />
          <StatCard
            icon={ClipboardList}
            label="Open Jobs"
            value={data.jobs.open}
            tone="success"
          />
          <StatCard
            icon={Briefcase}
            label="In Progress"
            value={data.jobs.in_progress}
            tone="info"
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={data.jobs.completed}
            tone="warning"
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Moderation
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            icon={ShieldAlert}
            label="Open Complaints"
            value={data.complaints.open}
            tone="danger"
          />
          <StatCard
            icon={CheckCircle2}
            label="Pending Verifications"
            value={data.verifications.pending}
            tone="warning"
          />
        </div>
      </div>
    </div>
  );
}
