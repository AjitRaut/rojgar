"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/PageHeader";
import { AvatarUpload } from "@/components/shared/AvatarUpload";
import { useMe } from "@/lib/hooks/use-auth";
import { ROLE_LABELS, QUERY_KEYS } from "@/lib/constants";
import { usersApi, type UserUpdatePayload } from "@/lib/api/users";
import { extractErrorMessage } from "@/lib/api/client";
import { useAppDispatch } from "@/lib/stores/hooks";
import { setUser } from "@/lib/stores/auth-slice";

export default function ProfilePage() {
  const { data: user } = useMe();
  const dispatch = useAppDispatch();
  const qc = useQueryClient();

  const update = useMutation({
    mutationFn: (payload: UserUpdatePayload) => usersApi.updateMe(payload),
    onSuccess: (data) => {
      dispatch(setUser(data));
      qc.setQueryData(QUERY_KEYS.me, data);
      toast.success("Profile updated");
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  const { register, handleSubmit, reset } = useForm<UserUpdatePayload>();

  useEffect(() => {
    if (user) reset({ full_name: user.full_name, phone: user.phone || "" });
  }, [user, reset]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Account" description="Manage your basic info" />

      <Card>
        <CardContent className="space-y-6 p-6">
          <AvatarUpload user={user} />
          <div>
            <p className="text-lg font-semibold">{user.full_name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
              {user.is_verified && (
                <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400">
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit((d) => update.mutate(d))}>
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" {...register("full_name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}