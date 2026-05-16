"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, getInitials } from "@/lib/utils";
import type { WorkerPublic } from "@/types/api";

export function WorkerCard({ worker, index = 0 }: { worker: WorkerPublic; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
    >
      <Card className="group h-full transition-shadow hover:shadow-lg">
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/10">
              <AvatarFallback>{getInitials(worker.full_name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h3 className="truncate font-semibold">{worker.full_name}</h3>
                {worker.is_aadhaar_verified && (
                  <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                )}
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {worker.primary_skill || "General Worker"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(worker.skills || []).slice(0, 3).map((s) => (
              <Badge key={s} variant="secondary" className="font-normal">
                {s}
              </Badge>
            ))}
            {(worker.skills?.length || 0) > 3 && (
              <Badge variant="outline" className="font-normal">
                +{(worker.skills?.length || 0) - 3}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">
                {worker.rating_avg.toFixed(1)}
              </span>
              <span>({worker.total_reviews})</span>
            </span>
            {worker.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {worker.city}
              </span>
            )}
            <span>{worker.experience_years}y exp</span>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 border-t pt-4">
            <div className="text-sm">
              <span className="font-semibold">{formatCurrency(worker.daily_rate || 0)}</span>
              <span className="text-muted-foreground"> / day</span>
            </div>
            <Button asChild size="sm">
              <Link href={`/workers/${worker.user_id}`}>View Profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
