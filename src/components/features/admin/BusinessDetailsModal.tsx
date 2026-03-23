import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  CreditCard,
  ExternalLink,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BusinessDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: any;
}

export const BusinessDetailsModal = ({
  open,
  onOpenChange,
  business,
}: BusinessDetailsModalProps) => {
  if (!business) return null;

  const getTierBadge = (tier: number) => {
    const tiers = {
      1: { label: "Basic", variant: "secondary" as const },
      2: { label: "Verified", variant: "default" as const },
      3: { label: "Premium", variant: "default" as const },
    };
    return tiers[tier] || tiers[1];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {business.logo && (
                <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-primary/20">
                  <img src={business.logo} alt={business.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <DialogTitle className="text-2xl">{business.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4" />
                  {business.category}
                </DialogDescription>
              </div>
            </div>
            <Badge variant={getTierBadge(business.verification.tier).variant}>
              {getTierBadge(business.verification.tier).label}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Business Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="banking">Banking Info</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{business.contact?.email || 'N/A'}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{business.contact?.phone || 'N/A'}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{business.contact?.address || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Business ID:</span>
                  <span className="font-mono">{business.business_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tier:</span>
                  <Badge variant="outline">{getTierBadge(business.verification.tier).label}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge>{business.verification.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Applied:</span>
                  <span>{business.created_at?._seconds ? new Date(business.created_at._seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            {business.verification?.documents && Object.keys(business.verification.documents).length > 0 ? (
              <div className="grid gap-4">
                {Object.entries(business.verification.documents).map(([key, url]: [string, any]) => (
                  <Card key={key}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="text-sm text-muted-foreground">
                              {typeof url === 'string' ? 'Uploaded' : 'Not available'}
                            </p>
                          </div>
                        </div>
                        {typeof url === 'string' && url && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <a href={url} download>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No documents uploaded yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Banking Tab */}
          <TabsContent value="banking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Bank Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {business.bank_account ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Account Name</p>
                      <p className="text-sm font-semibold">{business.bank_account.account_name || 'N/A'}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bank Code</p>
                      <p className="text-sm">{business.bank_account.bank_code || 'N/A'}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Verification Status</p>
                      <Badge variant={business.bank_account.verified ? 'default' : 'secondary'}>
                        {business.bank_account.verified ? 'Verified' : 'Not Verified'}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No bank account information available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};