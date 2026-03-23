import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

interface ReportFraudModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptId: string;
}

export const ReportFraudModal = ({
  open,
  onOpenChange,
  receiptId,
}: ReportFraudModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    accountNumber: '',
    story: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.story.trim()) {
      toast.error('Please tell us what happened');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/report-fraud`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiptId,
          businessName: formData.businessName || undefined,
          accountNumber: formData.accountNumber || undefined,
          description: formData.story,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      setIsSuccess(true);
      toast.success('Report submitted successfully');
      
      // Reset form after 2 seconds and close modal
      setTimeout(() => {
        setFormData({ businessName: '', accountNumber: '', story: '' });
        setIsSuccess(false);
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting fraud report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ businessName: '', accountNumber: '', story: '' });
      setIsSuccess(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-danger/10">
                  <AlertTriangle className="h-5 w-5 text-danger" />
                </div>
                <DialogTitle className="text-xl">Report Fraud</DialogTitle>
              </div>
              <DialogDescription>
                Help protect others by reporting suspicious activity
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">
                  Business Name <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <Input
                  id="businessName"
                  placeholder="e.g., Tech Hub Electronics"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">
                  Account Number <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <Input
                  id="accountNumber"
                  placeholder="e.g., 0123456789"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  disabled={isSubmitting}
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">
                  If you made a payment, provide the account number used
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="story">
                  What happened? <span className="text-danger">*</span>
                </Label>
                <Textarea
                  id="story"
                  placeholder="Describe the fraudulent activity, what happened, when it occurred, and any other relevant details..."
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  disabled={isSubmitting}
                  rows={6}
                  required
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Be as detailed as possible to help us investigate
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border">
                <p className="text-xs text-muted-foreground">
                  <strong>Privacy:</strong> Your report is confidential and helps us protect the community. 
                  We may contact you for additional information if needed.
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="py-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-success/10">
                <CheckCircle2 className="h-12 w-12 text-success" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Thank You!</h3>
              <p className="text-sm text-muted-foreground">
                Your report has been submitted successfully. This helps protect others in the community.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
