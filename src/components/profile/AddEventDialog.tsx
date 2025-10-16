import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from 'lucide-react';

interface AddEventDialogProps {
  open: boolean;
  onClose: () => void;
}

export const AddEventDialog = ({ open, onClose }: AddEventDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Add Event
          </DialogTitle>
        </DialogHeader>
        <div className="py-8 text-center text-muted-foreground">
          <p>Event creation form coming soon</p>
          <p className="text-sm mt-2">You'll be able to add concerts, festivals, and appearances</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
