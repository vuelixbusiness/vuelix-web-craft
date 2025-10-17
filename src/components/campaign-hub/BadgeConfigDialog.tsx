import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Award, Star, Target, Flame, Crown, Zap, Medal, Shield, Diamond } from "lucide-react";

export interface BadgeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria?: {
    type?: 'views' | 'likes' | 'shares' | 'none';
    threshold?: number;
  };
}

interface BadgeConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge?: BadgeConfig;
  onSave: (badge: BadgeConfig) => void;
}

const ICON_OPTIONS = [
  { name: 'Trophy', icon: Trophy, value: 'trophy' },
  { name: 'Award', icon: Award, value: 'award' },
  { name: 'Star', icon: Star, value: 'star' },
  { name: 'Target', icon: Target, value: 'target' },
  { name: 'Flame', icon: Flame, value: 'flame' },
  { name: 'Crown', icon: Crown, value: 'crown' },
  { name: 'Zap', icon: Zap, value: 'zap' },
  { name: 'Medal', icon: Medal, value: 'medal' },
  { name: 'Shield', icon: Shield, value: 'shield' },
  { name: 'Diamond', icon: Diamond, value: 'diamond' },
];

export function BadgeConfigDialog({ open, onOpenChange, badge, onSave }: BadgeConfigDialogProps) {
  const [form, setForm] = useState<BadgeConfig>({
    id: '',
    name: '',
    description: '',
    icon: 'trophy',
    criteria: {
      type: 'none',
      threshold: 0,
    }
  });

  useEffect(() => {
    if (badge) {
      setForm(badge);
    } else {
      setForm({
        id: Date.now().toString(),
        name: '',
        description: '',
        icon: 'trophy',
        criteria: {
          type: 'none',
          threshold: 0,
        }
      });
    }
  }, [badge, open]);

  const handleSave = () => {
    if (!form.name.trim()) {
      return;
    }
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{badge ? 'Edit Badge' : 'Add Badge'}</DialogTitle>
          <DialogDescription>
            Configure a badge that participants can earn from this campaign.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Badge Name */}
          <div className="space-y-2">
            <Label htmlFor="badge-name">Badge Name</Label>
            <Input
              id="badge-name"
              placeholder="e.g., Top Performer"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="badge-description">Description</Label>
            <Textarea
              id="badge-description"
              placeholder="e.g., Achieve 10,000+ views"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-5 gap-2">
              {ICON_OPTIONS.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm({ ...form, icon: option.value })}
                    className={`p-3 rounded-lg border-2 transition-colors hover:border-primary ${
                      form.icon === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    }`}
                    title={option.name}
                  >
                    <IconComponent className="h-5 w-5 mx-auto" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Earning Criteria */}
          <div className="space-y-2">
            <Label>Earning Criteria (Optional)</Label>
            <div className="flex gap-2">
              <Select
                value={form.criteria?.type || 'none'}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    criteria: { ...form.criteria, type: value as any },
                  })
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="likes">Likes</SelectItem>
                  <SelectItem value="shares">Shares</SelectItem>
                </SelectContent>
              </Select>

              {form.criteria?.type && form.criteria.type !== 'none' && (
                <Input
                  type="number"
                  placeholder="Threshold"
                  className="w-32"
                  value={form.criteria.threshold || 0}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      criteria: {
                        ...form.criteria,
                        threshold: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                />
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!form.name.trim()}>
            {badge ? 'Update Badge' : 'Add Badge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
