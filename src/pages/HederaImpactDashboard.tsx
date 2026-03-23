import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/constants";
import { ShieldCheck, Activity, Link as LinkIcon, ExternalLink, RefreshCw, BarChart3, Fingerprint, Files } from "lucide-react";
import { HederaLiveFeed } from "@/components/HederaLiveFeed";
import GlobalHeader from "@/components/layout/Header";
import GlobalFooter from "@/components/layout/Footer";

interface HederaStats {
  total_hcs_messages: number;
  total_nfts_minted: number;
  total_hfs_files: number;
  total_scheduled_txns: number;
  total_hedera_transactions: number;
  anchors_by_type: Record<string, number>;
  network: string;
  is_live_data: boolean;
  mirror_node_url: string;
}

const HederaImpactDashboard = () => {
  const [stats, setStats] = useState<HederaStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/hedera/stats`);
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch Hedera stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <GlobalHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 mb-20 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
                Hedera Network Impact
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Live, bidirectional Mirror Node integration proving ConfirmIT's real-world utilization of the Hedera network.
              </p>
            </div>
            
            <Button 
              onClick={fetchStats} 
              disabled={loading}
              className="shadow-md shadow-primary/20 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 border"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh Network Data
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Transactions" 
              value={stats?.total_hedera_transactions || 0} 
              icon={<Activity className="h-6 w-6 text-blue-500" />}
              loading={loading}
              description="Total network txns"
            />
            <StatCard 
              title="HCS Anchors" 
              value={stats?.total_hcs_messages || 0} 
              icon={<ShieldCheck className="h-6 w-6 text-green-500" />}
              loading={loading}
              description="Consensus messages"
            />
            <StatCard 
              title="Trust ID NFTs" 
              value={stats?.total_nfts_minted || 0} 
              icon={<Fingerprint className="h-6 w-6 text-purple-500" />}
              loading={loading}
              description="HIP-412 Tokens"
            />
            <StatCard 
              title="HFS Proofs" 
              value={stats?.total_hfs_files || 0} 
              icon={<Files className="h-6 w-6 text-amber-500" />}
              loading={loading}
              description="File Service Records"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-lg border-primary/10 bg-gradient-to-br from-card to-card/50 overflow-hidden">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-primary" />
                  Live Mirror Node Connection
                </CardTitle>
                <CardDescription>
                  Direct sync with Hedera {stats?.network || 'testnet'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                      <div>
                        <h4 className="font-semibold text-green-600 dark:text-green-400">Bidirectional Verification Active</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Data is written to HCS and verified mathematically against public Mirror Node APIs.
                        </p>
                      </div>
                    </div>
                    {stats?.mirror_node_url && (
                      <Button variant="outline" size="sm" asChild className="shrink-0 hidden sm:flex">
                        <a href={stats.mirror_node_url} target="_blank" rel="noopener noreferrer">
                          Mirror Node <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary/60" />
                      Anchor Distribution
                    </h3>
                    
                    {loading ? (
                      <div className="h-40 flex items-center justify-center">
                        <RefreshCw className="h-8 w-8 text-primary/40 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {stats?.anchors_by_type && Object.entries(stats.anchors_by_type).map(([type, count]) => {
                          const total = stats.total_hcs_messages || 1;
                          const percentage = Math.round((count / total) * 100);
                          return (
                            <div key={type} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium capitalize">{type.replace('_', ' ')} Records</span>
                                <span className="text-muted-foreground">{count} ({percentage}%)</span>
                              </div>
                              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                        
                        {(!stats?.anchors_by_type || Object.keys(stats.anchors_by_type).length === 0) && (
                          <div className="text-center p-8 text-muted-foreground bg-accent/30 rounded-lg border border-dashed">
                            No Hedera anchors found yet. Scan a receipt to generate network activity.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="h-full">
              <HederaLiveFeed />
            </div>
          </div>
        </div>
      </main>
      <GlobalFooter />
    </div>
  );
};

const StatCard = ({ title, value, icon, description, loading }: any) => (
  <Card className="shadow-sm border-primary/5 hover:border-primary/20 transition-all hover:shadow-md group">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
            ) : (
              <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 group-hover:text-primary transition-colors">
            {description}
          </p>
        </div>
        <div className="p-3 bg-secondary rounded-xl group-hover:bg-primary/10 transition-colors">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default HederaImpactDashboard;
