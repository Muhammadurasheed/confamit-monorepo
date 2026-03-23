import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/constants";
import { ShieldAlert, FileSearch, RefreshCw, Activity, ExternalLink, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LiveEvent {
  consensus_timestamp: string;
  sequence_number: number;
  running_hash: string;
  data: any;
}

export const HederaLiveFeed = () => {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/hedera/feed`);
      const result = await res.json();
      if (result.success && result.data) {
        setEvents(result.data);
      }
    } catch (e) {
      console.error("Failed to fetch live feed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const getEventIcon = (type: string) => {
    if (type === 'fraud_report') return <ShieldAlert className="h-5 w-5 text-destructive" />;
    if (type === 'receipt') return <FileSearch className="h-5 w-5 text-blue-500" />;
    if (type === 'trust_update') return <Activity className="h-5 w-5 text-amber-500" />;
    return <ShieldCheck className="h-5 w-5 text-green-500" />;
  };

  const formatTimestamp = (consensusTs: string) => {
    const seconds = parseInt(consensusTs.split('.')[0]);
    return new Date(seconds * 1000).toLocaleString();
  };

  const getExplorerLink = (ts: string) => {
    return `https://hashscan.io/testnet/topic/message/${ts}`;
  };

  return (
    <Card className="shadow-lg border-primary/10 flex flex-col h-full bg-gradient-to-br from-card to-card/50">
      <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            Live Network Feed
          </CardTitle>
          <CardDescription>Real-time HCS trust events</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchFeed} disabled={loading} className="shrink-0">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-auto max-h-[400px]">
        {events.length === 0 && !loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No recent events found on the network.
          </div>
        ) : (
          <div className="divide-y relative">
            {events.map((event, i) => (
              <div key={event.consensus_timestamp} className="p-4 hover:bg-accent/50 transition-colors flex items-start gap-4">
                <div className="mt-1 p-2 bg-background rounded-full border shadow-sm shrink-0">
                  {getEventIcon(event.data?.type || event.data?.entity_type)}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium leading-none capitalize truncate">
                      {event.data?.type?.replace('_', ' ') || event.data?.entity_type?.replace('_', ' ') || 'Network Event'}
                    </p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(event.consensus_timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate font-mono bg-muted/50 px-1.5 py-0.5 rounded inline-block w-full">
                    Hash: {event.running_hash.substring(0, 16)}...
                  </p>
                  <div className="pt-1 flex justify-between items-center">
                    <span className="text-[10px] font-semibold tracking-wider text-primary/70 uppercase">
                      SEQ #{event.sequence_number}
                    </span>
                    <a 
                      href={getExplorerLink(event.consensus_timestamp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] flex items-center gap-1 text-primary hover:underline"
                    >
                      Verify <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
