import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, RefreshCw, Check, X, Copy } from "lucide-react";
import { toast } from "sonner";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
  createdAt: Date;
}

interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  status: number;
  response: string;
  timestamp: Date;
  success: boolean;
}

const AVAILABLE_EVENTS = [
  { id: 'receipt.analyzed', label: 'Receipt Analyzed', description: 'Triggered when receipt verification completes' },
  { id: 'account.flagged', label: 'Account Flagged', description: 'Triggered when account marked as suspicious' },
  { id: 'business.approved', label: 'Business Approved', description: 'Triggered when business verification approved' },
];

export const WebhookManagement = ({ businessId }: { businessId: string }) => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteWebhookId, setDeleteWebhookId] = useState<string | null>(null);

  // Form state
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [generatedSecret, setGeneratedSecret] = useState('');

  useEffect(() => {
    fetchWebhooks();
    fetchLogs();
  }, [businessId]);

  const fetchWebhooks = async () => {
    try {
      const webhooksRef = collection(db, `businesses/${businessId}/webhooks`);
      const snapshot = await getDocs(webhooksRef);
      
      const webhooksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Webhook[];
      
      setWebhooks(webhooksData);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const logsRef = collection(db, `businesses/${businessId}/webhook_logs`);
      const q = query(logsRef, orderBy('timestamp', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as WebhookLog[];
      
      setLogs(logsData);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const generateSecret = () => {
    const secret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setGeneratedSecret(secret);
    return secret;
  };

  const handleAddWebhook = async () => {
    if (!webhookUrl || selectedEvents.length === 0) {
      toast.error('Please provide webhook URL and select at least one event');
      return;
    }

    // Validate URL
    try {
      new URL(webhookUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setLoading(true);
    try {
      const secret = generatedSecret || generateSecret();
      
      const webhooksRef = collection(db, `businesses/${businessId}/webhooks`);
      await addDoc(webhooksRef, {
        url: webhookUrl,
        events: selectedEvents,
        secret,
        enabled: true,
        createdAt: new Date(),
      });

      toast.success('Webhook added successfully');
      
      // Reset form
      setWebhookUrl('');
      setSelectedEvents([]);
      setGeneratedSecret('');
      setShowAddForm(false);
      
      fetchWebhooks();
    } catch (error) {
      console.error('Error adding webhook:', error);
      toast.error('Failed to add webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      await deleteDoc(doc(db, `businesses/${businessId}/webhooks`, webhookId));
      toast.success('Webhook deleted');
      fetchWebhooks();
      setDeleteWebhookId(null);
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast.error('Failed to delete webhook');
    }
  };

  const handleTestWebhook = async (webhook: Webhook) => {
    toast.info('Testing webhook...');
    
    try {
      const testPayload = {
        type: 'webhook.test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook from ConfirmIT',
          businessId,
        },
      };

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ConfirmIT-Signature': 'test_signature',
        },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        toast.success('Webhook test successful!');
      } else {
        toast.error(`Webhook test failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast.error('Failed to send test webhook');
    }
  };

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    toast.success('Secret copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Webhook Management</CardTitle>
          <CardDescription>
            Configure webhooks to receive real-time events from ConfirmIT
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="webhooks">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="logs">Delivery Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="webhooks" className="space-y-4 mt-6">
              {!showAddForm ? (
                <Button onClick={() => setShowAddForm(true)} className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Webhook
                </Button>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Webhook</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="webhook-url">Webhook URL</Label>
                      <Input
                        id="webhook-url"
                        placeholder="https://your-domain.com/webhooks/confirmit"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Events to Subscribe</Label>
                      {AVAILABLE_EVENTS.map((event) => (
                        <div key={event.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={event.id}
                            checked={selectedEvents.includes(event.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedEvents([...selectedEvents, event.id]);
                              } else {
                                setSelectedEvents(selectedEvents.filter(e => e !== event.id));
                              }
                            }}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor={event.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {event.label}
                            </label>
                            <p className="text-xs text-muted-foreground">
                              {event.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label>Webhook Secret</Label>
                      <div className="flex gap-2">
                        <Input
                          value={generatedSecret}
                          readOnly
                          placeholder="Click generate to create a secret"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => generateSecret()}
                        >
                          Generate
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Use this secret to validate webhook signatures
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleAddWebhook} disabled={loading}>
                        {loading ? 'Adding...' : 'Add Webhook'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddForm(false);
                          setWebhookUrl('');
                          setSelectedEvents([]);
                          setGeneratedSecret('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator />

              <div className="space-y-4">
                {webhooks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No webhooks configured yet</p>
                    <p className="text-sm mt-2">Add your first webhook to receive real-time events</p>
                  </div>
                ) : (
                  webhooks.map((webhook) => (
                    <Card key={webhook.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <code className="text-sm bg-muted px-2 py-1 rounded">
                                  {webhook.url}
                                </code>
                                <Badge variant={webhook.enabled ? "default" : "secondary"}>
                                  {webhook.enabled ? 'Active' : 'Disabled'}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {webhook.events.map((event) => (
                                  <Badge key={event} variant="outline">
                                    {AVAILABLE_EVENTS.find(e => e.id === event)?.label || event}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Secret:</span>
                                <code className="bg-muted px-2 py-1 rounded">
                                  {webhook.secret.substring(0, 20)}...
                                </code>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copySecret(webhook.secret)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTestWebhook(webhook)}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Test
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteWebhookId(webhook.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="logs" className="mt-6">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No webhook deliveries yet</p>
                  <p className="text-sm mt-2">Logs will appear here when events are triggered</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline">{log.event}</Badge>
                        </TableCell>
                        <TableCell>
                          {log.success ? (
                            <Badge variant="default" className="gap-1">
                              <Check className="h-3 w-3" />
                              {log.status}
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <X className="h-3 w-3" />
                              {log.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                          {log.response}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.timestamp.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteWebhookId} onOpenChange={() => setDeleteWebhookId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this webhook? This action cannot be undone and you will stop receiving events.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteWebhookId && handleDeleteWebhook(deleteWebhookId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
