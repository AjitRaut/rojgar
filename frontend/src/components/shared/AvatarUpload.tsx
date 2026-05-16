"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { uploadsApi } from "@/lib/api/uploads";
import { usersApi } from "@/lib/api/users";
import { extractErrorMessage } from "@/lib/api/client";
import { QUERY_KEYS, API_URL } from "@/lib/constants";
import { useAppDispatch } from "@/lib/stores/hooks";
import { setUser } from "@/lib/stores/auth-slice";
import { getInitials } from "@/lib/utils";
import type { User } from "@/types/api";

const MAX_SIZE_MB = 5;
const ACCEPT = "image/png,image/jpeg,image/jpg,image/webp";

export function AvatarUpload({ user }: { user: User }) {
  const dispatch = useAppDispatch();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const fullUrl = user.profile_image
    ? user.profile_image.startsWith("http")
      ? user.profile_image
      : `${API_URL}${user.profile_image}`
    : undefined;

  const save = useMutation({
    mutationFn: (profile_image: string | null) =>
      usersApi.updateMe({ profile_image: profile_image ?? undefined }),
    onSuccess: (data) => {
      dispatch(setUser(data));
      qc.setQueryData(QUERY_KEYS.me, data);
      toast.success(data.profile_image ? "Profile picture updated" : "Profile picture removed");
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  const handleFile = async (file: File) => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_SIZE_MB} MB`);
      return;
    }
    setUploading(true);
    try {
      const res = await uploadsApi.image(file);
      await save.mutateAsync(res.url);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="h-20 w-20 ring-4 ring-background">
          {fullUrl && <AvatarImage src={fullUrl} alt={user.full_name} />}
          <AvatarFallback className="bg-primary/15 text-primary text-xl font-bold">
            {getInitials(user.full_name)}
          </AvatarFallback>
        </Avatar>
        {(uploading || save.isPending) && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70 backdrop-blur-sm">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || save.isPending}
          >
            <Camera className="h-3.5 w-3.5" />
            {user.profile_image ? "Change photo" : "Upload photo"}
          </Button>
          {user.profile_image && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => save.mutate(null)}
              disabled={save.isPending}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP. Max {MAX_SIZE_MB} MB.</p>
      </div>
    </div>
  );
}