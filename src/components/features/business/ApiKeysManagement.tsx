import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Key, Copy, Eye, EyeOff, Code, BookOpen, TestTube, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface ApiKey {
  keyId: string;
  environment: "live" | "test";
  createdAt: Date | string;
}

interface ApiKeysManagementProps {
  businessId: string;
  existingKeys?: ApiKey[];
  onGenerateKey: () => Promise<string>;
}

export const ApiKeysManagement = ({ businessId, existingKeys = [], onGenerateKey }: ApiKeysManagementProps) => {
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [activeTab, setActiveTab] = useState<"keys" | "docs" | "playground">("keys");

  const handleGenerateKey = async () => {
    setGenerating(true);
    try {
      const key = await onGenerateKey();
      setNewApiKey(key);
      setShowKey(true);
      toast.success("API Key Generated", {
        description: "Store it securely - it won't be shown again.",
      });
    } catch (error: any) {
      toast.error("Failed to generate API key", {
        description: error.message,
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const codeExamples = {
    javascript: `// 1. Install SDK
npm install @legit/sdk

// 2. Initialize client
import { LegitClient } from '@legit/sdk';

const legit = new LegitClient({
  apiKey: 'ck_live_...',
  environment: 'production'
});

// 3. Verify a receipt
const result = await legit.verifyReceipt({
  imageFile: receiptFile,
  anchorOnHedera: true
});

// 4. Check result
if (result.trustScore > 80) {
  console.log('Receipt is authentic!');
  // Process refund/warranty claim
} else {
  console.log('Receipt is suspicious');
  // Flag for manual review
}`,
    python: `# 1. Install SDK
pip install legit-sdk

# 2. Initialize client
from legit import LegitClient

legit = LegitClient(
    api_key='ck_live_...',
    environment='production'
)

# 3. Verify a receipt
with open('receipt.jpg', 'rb') as f:
    result = legit.verify_receipt(
        image_file=f,
        anchor_on_hedera=True
    )

# 4. Check result
if result.trust_score > 80:
    print('Receipt is authentic!')
else:
    print('Receipt is suspicious')`,
    curl: `# Verify receipt via API
curl -X POST https://api.legit.africa/api/receipts/scan \\
  -H "Authorization: Bearer ck_live_..." \\
  -F "file=@receipt.jpg" \\
  -F "anchorOnHedera=true"

# Check account trust
curl -X POST https://api.legit.africa/api/accounts/check \\
  -H "Authorization: Bearer ck_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "accountNumber": "0123456789",
    "bankCode": "044"
  }'`,
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            API Integration
          </CardTitle>
          <CardDescription>
            Integrate Legit verification into your business operations with our powerful API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="keys">
                <Key className="h-4 w-4 mr-2" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="docs">
                <BookOpen className="h-4 w-4 mr-2" />
                Documentation
              </TabsTrigger>
              <TabsTrigger value="playground">
                <TestTube className="h-4 w-4 mr-2" />
                Playground
              </TabsTrigger>
            </TabsList>

            {/* API Keys Tab */}
            <TabsContent value="keys" className="space-y-4">
              <AnimatePresence mode="wait">
                {newApiKey && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  >
                    <Alert className="border-warning bg-warning/5">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <AlertDescription className="space-y-3">
                        <p className="font-semibold text-warning">
                          ⚠️ Important: Store this API key securely
                        </p>
                        <p className="text-sm text-muted-foreground">
                          This key will only be shown once. If you lose it, you'll need to generate a new one.
                        </p>
                        <div className="flex items-center gap-2 bg-background p-3 rounded border">
                          <code className="flex-1 text-sm font-mono break-all">
                            {showKey ? newApiKey : "•".repeat(newApiKey.length)}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowKey(!showKey)}
                          >
                            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(newApiKey)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <Button
                  onClick={handleGenerateKey}
                  disabled={generating}
                  className="flex-1"
                  size="lg"
                >
                  <Key className="h-4 w-4 mr-2" />
                  {generating ? "Generating..." : "Generate Production API Key"}
                </Button>
              </div>

              {existingKeys.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Active API Keys</h3>
                    {existingKeys.map((key) => (
                      <motion.div
                        key={key.keyId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-mono">ck_{key.environment}_•••••••{key.keyId}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Created: {new Date(key.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={key.environment === "live" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {key.environment === "live" ? "production" : key.environment}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Documentation Tab */}
            <TabsContent value="docs" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">📚 Quick Start Guide</h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">1</span>
                      <div>
                        <p className="font-medium">Install the SDK</p>
                        <code className="text-xs bg-muted px-2 py-1 rounded mt-1 inline-block">
                          npm install @legit/sdk
                        </code>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">2</span>
                      <div>
                        <p className="font-medium">Initialize the client with your API key</p>
                        <code className="text-xs bg-muted px-2 py-1 rounded mt-1 inline-block">
                          const legit = new LegitClient(&#123; apiKey: 'ck_live_...' &#125;)
                        </code>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">3</span>
                      <div>
                        <p className="font-medium">Start verifying receipts and accounts</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          Use legit.verifyReceipt() or legit.checkAccount() methods
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">💻 Code Examples</h3>
                  <Tabs defaultValue="javascript" className="space-y-3">
                    <TabsList>
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                    </TabsList>
                    {Object.entries(codeExamples).map(([lang, code]) => (
                      <TabsContent key={lang} value={lang}>
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                            <code>{code}</code>
                          </pre>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">🔗 API Endpoints</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="font-mono">POST</Badge>
                      <div className="flex-1">
                        <code className="text-xs">/api/receipts/scan</code>
                        <p className="text-muted-foreground text-xs mt-1">Upload and analyze receipt</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="font-mono">POST</Badge>
                      <div className="flex-1">
                        <code className="text-xs">/api/accounts/check</code>
                        <p className="text-muted-foreground text-xs mt-1">Check account trust score</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="font-mono">GET</Badge>
                      <div className="flex-1">
                        <code className="text-xs">/api/business/:id</code>
                        <p className="text-muted-foreground text-xs mt-1">Get business profile</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Code className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-1">Full API Documentation</p>
                    <p className="text-xs text-muted-foreground">
                      Visit <a href="https://docs.legit.africa" className="underline text-primary">docs.legit.africa</a> for complete API reference, webhooks, rate limits, and more.
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            {/* Playground Tab */}
            <TabsContent value="playground" className="space-y-4">
              <Alert>
                <TestTube className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-1">Test Your Integration</p>
                  <p className="text-xs text-muted-foreground">
                    Use the QuickScan and AccountCheck pages to test API responses before integrating into your application.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-base">Test Receipt Verification</CardTitle>
                    <CardDescription className="text-xs">
                      Upload receipts to see real-time analysis results
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full">
                      <a href="/quick-scan">Go to QuickScan →</a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-base">Test Account Checking</CardTitle>
                    <CardDescription className="text-xs">
                      Verify Nigerian bank accounts in real-time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full">
                      <a href="/account-check">Go to AccountCheck →</a>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">📊 Expected Response Format</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                  <code>{`{
  "receiptId": "RCP-ABC123",
  "trustScore": 92,
  "verdict": "authentic",
  "recommendation": "Receipt appears legitimate. Safe to process.",
  "issues": [],
  "forensicDetails": {
    "ocrConfidence": 0.95,
    "manipulationScore": 0.1,
    "metadataFlags": []
  },
  "merchant": {
    "name": "ChiTech Solutions",
    "verified": true,
    "trustScore": 95
  },
  "hederaAnchor": {
    "transactionId": "0.0.123@1234567890.000",
    "explorerUrl": "https://hashscan.io/testnet/..."
  }
}`}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
