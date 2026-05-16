"use client";

import { useState } from "react";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReview } from "@/lib/hooks/use-reviews";
import { cn } from "@/lib/utils";
import type { ReviewType } from "@/types/api";

interface Props {
  jobId: number;
  revieweeId: number;
  revieweeName: string;
  reviewType: ReviewType;
  trigger?: React.ReactNode;
}

export function ReviewDialog({ jobId, revieweeId, revieweeName, reviewType, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const create = useCreateReview();

  const submit = () => {
    if (rating < 1) return;
    create.mutate(
      {
        job_id: jobId,
        reviewee_id: revieweeId,
        rating,
        comment: comment || undefined,
        review_type: reviewType,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setRating(0);
          setComment("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Star className="h-4 w-4" /> Leave review
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review {revieweeName}</DialogTitle>
          <DialogDescription>
            Share your experience working on this job. Reviews help build trust on Rojgar Find.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  className="rounded p-1 transition-transform hover:scale-110"
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      (hover || rating) >= n
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/40"
                    )}
                  />
                </button>
              ))}
              {rating > 0 && <span className="ml-2 text-sm font-medium">{rating} / 5</span>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                reviewType === "customer_to_worker"
                  ? "How was their work quality, punctuality, and behavior?"
                  : "How was the workplace, payment, and overall experience?"
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={rating < 1 || create.isPending}>
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}