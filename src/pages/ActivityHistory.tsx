import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, limit, deleteDoc, doc } from "firebase/firestore";
import { FileText, Calendar, AlertCircle, CheckCircle2, AlertTriangle, Trash2, ShieldCheck, Eye } from "lucide-react";
import TrustScoreGauge from "@/components/shared/TrustScoreGauge";
import { format } from "date-fns";
import { ViewAccountResultModal } from "@/components/features/account-check/ViewAccountResultModal";
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

interface ReceiptHistory {
  id: string;
  type: 'receipt_scan';
  receipt_id: string;
  user_id: string;
  storage_path: string;
  trust_score: number;
  verdict: "authentic" | "suspicious" | "fraudulent" | "unclear";
  created_at: any;
  merchant_name?: string;
}

interface AccountCheckHistory {
  id: string;
  type: 'account_check';
  account_id: string;
  account_number_masked: string;
  trust_score: number;
  risk_level: 'low' | 'medium' | 'high';
  verdict: 'safe' | 'caution' | 'high_risk';
  fraud_reports_count: number;
  is_verified_business: boolean;
  business_name?: string | null;
  user_id: string;
  created_at: any;
}

type ActivityItem = ReceiptHistory | AccountCheckHistory;

const ActivityHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "receipts" | "accounts" | "authentic" | "suspicious" | "fraudulent">("all");
  const [selectedAccountCheck, setSelectedAccountCheck] = useState<AccountCheckHistory | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<ActivityItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // For authenticated users, fetch from Firestore
        if (user) {
          // Fetch both receipts and account checks in parallel
          const receiptsRef = collection(db, "receipts");
          const accountChecksRef = collection(db, "account_checks");
          
          const receiptsQuery = query(
            receiptsRef,
            where("user_id", "==", user.uid),
            orderBy("created_at", "desc"),
            limit(50)
          );

          const accountChecksQuery = query(
            accountChecksRef,
            where("user_id", "==", user.uid),
            orderBy("created_at", "desc"),
            limit(50)
          );

          const [receiptsSnapshot, accountChecksSnapshot] = await Promise.all([
            getDocs(receiptsQuery),
            getDocs(accountChecksQuery),
          ]);

          const fetchedReceipts: ActivityItem[] = receiptsSnapshot.docs.map((doc) => ({
            id: doc.id,
            type: 'receipt_scan' as const,
            ...doc.data(),
          })) as ReceiptHistory[];

          const fetchedAccountChecks: ActivityItem[] = accountChecksSnapshot.docs.map((doc) => ({
            id: doc.id,
            type: 'account_check' as const,
            ...doc.data(),
          })) as AccountCheckHistory[];

          // Combine and sort by created_at descending
          const allActivity = [...fetchedReceipts, ...fetchedAccountChecks].sort((a, b) => {
            const dateA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at);
            const dateB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at);
            return dateB.getTime() - dateA.getTime();
          });

          setReceipts(allActivity);
        } else {
          // For anonymous users, fetch from localStorage
          const localHistory = localStorage.getItem("receipt_history");
          if (localHistory) {
            const parsed = JSON.parse(localHistory);
            const withType = parsed.map((item: any) => ({
              ...item,
              type: 'receipt_scan' as const,
            }));
            setReceipts(withType);
          }
        }
      } catch (error: any) {
        console.error("Error fetching activity history:", error);
        toast.error("Failed to load activity history", {
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const handleDeleteActivity = async (activity: ActivityItem) => {
    if (!db || !user) return;
    
    setIsDeleting(true);
    try {
      // Delete from the appropriate collection based on type
      const collectionName = activity.type === 'receipt_scan' ? 'receipts' : 'account_checks';
      await deleteDoc(doc(db, collectionName, activity.id));
      
      // Remove from local state
      setReceipts(prev => prev.filter(a => a.id !== activity.id));
      
      toast.success('Activity deleted successfully');
      setActivityToDelete(null);
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete activity');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAllHistory = async () => {
    if (!db || !user) return;
    
    setIsDeleting(true);
    try {
      // Delete all activities for current user
      const deletePromises = receipts.map(activity => {
        const collectionName = activity.type === 'receipt_scan' ? 'receipts' : 'account_checks';
        return deleteDoc(doc(db, collectionName, activity.id));
      });
      
      await Promise.all(deletePromises);
      
      setReceipts([]);
      toast.success('All history cleared successfully');
      setShowClearAllDialog(false);
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('Failed to clear history');
    } finally {
      setIsDeleting(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "authentic":
        return "bg-success text-success-foreground";
      case "suspicious":
        return "bg-warning text-warning-foreground";
      case "fraudulent":
        return "bg-danger text-danger-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "authentic":
        return <CheckCircle2 className="h-4 w-4" />;
      case "suspicious":
        return <AlertTriangle className="h-4 w-4" />;
      case "fraudulent":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredReceipts = receipts.filter((item) => {
    if (filter === "all") return true;
    if (filter === "receipts") return item.type === 'receipt_scan';
    if (filter === "accounts") return item.type === 'account_check';
    
    // For receipts, filter by verdict
    if (item.type === 'receipt_scan') {
      return item.verdict === filter;
    }
    // For account checks, filter by risk level
    if (item.type === 'account_check') {
      if (filter === 'authentic') return item.verdict === 'safe';
      if (filter === 'suspicious') return item.verdict === 'caution';
      if (filter === 'fraudulent') return item.verdict === 'high_risk';
    }
    return false;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <FileText className="h-12 w-12 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">No Activity History</CardTitle>
              <CardDescription className="text-base mt-2">
                You haven't scanned any receipts or checked any accounts yet. Start using ConfirmIT to build your activity history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="/quick-scan">Scan Your First Receipt</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-subtle">
      <Header />
      <main className="flex-1 py-12">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex justify-between items-start"
          >
            <div>
              <h1 className="text-4xl font-bold mb-2">Activity History</h1>
              <p className="text-muted-foreground">
                View all your scanned receipts and checked accounts ({receipts.length} total)
              </p>
            </div>
            
            {receipts.length > 0 && user && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowClearAllDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All History
              </Button>
            )}
          </motion.div>

          <Tabs defaultValue="all" value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="mb-6 flex-wrap h-auto">
              <TabsTrigger value="all">All ({receipts.length})</TabsTrigger>
              <TabsTrigger value="receipts">
                Receipts ({receipts.filter(r => r.type === 'receipt_scan').length})
              </TabsTrigger>
              <TabsTrigger value="accounts">
                Account Checks ({receipts.filter(r => r.type === 'account_check').length})
              </TabsTrigger>
              <TabsTrigger value="authentic">
                Safe ({receipts.filter(r => 
                  (r.type === 'receipt_scan' && r.verdict === "authentic") ||
                  (r.type === 'account_check' && r.verdict === 'safe')
                ).length})
              </TabsTrigger>
              <TabsTrigger value="suspicious">
                Caution ({receipts.filter(r => 
                  (r.type === 'receipt_scan' && r.verdict === "suspicious") ||
                  (r.type === 'account_check' && r.verdict === 'caution')
                ).length})
              </TabsTrigger>
              <TabsTrigger value="fraudulent">
                High Risk ({receipts.filter(r => 
                  (r.type === 'receipt_scan' && r.verdict === "fraudulent") ||
                  (r.type === 'account_check' && r.verdict === 'high_risk')
                ).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter}>
              <div className="grid gap-6">
                {filteredReceipts.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {item.type === 'receipt_scan' ? (
                      <Card 
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => navigate(`/quick-scan?receipt=${item.receipt_id}`)}
                      >
                        <CardContent className="p-0">
                          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
                            {/* Receipt Preview */}
                            <div className="relative h-48 md:h-auto bg-muted flex items-center justify-center">
                              {item.storage_path ? (
                                <img
                                  src={item.storage_path}
                                  alt="Receipt"
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="text-muted-foreground flex flex-col items-center gap-2 p-4">
                                  <FileText className="h-12 w-12" />
                                  <span className="text-sm">No preview available</span>
                                </div>
                              )}
                            </div>

                            {/* Receipt Details */}
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <TrustScoreGauge score={item.trust_score} size="sm" />
                                    <Badge
                                      className={`flex items-center gap-1 ${
                                        item.verdict === 'authentic' ? 'bg-success text-success-foreground' :
                                        item.verdict === 'suspicious' ? 'bg-warning text-warning-foreground' :
                                        'bg-destructive text-destructive-foreground'
                                      }`}
                                    >
                                      {getVerdictIcon(item.verdict)}
                                      {item.verdict.charAt(0).toUpperCase() + item.verdict.slice(1)}
                                    </Badge>
                                  </div>
                                  {item.merchant_name && (
                                    <p className="text-sm font-medium mb-1">{item.merchant_name}</p>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3 inline mr-1" />
                                    {item.created_at?.toDate ? 
                                      format(item.created_at.toDate(), "PPp") :
                                      format(new Date(item.created_at), "PPp")
                                    }
                                   </p>
                                 </div>
                                 <div className="flex gap-2">
                                   <Button 
                                     variant="ghost" 
                                     size="sm"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       navigate(`/quick-scan?receipt=${item.receipt_id}`);
                                     }}
                                   >
                                     <Eye className="h-4 w-4 mr-2" />
                                     View Report
                                   </Button>
                                   {user && (
                                     <Button
                                       variant="ghost"
                                       size="sm"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         setActivityToDelete(item);
                                       }}
                                       disabled={isDeleting}
                                     >
                                       <Trash2 className="h-4 w-4 text-destructive" />
                                     </Button>
                                   )}
                                 </div>
                               </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card 
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedAccountCheck(item as AccountCheckHistory)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <ShieldCheck className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">Account Check</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {item.account_number_masked}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 mb-3">
                                <TrustScoreGauge score={item.trust_score} size="sm" />
                                <Badge
                                  className={`flex items-center gap-1 ${
                                    item.risk_level === 'low' ? 'bg-success text-success-foreground' :
                                    item.risk_level === 'medium' ? 'bg-warning text-warning-foreground' :
                                    'bg-destructive text-destructive-foreground'
                                  }`}
                                >
                                  {item.risk_level === 'low' ? <ShieldCheck className="h-3 w-3" /> :
                                   item.risk_level === 'medium' ? <AlertTriangle className="h-3 w-3" /> :
                                   <AlertTriangle className="h-3 w-3" />}
                                  {item.risk_level === 'low' ? 'Safe' :
                                   item.risk_level === 'medium' ? 'Caution' :
                                   'High Risk'}
                                </Badge>
                              </div>

                              {item.is_verified_business && item.business_name && (
                                <p className="text-sm mb-2">
                                  <span className="text-muted-foreground">Verified Business:</span>{' '}
                                  <span className="font-medium">{item.business_name}</span>
                                </p>
                              )}

                              {item.fraud_reports_count > 0 && (
                                <p className="text-sm text-destructive mb-2">
                                  ⚠️ {item.fraud_reports_count} fraud report{item.fraud_reports_count > 1 ? 's' : ''}
                                </p>
                              )}

                              <p className="text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {item.created_at?.toDate ? 
                                  format(item.created_at.toDate(), "PPp") :
                                  format(new Date(item.created_at), "PPp")
                                }
                              </p>
                             </div>
                             
                             <div className="flex gap-2">
                               <Button 
                                 variant="ghost" 
                                 size="sm"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   setSelectedAccountCheck(item as AccountCheckHistory);
                                 }}
                               >
                                 <Eye className="h-4 w-4 mr-2" />
                                 View Result
                               </Button>
                               {user && (
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setActivityToDelete(item);
                                   }}
                                   disabled={isDeleting}
                                 >
                                   <Trash2 className="h-4 w-4 text-destructive" />
                                 </Button>
                               )}
                             </div>
                           </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Container>
      </main>
      <Footer />

      {/* Account Check Result Modal */}
      {selectedAccountCheck && (
        <ViewAccountResultModal
          open={!!selectedAccountCheck}
          onOpenChange={(open) => !open && setSelectedAccountCheck(null)}
          data={selectedAccountCheck}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!activityToDelete} onOpenChange={() => setActivityToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {activityToDelete?.type === 'receipt_scan' ? 'receipt scan' : 'account check'}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => activityToDelete && handleDeleteActivity(activityToDelete)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All History</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all {receipts.length} activities? 
              This will permanently remove all receipt scans and account checks from your history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAllHistory}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Clearing...' : 'Clear All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ActivityHistory;
