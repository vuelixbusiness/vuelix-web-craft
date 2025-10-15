import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Edit, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CampaignSidebar } from "./CampaignSidebar";
import { CampaignOverviewSection } from "./sections/CampaignOverviewSection";
import { RulesSection } from "./sections/RulesSection";
import { RewardsSection } from "./sections/RewardsSection";
import { CommunicationSection } from "./sections/CommunicationSection";
import { UpdatesSection } from "./sections/UpdatesSection";
import SubmissionsLog from "@/components/campaign-details/SubmissionsLog";
import { SectionUpdateProvider, useSectionUpdates, type CampaignSectionType } from "@/contexts/SectionUpdateContext";

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  song_url?: string;
  artist_id: string;
  payout_type: string;
  payout_rate: number;
  vip_bonus?: number;
  platforms: string[];
  budget?: number;
  end_date?: string;
  created_at: string;
  cover_art_url?: string;
  instructions?: string;
  rules?: string;
  genre?: string;
  status?: string;
}

interface MediaAsset {
  id: string;
  url: string;
  type: string;
  created_at: string;
}

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

interface UniqueParticipant {
  creator_id: string;
  join_date: string;
  submission_count: number;
  platforms: string[];
  primary_platform: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ArtistCampaignHubLayoutProps {
  campaign: Campaign;
  mediaAssets?: MediaAsset[];
  submissions?: Submission[];
  onBack: () => void;
  onSubmissionUpdate?: () => void;
  onCampaignUpdate?: () => Promise<void>;
}

function ArtistCampaignHubContent({ 
  campaign, 
  mediaAssets = [],
  submissions = [],
  onBack,
  onSubmissionUpdate,
  onCampaignUpdate
}: ArtistCampaignHubLayoutProps) {
  const [activeSection, setActiveSection] = useState<CampaignSectionType>("overview");
  const { sectionUpdates, markSectionAsUpdated, markSectionAsRead } = useSectionUpdates();
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [coverArtPreview, setCoverArtPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    instructions: campaign.instructions || "",
    rules: campaign.rules || "",
  });
  
  // Track submissions changes with proper state comparison
  const [prevSubmissions, setPrevSubmissions] = useState<Submission[]>(submissions);
  
  useEffect(() => {
    // Check for new submissions
    if (submissions.length > prevSubmissions.length) {
      markSectionAsUpdated("submissions");
      markSectionAsUpdated("overview");
    }
    
    // Check for status changes in existing submissions
    const statusChanged = submissions.some(submission => {
      const prevSubmission = prevSubmissions.find(prev => prev.id === submission.id);
      return prevSubmission && prevSubmission.status !== submission.status;
    });
    
    if (statusChanged) {
      markSectionAsUpdated("submissions");
      markSectionAsUpdated("overview");
    }
    
    setPrevSubmissions(submissions);
  }, [submissions, prevSubmissions, markSectionAsUpdated]);

  // Create wrapper for onSubmissionUpdate to trigger section updates
  const handleSubmissionUpdate = useCallback(() => {
    markSectionAsUpdated("submissions");
    markSectionAsUpdated("overview");
    onSubmissionUpdate?.();
  }, [markSectionAsUpdated, onSubmissionUpdate]);

  // Create wrapper for communication section updates
  const handleMessageSent = useCallback(() => {
    markSectionAsUpdated("communication");
  }, [markSectionAsUpdated]);

  // Handle section changes and mark as read
  const handleSectionChange = useCallback((section: CampaignSectionType) => {
    setActiveSection(section);
    markSectionAsRead(section);
  }, [markSectionAsRead]);

  // File upload handler
  const handleCoverArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be smaller than 5MB");
        return;
      }
      setCoverArtFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setCoverArtPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Remove cover art preview
  const handleRemoveCoverArt = () => {
    setCoverArtFile(null);
    setCoverArtPreview(null);
  };

  // Update campaign
  const updateCampaign = async () => {
    setIsSaving(true);
    try {
      let coverArtUrl = campaign.cover_art_url;
      
      // Upload new cover art if file was selected
      if (coverArtFile) {
        const fileExt = coverArtFile.name.split('.').pop();
        const fileName = `${campaign.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('campaign-cover-art')
          .upload(fileName, coverArtFile, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Failed to upload cover art');
        }
        
        const { data } = supabase.storage
          .from('campaign-cover-art')
          .getPublicUrl(fileName);
        
        coverArtUrl = data.publicUrl;
      }
      
      // Update campaign in database
      const { error } = await supabase
        .from('campaigns')
        .update({
          instructions: editForm.instructions || null,
          rules: editForm.rules || null,
          cover_art_url: coverArtUrl,
        })
        .eq('id', campaign.id);
        
      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      
      // Refresh campaign data
      if (onCampaignUpdate) {
        await onCampaignUpdate();
      }
      
      toast.success("Campaign updated successfully");
      setEditDialogOpen(false);
      setCoverArtFile(null);
      setCoverArtPreview(null);
    } catch (error: any) {
      console.error('Error updating campaign:', error);
      toast.error(error.message || "Failed to update campaign");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (editDialogOpen) {
      setEditForm({
        instructions: campaign.instructions || "",
        rules: campaign.rules || "",
      });
      setCoverArtFile(null);
      setCoverArtPreview(null);
    }
  }, [editDialogOpen, campaign.instructions, campaign.rules]);

  // Helper function to transform submissions into unique participants
  const transformToParticipants = (submissions: Submission[]): UniqueParticipant[] => {
    const participantMap = new Map<string, UniqueParticipant>();
    
    submissions.forEach(submission => {
      const creatorId = submission.creator_id;
      
      if (participantMap.has(creatorId)) {
        const existing = participantMap.get(creatorId)!;
        existing.submission_count++;
        if (!existing.platforms.includes(submission.platform)) {
          existing.platforms.push(submission.platform);
        }
      } else {
        participantMap.set(creatorId, {
          creator_id: creatorId,
          join_date: submission.created_at,
          submission_count: 1,
          platforms: [submission.platform],
          primary_platform: submission.platform,
          profiles: submission.profiles
        });
      }
    });
    
    return Array.from(participantMap.values()).sort((a, b) => 
      new Date(b.join_date).getTime() - new Date(a.join_date).getTime()
    );
  };

  const renderActiveSection = () => {
    // Artists have access to all sections, no locking logic needed
    
    switch (activeSection) {
      case "overview":
        // Mock participation for artists (campaign owners) to unlock all features
        const mockParticipation = {
          id: 'owner',
          status: 'owner',
          created_at: campaign.created_at
        };
        return <CampaignOverviewSection 
          campaign={campaign} 
          mediaAssets={mediaAssets} 
          participation={mockParticipation}
          participants={transformToParticipants(submissions)}
        />;
      case "rules":
        return <RulesSection campaign={campaign} />;
      case "rewards":
        return <RewardsSection campaign={campaign} />;
      case "submissions":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Complete Submissions Log</h2>
              <p className="text-muted-foreground">
                Manage all submissions and track performance across your campaign.
              </p>
            </div>

            <SubmissionsLog 
              submissions={submissions} 
              campaignId={campaign.id}
              isArtist={true}
              onSubmissionUpdate={handleSubmissionUpdate}
            />
          </div>
        );
      case "communication":
        return <CommunicationSection campaign={campaign} onMessageSent={handleMessageSent} />;
      case "updates":
        return <UpdatesSection campaign={campaign} />;
      default:
        const defaultMockParticipation = {
          id: 'owner',
          status: 'owner',
          created_at: campaign.created_at
        };
        return <CampaignOverviewSection 
          campaign={campaign} 
          mediaAssets={mediaAssets} 
          participation={defaultMockParticipation}
          participants={transformToParticipants(submissions)}
        />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center gap-4 h-full px-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <h1 className="font-semibold text-base truncate leading-tight">{campaign.title}</h1>
              <p className="text-xs text-muted-foreground truncate leading-tight">{campaign.song_title}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Campaign
            </Button>
          </div>
        </header>

        <div className="flex w-full pt-16">
          {/* Sidebar - Using existing CampaignSidebar but without participation restrictions */}
          <div className="w-80 flex-shrink-0">
            <CampaignSidebar 
              activeSection={activeSection} 
              onSectionChange={handleSectionChange}
              campaign={campaign}
              participation={{ 
                status: 'approved'
              }} // Mock participation so all sections are unlocked for artists
              sectionUpdates={sectionUpdates}
              onMarkSectionAsRead={markSectionAsRead}
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {renderActiveSection()}
          </main>
        </div>
      </div>

      {/* Edit Campaign Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>
              Update your campaign instructions, rules, and cover art.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Instructions */}
            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Enter campaign instructions for creators..."
                value={editForm.instructions}
                onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Rules */}
            <div className="space-y-2">
              <Label htmlFor="rules">Rules</Label>
              <Textarea
                id="rules"
                placeholder="Enter campaign rules..."
                value={editForm.rules}
                onChange={(e) => setEditForm({ ...editForm, rules: e.target.value })}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Cover Art */}
            <div className="space-y-2">
              <Label>Cover Art</Label>
              
              {/* Current Cover Art */}
              {campaign.cover_art_url && !coverArtPreview && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={campaign.cover_art_url} 
                    alt="Current cover art"
                    className="w-full h-full object-cover"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Current cover art</p>
                </div>
              )}

              {/* New Cover Art Preview */}
              {coverArtPreview && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={coverArtPreview} 
                    alt="New cover art preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveCoverArt}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">New cover art preview</p>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('cover-art-upload')?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {coverArtPreview ? 'Change Image' : 'Upload New Cover Art'}
                </Button>
                <input
                  id="cover-art-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverArtChange}
                  className="hidden"
                />
                <span className="text-xs text-muted-foreground">Max 5MB</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={updateCampaign} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

export function ArtistCampaignHubLayout(props: ArtistCampaignHubLayoutProps) {
  return (
    <SectionUpdateProvider campaignId={props.campaign.id}>
      <ArtistCampaignHubContent {...props} />
    </SectionUpdateProvider>
  );
}