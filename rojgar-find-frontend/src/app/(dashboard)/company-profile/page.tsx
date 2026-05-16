"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/PageHeader";
import { CenteredSpinner, ErrorState } from "@/components/shared/States";
import { useMyCompanyProfile, useUpdateMyCompanyProfile } from "@/lib/hooks/use-companies";
import { companyProfileSchema, type CompanyProfileInput } from "@/lib/validators/forms";

export default function CompanyProfilePage() {
  const profileQ = useMyCompanyProfile();
  const update = useUpdateMyCompanyProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyProfileInput>({
    resolver: zodResolver(companyProfileSchema),
  });

  useEffect(() => {
    if (profileQ.data) {
      reset({
        company_name: profileQ.data.company_name,
        company_type: profileQ.data.company_type || "",
        gst_number: profileQ.data.gst_number || "",
        registration_number: profileQ.data.registration_number || "",
        website: profileQ.data.website || "",
        description: profileQ.data.description || "",
        city: profileQ.data.city || "",
        state: profileQ.data.state || "",
        pincode: profileQ.data.pincode || "",
        address: profileQ.data.address || "",
      });
    }
  }, [profileQ.data, reset]);

  const onSubmit = (data: CompanyProfileInput) => {
    update.mutate({
      ...data,
      company_type: data.company_type || undefined,
      gst_number: data.gst_number || undefined,
      registration_number: data.registration_number || undefined,
      website: data.website || undefined,
      description: data.description || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      pincode: data.pincode || undefined,
      address: data.address || undefined,
    });
  };

  if (profileQ.isLoading) return <CenteredSpinner />;
  if (profileQ.isError) return <ErrorState />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Profile"
        description="Manage your business details and verification"
        action={
          profileQ.data?.is_gst_verified ? (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> GST Verified
            </Badge>
          ) : null
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h3 className="font-semibold">Business details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company name</Label>
                <Input id="company_name" {...register("company_name")} />
                {errors.company_name && (
                  <p className="text-xs text-destructive">{errors.company_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_type">Company type</Label>
                <Input
                  id="company_type"
                  placeholder="e.g. Construction, Interior, Event"
                  {...register("company_type")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gst_number">GST number</Label>
                <Input id="gst_number" placeholder="22AAAAA0000A1Z5" {...register("gst_number")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration_number">Registration number</Label>
                <Input id="registration_number" {...register("registration_number")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://" {...register("website")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={3} {...register("description")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <h3 className="font-semibold">Office location</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register("city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" {...register("state")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" {...register("pincode")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register("address")} />
              </div>
            </div>
          </CardContent>
        </Card>

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
      </form>
    </div>
  );
}
