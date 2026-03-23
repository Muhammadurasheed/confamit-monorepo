import { useState } from "react";
import { API_BASE_URL } from "@/lib/constants";
import { ShieldCheck, Search, ShieldAlert, Cpu, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CrossChainVerify() {
  const [txId, setTxId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txId) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // The API endpoint handles matching hash structure etc
      const response = await fetch(`${API_BASE_URL}/hedera/verify/${encodeURIComponent(txId)}`);
      const data = await response.json();
      
      if (!response.ok || !data.verified) {
        throw new Error(data.error || "Verification failed. Transaction not found or mismatch.");
      }
      
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[80vh]">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
          Trustless Cross-Chain Verification
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Don't trust ConfirmIT. Trust the math. Run a <b>QuickScan</b> or submit a <b>Fraud Report</b> to generate an immutable Hedera Transaction ID. Paste it below to independently cryptographically verify records directly against the Hedera Mirror Node.
        </p>
      </div>

      <Card className="shadow-xl border-primary/20 bg-card overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40"></div>
        <CardContent className="p-8">
          <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="e.g. 0.0.456743@1623423423.123456789"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                className="pl-10 h-14 text-lg font-mono"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !txId}
              className="h-14 px-8 text-md shadow-lg shadow-primary/20"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying</>
              ) : (
                <><Cpu className="mr-2 h-5 w-5" /> Verify on Chain</>
              )}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-border/50 flex gap-3 text-left items-start animate-in fade-in slide-in-from-bottom-2">
            <div className="p-2 bg-primary/10 rounded-full shrink-0 mt-0.5">
              <ShieldAlert className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Where do I find a Transaction ID?</p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Whenever a receipt is verified using <b>QuickScan</b>, or a <b>Fraud Report</b> is submitted, ConfirmIT anchors that data to the public Hedera blockchain. You will be provided with a unique Transaction ID (e.g., <code className="text-[11px] font-mono bg-background border px-1.5 py-0.5 rounded text-foreground">0.0.xyz@123.456</code>) on the confirmation screen. Copy that exact ID and paste it here!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mt-8 p-6 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4">
          <XCircle className="h-6 w-6 text-destructive shrink-0" />
          <div>
            <h3 className="font-semibold text-destructive">Verification Failed</h3>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
          <Card className="border-green-500/30 bg-green-500/5 shadow-lg">
            <CardHeader className="pb-3 border-b border-green-500/10">
              <CardTitle className="text-green-600 dark:text-green-400 flex items-center justify-between">
                <span>Cryptographic Match</span>
                <CheckCircle2 className="h-6 w-6" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-green-500/10 pb-2">
                <span className="text-muted-foreground">Status</span>
                <span className="font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded">AUTHENTICATED</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-green-500/10 pb-2">
                <span className="text-muted-foreground">Entity Type</span>
                <span className="font-medium capitalize">{result.local_data.entity_type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-green-500/10 pb-2">
                <span className="text-muted-foreground">Consensus Time</span>
                <span className="font-mono text-xs">{result.mirror_node_timestamp}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">HCS Topic ID</span>
                <span className="font-mono">{result.topic_id}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-lg">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex flex-col gap-1">
                <span>On-Chain Payload</span>
                <span className="text-xs text-muted-foreground font-normal">Decoded from Hedera Mirror Node</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 h-full bg-slate-950 rounded-b-xl overflow-x-auto">
              <pre className="text-xs text-green-400 font-mono">
                {JSON.stringify(result.on_chain_data, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <div className="md:col-span-2 text-center mt-4">
            <Button variant="outline" asChild>
              <a href={result.explorer_url} target="_blank" rel="noopener noreferrer">
                View Raw Transaction on HashScan <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
