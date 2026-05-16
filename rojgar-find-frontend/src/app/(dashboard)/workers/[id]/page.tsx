"use client";

import { useParams } from "next/navigation";
import { BadgeCheck, MapPin, Star, Briefcase, IndianRupee, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorState } from "@/components/shared/States";
import { useWorker } from "@/lib/hooks/use-workers";
import { useReviewsForUser } from "@/lib/hooks/use-reviews";
import { formatCurrency, formatRelativeTime, getInitials } from "@/lib/utils";

export default function WorkerDetailPage() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const { data: worker, isLoading, isError } = useWorker(userId);
  const { data: reviews } = useReviewsForUser(userId);

  if (isError) return <ErrorState message="Worker not found" />;

  if (isLoading || !worker) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Worker Profile" description={worker.primary_skill || "Skilled worker"} />

      <Card>
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-start">
          <Avatar className="h-24 w-24 ring-4 ring-primary/10">
            <AvatarFallback className="text-2xl">{getInitials(worker.full_name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold">{worker.full_name}</h2>
                {worker.is_aadhaar_verified && (
                  <Badge variant="success" className="gap-1">
                    <BadgeCheck className="h-3 w-3" /> Verified
                  </Badge>
                )}
                {worker.is_available && <Badge variant="accent">Available</Badge>}
              </div>
              <p className="mt-1 text-muted-foreground">{worker.primary_skill || "General Worker"}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{worker.rating_avg.toFixed(1)}</span>
                <span className="text-muted-foreground">({worker.total_reviews} reviews)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Briefcase className="h-4 w-4" /> {worker.experience_years} years experience
              </span>
              {worker.city && (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {worker.city}
                  {worker.state ? `, ${worker.state}` : ""}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-4 w-4" /> {worker.total_jobs_completed} jobs completed
              </span>
            </div>

            {worker.skills?.length ? (
              <div className="flex flex-wrap gap-2">
                {worker.skills.map((s) => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            ) : null}

            {worker.bio && (
              <>
                <Separator />
                <p className="text-sm leading-relaxed">{worker.bio}</p>
              </>
            )}

            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Daily Rate</p>
                <p className="inline-flex items-center text-lg font-semibold">
                  <IndianRupee className="h-4 w-4" />
                  {worker.daily_rate ? formatCurrency(worker.daily_rate).replace("₹", "") : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Hourly Rate</p>
                <p className="inline-flex items-center text-lg font-semibold">
                  <IndianRupee className="h-4 w-4" />
                  {worker.hourly_rate ? formatCurrency(worker.hourly_rate).replace("₹", "") : "—"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {!reviews || reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="mb-1 flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={
                          i < r.rating
                            ? "h-4 w-4 fill-amber-400 text-amber-400"
                            : "h-4 w-4 text-muted-foreground"
                        }
                      />
                    ))}
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(r.created_at)}
                    </span>
                  </div>
                  {r.comment && <p className="text-sm">{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
