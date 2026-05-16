"use client";

import { useState } from "react";
import { Loader2, Plus, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/PageHeader";
import { CenteredSpinner, EmptyState } from "@/components/shared/States";
import { useCreateComplaint, useMyComplaints } from "@/lib/hooks/use-complaints";
import { formatDate } from "@/lib/utils";

export default function ComplaintsPage() {
  const list = useMyComplaints();
  const create = useCreateComplaint();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const submit = () => {
    if (!subject || !description) return;
    create.mutate(
      { subject, description },
      {
        onSuccess: () => {
          setSubject("");
          setDescription("");
          setOpen(false);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Complaints"
        description="Raise an issue and our admin team will respond"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Raise complaint
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New complaint</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="sub">Subject</Label>
                  <Input
                    id="sub"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Briefly describe the issue"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea
                    id="desc"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add details, what happened, who was involved..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={submit}
                  disabled={create.isPending || !subject || !description}
                >
                  {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {list.isLoading ? (
        <CenteredSpinner />
      ) : !list.data || list.data.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No complaints yet"
          description="If you face any issue, raise a complaint and we'll review it."
        />
      ) : (
        <div className="space-y-3">
          {list.data.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{c.subject}</h3>
                    <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                      {c.description}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Raised {formatDate(c.created_at)}
                    </p>
                    {c.admin_response && (
                      <div className="mt-3 rounded-md border bg-muted/30 p-3 text-sm">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Admin response
                        </p>
                        <p className="mt-1">{c.admin_response}</p>
                      </div>
                    )}
                  </div>
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
