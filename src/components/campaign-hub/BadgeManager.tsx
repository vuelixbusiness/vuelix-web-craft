import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Trash2, Trophy, Award, Star, Target, Flame, Crown, Zap, Medal, Shield, Diamond } from "lucide-react";
import { BadgeConfigDialog, type BadgeConfig } from "./BadgeConfigDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface BadgeManagerProps {
  badges: BadgeConfig[];
  onChange: (badges: BadgeConfig[]) => void;
}

const ICON_MAP: Record<string, any> = {
  trophy: Trophy,
  award: Award,
  star: Star,
  target: Target,
  flame: Flame,
  crown: Crown,
  zap: Zap,
  medal: Medal,
  shield: Shield,
  diamond: Diamond,
};

export function BadgeManager({ badges, onChange }: BadgeManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeConfig | undefined>();
  const [deletingBadge, setDeletingBadge] = useState<BadgeConfig | undefined>();

  const handleAddBadge = () => {
    setEditingBadge(undefined);
    setDialogOpen(true);
  };

  const handleEditBadge = (badge: BadgeConfig) => {
    setEditingBadge(badge);
    setDialogOpen(true);
  };

  const handleSaveBadge = (badge: BadgeConfig) => {
    if (editingBadge) {
      // Update existing badge
      onChange(badges.map((b) => (b.id === badge.id ? badge : b)));
    } else {
      // Add new badge
      onChange([...badges, badge]);
    }
  };

  const handleDeleteBadge = (badge: BadgeConfig) => {
    onChange(badges.filter((b) => b.id !== badge.id));
    setDeletingBadge(undefined);
  };

  return (
    <div className="space-y-2">
      <Label>Campaign Badges</Label>
      <p className="text-sm text-muted-foreground mb-3">
        Add badges that participants can earn from completing this campaign.
      </p>

      {/* Badges List */}
      {badges.length > 0 && (
        <div className="space-y-2 mb-3">
          {badges.map((badge) => {
            const IconComponent = ICON_MAP[badge.icon] || Trophy;
            return (
              <div
                key={badge.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{badge.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {badge.description}
                  </p>
                  {badge.criteria?.type && badge.criteria.type !== 'none' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Earn at {badge.criteria.threshold?.toLocaleString()} {badge.criteria.type}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditBadge(badge)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeletingBadge(badge)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Badge Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddBadge}
        className="w-full gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Badge
      </Button>

      {/* Badge Config Dialog */}
      <BadgeConfigDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        badge={editingBadge}
        onSave={handleSaveBadge}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingBadge} onOpenChange={() => setDeletingBadge(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Badge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingBadge?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingBadge && handleDeleteBadge(deletingBadge)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
