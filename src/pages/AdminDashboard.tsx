import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle, Eye, Building2, Clock, Ban, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/constants";
import { BusinessDetailsModal } from "@/components/features/admin/BusinessDetailsModal";
import { suspendBusiness, deleteBusiness } from "@/services/business";

interface Business {
  business_id: string;
  name: string;
  logo?: string;
  category: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  verification: {
    tier: number;
    status: string;
    documents: any;
  };
  trust_score?: number;
  created_at: any;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [suspensionReason, setSuspensionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (!authLoading && user?.email !== "yekinirasheed2002@gmail.com") {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    if (user) {
      fetchBusinesses();
    }
  }, [user, authLoading, navigate]);

  // Refetch when tab changes
  useEffect(() => {
    if (user) {
      fetchBusinesses();
    }
  }, [activeTab]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const token = await user?.getIdToken();

      const endpoint =
        activeTab === "pending"
          ? `${API_ENDPOINTS.ADMIN_BUSINESSES}/pending`
          : `${API_ENDPOINTS.ADMIN_BUSINESSES}/all`;

      console.log('🔍 Fetching businesses from:', endpoint);

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error("Failed to fetch businesses");
      }

      const data = await response.json();
      console.log('📦 Received data:', data);
      console.log('👥 Businesses count:', data.data?.length || 0);
      
      setBusinesses(data.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load businesses");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedBusiness) return;

    setProcessing(true);
    try {
      const token = await user?.getIdToken();

      const response = await fetch(
        `${API_ENDPOINTS.ADMIN_BUSINESSES}/approve/${selectedBusiness.business_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            approvedBy: user?.email,
          }),
        }
      );

      if (!response.ok) throw new Error("Approval failed");

      const result = await response.json();
      
      // Handle both success cases: with or without NFT
      if (result.nft?.serial_number) {
        toast.success(`Business approved! Trust ID NFT #${result.nft.serial_number} minted.`);
      } else {
        toast.success('Business approved successfully!');
        if (result.warning) {
          toast.warning(result.warning);
        }
      }
      
      setShowApproveDialog(false);
      setSelectedBusiness(null);
      fetchBusinesses();
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Failed to approve business");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBusiness || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setProcessing(true);
    try {
      const token = await user?.getIdToken();

      const response = await fetch(
        `${API_ENDPOINTS.ADMIN_BUSINESSES}/reject/${selectedBusiness.business_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reason: rejectionReason,
            rejectedBy: user?.email,
          }),
        }
      );

      if (!response.ok) throw new Error("Rejection failed");

      toast.success("Business verification rejected");
      setShowRejectDialog(false);
      setSelectedBusiness(null);
      setRejectionReason("");
      fetchBusinesses();
    } catch (error) {
      console.error("Rejection error:", error);
      toast.error("Failed to reject business");
    } finally {
      setProcessing(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedBusiness || !suspensionReason.trim()) {
      toast.error("Please provide a suspension reason");
      return;
    }

    setProcessing(true);
    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error("No auth token");

      await suspendBusiness(selectedBusiness.business_id, suspensionReason, token);

      toast.success("Business suspended successfully");
      setShowSuspendDialog(false);
      setSelectedBusiness(null);
      setSuspensionReason("");
      fetchBusinesses();
    } catch (error) {
      console.error("Suspension error:", error);
      toast.error("Failed to suspend business");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBusiness) return;

    setProcessing(true);
    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error("No auth token");

      await deleteBusiness(selectedBusiness.business_id, token);

      toast.success("Business permanently deleted");
      setShowDeleteDialog(false);
      setSelectedBusiness(null);
      fetchBusinesses();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete business");
    } finally {
      setProcessing(false);
    }
  };

  const getTierBadge = (tier: number) => {
    const tiers = {
      1: { label: "Basic", variant: "secondary" as const },
      2: { label: "Verified", variant: "default" as const },
      3: { label: "Premium", variant: "default" as const },
    };
    return tiers[tier] || tiers[1];
  };

  const getStatusBadge = (status: string) => {
    const statuses = {
      pending: { label: "Pending", variant: "secondary" as const },
      under_review: { label: "Under Review", variant: "default" as const },
      approved: { label: "Approved", variant: "default" as const },
      rejected: { label: "Rejected", variant: "destructive" as const },
    };
    return statuses[status] || statuses.pending;
  };

  if (authLoading || loading) {
    return (
      <Container className="py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-muted-foreground mt-4">Loading admin dashboard...</p>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Review and approve business verification applications
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            <Clock className="h-4 w-4 mr-2" />
            Pending Review
          </TabsTrigger>
          <TabsTrigger value="all">
            <Building2 className="h-4 w-4 mr-2" />
            All Businesses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {businesses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No pending applications</p>
              </CardContent>
            </Card>
          ) : (
            businesses.map((business) => (
              <Card key={business.business_id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={business.logo} />
                        <AvatarFallback>
                          {business.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">{business.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {business.category}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={getTierBadge(business.verification.tier).variant}>
                            {getTierBadge(business.verification.tier).label}
                          </Badge>
                          <Badge variant={getStatusBadge(business.verification.status).variant}>
                            {getStatusBadge(business.verification.status).label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {business.contact && (
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Contact</p>
                        <p className="text-sm text-muted-foreground">
                          {business.contact.email || 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {business.contact.phone || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Address</p>
                        <p className="text-sm text-muted-foreground">
                          {business.contact.address || 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedBusiness(business);
                        setShowDetailsModal(true);
                      }}
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedBusiness(business);
                        setShowApproveDialog(true);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedBusiness(business);
                        setShowRejectDialog(true);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {businesses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No businesses found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map((business) => (
                <Card key={business.business_id}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={business.logo} />
                        <AvatarFallback>
                          {business.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-base">{business.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {business.category}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Trust Score:</span>
                        <span className="font-semibold">
                          {business.trust_score || 0}/100
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getTierBadge(business.verification.tier).variant}>
                          {getTierBadge(business.verification.tier).label}
                        </Badge>
                        <Badge
                          variant={getStatusBadge(business.verification.status).variant}
                        >
                          {getStatusBadge(business.verification.status).label}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          variant="outline"
                          onClick={() => navigate(`/business/${business.business_id}`)}
                        >
                          View Profile
                        </Button>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          variant="outline"
                          onClick={() => {
                            setSelectedBusiness(business);
                            setShowSuspendDialog(true);
                          }}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Suspend
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          variant="destructive"
                          onClick={() => {
                            setSelectedBusiness(business);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Business Verification?</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve <strong>{selectedBusiness?.name}</strong> and mint a Trust
              ID NFT on Hedera Testnet. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve & Mint NFT"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Business Details Modal */}
      <BusinessDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        business={selectedBusiness}
      />

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Business Verification?</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting <strong>{selectedBusiness?.name}</strong>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Textarea
              placeholder="Enter rejection reason (required)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Application"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Dialog */}
      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend Business?</AlertDialogTitle>
            <AlertDialogDescription>
              This will suspend <strong>{selectedBusiness?.name}</strong> and remove their account from the directory. They can be reinstated later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Textarea
              placeholder="Enter suspension reason (required)"
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              disabled={processing || !suspensionReason.trim()}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suspending...
                </>
              ) : (
                "Suspend Business"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Business?</AlertDialogTitle>
            <AlertDialogDescription>
              This will <strong className="text-destructive">permanently delete</strong> <strong>{selectedBusiness?.name}</strong> and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={processing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Permanently Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
}
