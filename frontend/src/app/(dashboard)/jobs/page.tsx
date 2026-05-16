"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobCard } from "@/components/jobs/JobCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { useJobs } from "@/lib/hooks/use-jobs";
import { JOB_CATEGORIES } from "@/lib/constants";

export default function JobsListPage() {
  const [draft, setDraft] = useState({ category: "", city: "", search: "" });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const { data, isLoading, isError } = useJobs({ ...filters, status: "open", page_size: 24 });

  const apply = () => {
    const next: Record<string, string> = {};
    if (draft.category) next.category = draft.category;
    if (draft.city) next.city = draft.city;
    if (draft.search) next.search = draft.search;
    setFilters(next);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Browse Jobs" description="Find daily jobs that match your skills" />

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <Input
          placeholder="Search jobs..."
          value={draft.search}
          onChange={(e) => setDraft((d) => ({ ...d, search: e.target.value }))}
          onKeyDown={(e) => e.key === "Enter" && apply()}
        />
        <Select
          value={draft.category || "_any"}
          onValueChange={(v) =>
            setDraft((d) => ({ ...d, category: v === "_any" ? "" : v }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_any">All categories</SelectItem>
            {JOB_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="City"
          value={draft.city}
          onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
          onKeyDown={(e) => e.key === "Enter" && apply()}
        />
        <Button onClick={apply}>
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>

      {isError && <ErrorState message="Unable to load jobs" />}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="No jobs found" description="Try adjusting filters or check back later" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((j, i) => (
            <JobCard key={j.id} job={j} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
