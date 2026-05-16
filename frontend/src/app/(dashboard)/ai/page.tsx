"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  useCategorizeJob,
  useRecommendWorkers,
  useSuggestWage,
} from "@/lib/hooks/use-ai";

export default function AiPage() {
  const recommend = useRecommendWorkers();
  const categorize = useCategorizeJob();
  const wage = useSuggestWage();

  const [recDesc, setRecDesc] = useState("");
  const [recCity, setRecCity] = useState("");
  const [recSkill, setRecSkill] = useState("");

  const [catDesc, setCatDesc] = useState("");

  const [wageSkill, setWageSkill] = useState("");
  const [wageCity, setWageCity] = useState("");
  const [wageExp, setWageExp] = useState(2);

  return (
    <div className="space-y-6">
      <PageHeader title="AI Tools" description="Smart features powered by OpenAI" />

      <Tabs defaultValue="recommend">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="recommend">Recommend workers</TabsTrigger>
          <TabsTrigger value="categorize">Categorize job</TabsTrigger>
          <TabsTrigger value="wage">Suggest wage</TabsTrigger>
        </TabsList>

        <TabsContent value="recommend" className="mt-4 space-y-4">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label>Describe what you need</Label>
                <Textarea
                  rows={3}
                  placeholder="Need an experienced plumber for bathroom renovation, 2 days"
                  value={recDesc}
                  onChange={(e) => setRecDesc(e.target.value)}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>City (optional)</Label>
                  <Input
                    placeholder="Phaltan"
                    value={recCity}
                    onChange={(e) => setRecCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Skill filter (optional)</Label>
                  <Input
                    placeholder="plumbing"
                    value={recSkill}
                    onChange={(e) => setRecSkill(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={() =>
                  recommend.mutate({
                    job_description: recDesc,
                    city: recCity || undefined,
                    skill: recSkill || undefined,
                    limit: 5,
                  })
                }
                disabled={!recDesc || recommend.isPending}
              >
                {recommend.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Get AI recommendations
              </Button>
            </CardContent>
          </Card>

          {recommend.data && (
            <div className="space-y-3">
              {recommend.data.workers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No matching workers found. Try a broader search.
                </p>
              ) : (
                recommend.data.workers.map((w) => (
                  <Card key={w.worker_id}>
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div>
                        <p className="font-semibold">{w.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {w.primary_skill || "Worker"} · {w.city || "—"}
                        </p>
                        <p className="mt-1 text-xs">{w.match_reason}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Match score</p>
                          <p className="text-lg font-bold text-primary">
                            {Math.round(w.match_score)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Rating
                          </p>
                          <p className="font-semibold">{w.rating_avg.toFixed(1)}</p>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/workers/${w.worker_id}`}>View</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categorize" className="mt-4 space-y-4">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label>Job description</Label>
                <Textarea
                  rows={4}
                  placeholder="Describe your job in your own words..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                />
              </div>
              <Button
                onClick={() => categorize.mutate(catDesc)}
                disabled={!catDesc || catDesc.length < 5 || categorize.isPending}
              >
                {categorize.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Categorize
              </Button>
              {categorize.data && (
                <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
                  <p>
                    <span className="text-muted-foreground">Category:</span>{" "}
                    <span className="font-semibold">{categorize.data.category}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Suggested title:</span>{" "}
                    <span className="font-semibold">{categorize.data.suggested_title}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Skills:</span>{" "}
                    <span className="font-semibold">
                      {categorize.data.suggested_skills.join(", ")}
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wage" className="mt-4 space-y-4">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Skill</Label>
                  <Input
                    placeholder="Plumbing"
                    value={wageSkill}
                    onChange={(e) => setWageSkill(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    placeholder="Phaltan"
                    value={wageCity}
                    onChange={(e) => setWageCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Experience (years)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={wageExp}
                    onChange={(e) => setWageExp(parseInt(e.target.value, 10) || 0)}
                  />
                </div>
              </div>
              <Button
                onClick={() =>
                  wage.mutate({ skill: wageSkill, city: wageCity, experience_years: wageExp })
                }
                disabled={!wageSkill || !wageCity || wage.isPending}
              >
                {wage.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Suggest wage
              </Button>
              {wage.data && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Suggested daily wage</p>
                  <p className="text-3xl font-bold text-primary">
                    ₹{wage.data.suggested_daily_wage}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Range: ₹{wage.data.min_wage}-{wage.data.max_wage}
                  </p>
                  <p className="mt-2 text-sm">{wage.data.reasoning}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
