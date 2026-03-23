import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Building2, Mail, Phone, Globe, User, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { Business } from "@/types";

const businessInfoSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(10, "Invalid phone number"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  supportEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  verificationAlerts: z.boolean(),
  marketplaceUpdates: z.boolean(),
  weeklyReports: z.boolean(),
  fraudAlerts: z.boolean(),
});

type BusinessInfoData = z.infer<typeof businessInfoSchema>;
type NotificationData = z.infer<typeof notificationSchema>;

interface BusinessSettingsFormProps {
  business: Business;
  onUpdate: () => void;
}

const BusinessSettingsForm = ({ business, onUpdate }: BusinessSettingsFormProps) => {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Business Info Form
  const businessForm = useForm<BusinessInfoData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      name: business.name || "",
      contactEmail: business.contact?.email || "",
      contactPhone: business.contact?.phone || "",
      website: business.marketplace?.profile?.contact?.website || business.website || "",
      supportEmail: business.contact?.email || "",
    }
  });

  // Notification Settings Form
  const notificationForm = useForm<NotificationData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      verificationAlerts: true,
      marketplaceUpdates: true,
      weeklyReports: false,
      fraudAlerts: true,
    }
  });

  const onSubmitBusinessInfo = async (data: BusinessInfoData) => {
    setSaving(true);
    try {
      // TODO: Implement API call to update business info
      console.log("Updating business info:", data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Business information updated successfully!");
      onUpdate();
    } catch (error: any) {
      toast.error("Failed to update business information", {
        description: error.message
      });
    } finally {
      setSaving(false);
    }
  };

  const onSubmitNotifications = async (data: NotificationData) => {
    setSaving(true);
    try {
      // TODO: Implement API call to update notification settings
      console.log("Updating notification settings:", data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Notification preferences updated!");
    } catch (error: any) {
      toast.error("Failed to update notification preferences", {
        description: error.message
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Settings</CardTitle>
        <CardDescription>
          Manage your business information, notifications, and account preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-4 mt-6">
            <form onSubmit={businessForm.handleSubmit(onSubmitBusinessInfo)} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Business Information</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Business Name *</Label>
                  <Input
                    id="name"
                    placeholder="Your Business Name"
                    {...businessForm.register("name")}
                  />
                  {businessForm.formState.errors.name && (
                    <p className="text-sm text-danger">{businessForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="contact@business.com"
                      {...businessForm.register("contactEmail")}
                    />
                    {businessForm.formState.errors.contactEmail && (
                      <p className="text-sm text-danger">{businessForm.formState.errors.contactEmail.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone *</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="+234 800 000 0000"
                      {...businessForm.register("contactPhone")}
                    />
                    {businessForm.formState.errors.contactPhone && (
                      <p className="text-sm text-danger">{businessForm.formState.errors.contactPhone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.yourbusiness.com"
                    {...businessForm.register("website")}
                  />
                  {businessForm.formState.errors.website && (
                    <p className="text-sm text-danger">{businessForm.formState.errors.website.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    placeholder="support@business.com"
                    {...businessForm.register("supportEmail")}
                  />
                  {businessForm.formState.errors.supportEmail && (
                    <p className="text-sm text-danger">{businessForm.formState.errors.supportEmail.message}</p>
                  )}
                </div>
              </div>

              <Separator />

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4 mt-6">
            <form onSubmit={notificationForm.handleSubmit(onSubmitNotifications)} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Email Notifications</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email updates about your account
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      {...notificationForm.register("emailNotifications")}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="verificationAlerts">Verification Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when customers verify with your business
                      </p>
                    </div>
                    <Switch
                      id="verificationAlerts"
                      {...notificationForm.register("verificationAlerts")}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketplaceUpdates">Marketplace Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications about profile views and customer interactions
                      </p>
                    </div>
                    <Switch
                      id="marketplaceUpdates"
                      {...notificationForm.register("marketplaceUpdates")}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="weeklyReports">Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive weekly summary of your business performance
                      </p>
                    </div>
                    <Switch
                      id="weeklyReports"
                      {...notificationForm.register("weeklyReports")}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="fraudAlerts">Fraud Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Important alerts about potential fraud activities
                      </p>
                    </div>
                    <Switch
                      id="fraudAlerts"
                      {...notificationForm.register("fraudAlerts")}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4 mt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Account Information</h3>
              </div>

              <div className="space-y-4 bg-muted/50 rounded-lg p-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Business ID</Label>
                  <p className="font-mono text-sm mt-1">{business.businessId}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm text-muted-foreground">Verification Status</Label>
                  <p className="text-sm font-medium capitalize mt-1">
                    {business.verification?.status}
                  </p>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm text-muted-foreground">Trust Score</Label>
                  <p className="text-sm font-medium mt-1">
                    {business.trustScore}/100
                  </p>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm text-muted-foreground">Account Created</Label>
                  <p className="text-sm mt-1">
                    {business.createdAt ? new Date(business.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-danger">Danger Zone</h4>
                <Button variant="destructive" className="w-full" disabled>
                  Deactivate Account
                </Button>
                <p className="text-xs text-muted-foreground">
                  Contact support to deactivate your business account. This action cannot be undone.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BusinessSettingsForm;
