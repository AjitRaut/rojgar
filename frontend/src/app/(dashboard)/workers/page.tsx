"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { WorkerCard } from "@/components/workers/WorkerCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkers } from "@/lib/hooks/use-workers";
import { JOB_CATEGORIES } from "@/lib/constants";

export default function WorkersPage() {
  const [search, setSearch] = useState({ skill: "", city: "" });
  const [filters, setFilters] = useState<{ skill?: string; city?: string }>({});
  const { data, isLoading, isError } = useWorkers({ ...filters, page_size: 24 });

  const apply = () => {
    setFilters({
      skill: search.skill || undefined,
      city: search.city || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Find Workers"
        description="Search verified skilled workers in your area"
      />

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <Select
          value={search.skill || "_any"}
          onValueChange={(v) => setSearch((s) => ({ ...s, skill: v === "_any" ? "" : v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="All skills" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_any">All skills</SelectItem>
            {JOB_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="City"
          value={search.city}
          onChange={(e) => setSearch((s) => ({ ...s, city: e.target.value }))}
          onKeyDown={(e) => e.key === "Enter" && apply()}
        />
        <Button onClick={apply}>
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>

      {isError && <ErrorState message="Unable to load workers" />}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No workers found"
          description="Try adjusting your filters or expand your search area"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((w, i) => (
            <WorkerCard key={w.user_id} worker={w} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
