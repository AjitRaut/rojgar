"use client";

import { useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { CenteredSpinner, EmptyState, ErrorState } from "@/components/shared/States";
import { useAdminComplaints, useUpdateComplaint } from "@/lib/hooks/use-admin";
import { formatDate } from "@/lib/utils";
import type { Complaint, ComplaintStatus } from "@/types/api";

export default function AdminComplaintsPage() {
  const { data, isLoading, isError } = useAdminComplaints();
  const update = useUpdateComplaint();

  const [selected, setSelected] = useState<Complaint | null>(null);
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState<ComplaintStatus>("open");

  const openDialog = (c: Complaint) => {
    setSelected(c);
    setResponse(c.admin_response || "");
    setStatus(c.status);
  };

  const submit = () => {
    if (!selected) return;
    update.mutate(
      { id: selected.id, status, admin_response: response || undefined },
      { onSuccess: () => setSelected(null) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="All Complaints" description="Review and resolve user complaints" />

      {isLoading ? (
        <CenteredSpinner />
      ) : isError ? (
        <ErrorState />
      ) : !data || data.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="No complaints" />
      ) : (
        <div className="space-y-3">
          {data.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{c.subject}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {c.description}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      From user #{c.raised_by_id} · {formatDate(c.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        c.status === "resolved"
                          ? "default"
                          : c.status === "rejected"
                          ? "destructive"
                          : "outline"
                      }
                      className="uppercase"
                    >
                      {c.status.replace("_", " ")}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => openDialog(c)}>
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 py-2">
              <p className="rounded-md bg-muted/30 p-3 text-sm">{selected.description}</p>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ComplaintStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Admin response</Label>
                <Textarea
                  rows={4}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Add your response to the user..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={update.isPending}>
              {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
