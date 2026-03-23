import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link as LinkIcon, Copy, Share2, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HederaAnchorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptId: string;
  onAnchor: () => Promise<{ transactionId: string; explorerUrl: string }>;
  existingAnchor?: {
    transaction_id: string;
    explorer_url: string;
    consensus_timestamp: string;
  };
}

export const HederaAnchorModal = ({
  open,
  onOpenChange,
  receiptId,
  onAnchor,
  existingAnchor,
}: HederaAnchorModalProps) => {
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [anchorResult, setAnchorResult] = useState<{
    transactionId: string;
    explorerUrl: string;
  } | null>(existingAnchor ? {
    transactionId: existingAnchor.transaction_id,
    explorerUrl: existingAnchor.explorer_url
  } : null);

  const handleAnchor = async () => {
    setIsAnchoring(true);
    try {
      const result = await onAnchor();
      setAnchorResult(result);
      toast.success('Successfully anchored to Hedera blockchain!');
    } catch (error) {
      toast.error('Failed to anchor. Please try again.');
      console.error('Anchor error:', error);
    } finally {
      setIsAnchoring(false);
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/receipt/${receiptId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/receipt/${receiptId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Legit Verification Report',
          text: 'Verified on Hedera Blockchain',
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-purple-500/10">
              <LinkIcon className="h-5 w-5 text-purple-500" />
            </div>
            <DialogTitle className="text-xl">Blockchain Verification</DialogTitle>
          </div>
          <DialogDescription>
            Create immutable proof of this analysis on the Hedera blockchain
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!anchorResult ? (
            <motion.div
              key="pre-anchor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 py-4"
            >
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <h4 className="font-semibold text-sm">What is blockchain anchoring?</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                    <span>Creates permanent, tamper-proof record of this verification</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                    <span>Verifiable by anyone, anywhere, anytime</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                    <span>Powered by Hedera Consensus Service (HCS)</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                    <span>Cryptographic proof for legal or business purposes</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Recommended</Badge>
                  <span className="text-sm font-medium">Free for all users</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="post-anchor"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 py-4"
            >
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-success/10">
                  <CheckCircle2 className="h-12 w-12 text-success" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Successfully Anchored!</h3>
                <p className="text-sm text-muted-foreground">
                  This verification is now permanently recorded on Hedera blockchain
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Transaction ID</p>
                  <p className="text-sm font-mono break-all">{anchorResult.transactionId}</p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <a href={anchorResult.explorerUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on HashScan Explorer
                  </a>
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">Share this verification</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/receipt/${receiptId}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(`Verified on Legit: ${shareUrl}`)}`, '_blank');
                    }}
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/receipt/${receiptId}`;
                      window.location.href = `mailto:?subject=Verified Receipt&body=This receipt has been verified on Legit blockchain: ${shareUrl}`;
                    }}
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter>
          {!anchorResult ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAnchoring}>
                Cancel
              </Button>
              <Button onClick={handleAnchor} disabled={isAnchoring}>
                {isAnchoring ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Anchoring...
                  </>
                ) : (
                  'Anchor to Hedera'
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
