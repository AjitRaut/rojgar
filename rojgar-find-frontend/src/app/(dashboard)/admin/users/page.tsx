"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { CenteredSpinner, EmptyState, ErrorState } from "@/components/shared/States";
import { useAdminUsers, useToggleUserActive, useVerifyUser } from "@/lib/hooks/use-admin";
import type { UserRole } from "@/types/api";

export default function AdminUsersPage() {
  const [role, setRole] = useState<string>("__all__");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useAdminUsers({
    role: role && role !== "__all__" ? (role as UserRole) : undefined,
    page,
    page_size: 20,
  });
  const toggle = useToggleUserActive();
  const verify = useVerifyUser();

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description="View, verify, and moderate users" />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <span className="text-sm font-medium">Filter by role:</span>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All roles</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="worker">Worker</SelectItem>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <CenteredSpinner />
      ) : isError ? (
        <ErrorState />
      ) : !data || data.items.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {data.items.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{u.full_name}</p>
                        <Badge variant="secondary" className="text-xs uppercase">
                          {u.role}
                        </Badge>
                        {u.is_verified && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Verified
                          </Badge>
                        )}
                        {!u.is_active && (
                          <Badge variant="destructive" className="text-xs">Disabled</Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{u.email}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {!u.is_verified && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verify.mutate(u.id)}
                          disabled={verify.isPending}
                        >
                          {verify.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={u.is_active ? "destructive" : "default"}
                        onClick={() => toggle.mutate(u.id)}
                        disabled={toggle.isPending}
                      >
                        {u.is_active ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2">
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
