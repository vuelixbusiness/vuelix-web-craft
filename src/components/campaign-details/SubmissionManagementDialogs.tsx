import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Submission {
  id: string;
  creator_id: string;
  video_url: string;
  platform: string;
  current_views: number;
  current_likes: number;
  initial_views: number;
  initial_likes: number;
  status: string;
  payout_amount: number;
  payout_claimed: boolean;
  created_at: string;
  last_tracked_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface SubmissionManagementDialogsProps {
  dialogState: {
    type: 'status' | 'payout' | 'note' | null;
    submission: Submission | null;
  };
  onClose: () => void;
  onPayoutUpdate: (submissionId: string, amount: number) => void;
  formatCurrency: (amount: number) => string;
}

export const SubmissionManagementDialogs = ({ 
  dialogState, 
  onClose, 
  onPayoutUpdate,
  formatCurrency 
}: SubmissionManagementDialogsProps) => {
  const [payoutAmount, setPayoutAmount] = useState('');
  const [note, setNote] = useState('');

  const handlePayoutSubmit = () => {
    if (!dialogState.submission) return;
    
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount < 0) return;
    
    onPayoutUpdate(dialogState.submission.id, amount);
    setPayoutAmount('');
    onClose();
  };

  const handleNoteSubmit = () => {
    // TODO: Implement note saving functionality
    console.log('Saving note:', note);
    setNote('');
    onClose();
  };

  return (
    <>
      {/* Payout Edit Dialog */}
      <Dialog open={dialogState.type === 'payout'} onOpenChange={() => onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payout Amount</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Creator</Label>
              <p className="text-sm text-muted-foreground">
                @{dialogState.submission?.profiles?.username}
              </p>
            </div>
            <div>
              <Label>Current Payout</Label>
              <p className="text-sm font-medium">
                {dialogState.submission ? formatCurrency(dialogState.submission.payout_amount) : '$0.00'}
              </p>
            </div>
            <div>
              <Label htmlFor="payout-amount">New Payout Amount</Label>
              <Input
                id="payout-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handlePayoutSubmit}>
                Update Payout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={dialogState.type === 'note'} onOpenChange={() => onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Internal Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Creator</Label>
              <p className="text-sm text-muted-foreground">
                @{dialogState.submission?.profiles?.username}
              </p>
            </div>
            <div>
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                placeholder="Add internal notes about this submission..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleNoteSubmit}>
                Save Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};