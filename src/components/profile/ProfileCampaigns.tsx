import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music2, Plus, MoreVertical, Edit, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CampaignCard from "@/components/ui/campaign-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  song_url: string;
  cover_art_url: string;
  status: string;
  created_at: string;
  payout_type: string;
  payout_rate: number | null;
  hybrid_reward_description?: string;
  fixed_rate_description?: string;
  budget: number;
  platforms: string[];
  genre: string;
  description?: string;
  rules?: string;
  end_date?: string;
  campaign_mode?: string;
  starting_rate?: number;
  profiles?: {
    display_name?: string;
    username?: string;
  } | null;
  spent?: number;
  actualSpent?: number;
  redeemed?: number;
  availableBudget?: number;
  budgetUsedPercentage?: number;
  views?: number;
  totalViews?: number;
  activeCreators?: number;
  approval_required?: boolean;
}

interface ProfileCampaignsProps {
  userId: string;
  limit?: number;
}

export function ProfileCampaigns({ userId, limit }: ProfileCampaignsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [createdCampaigns, setCreatedCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [campaignParticipations, setCampaignParticipations] = useState<Record<string, boolean>>({});

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    fetchCampaigns();
  }, [userId, limit]);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);

      // Fetch campaigns created by user
      let createdQuery = supabase
        .from('campaigns')
        .select(`
          id,
          title,
          song_title,
          song_url,
          cover_art_url,
          status,
          created_at,
          payout_type,
          payout_rate,
          hybrid_reward_description,
          fixed_rate_description,
          budget,
          platforms,
          genre,
          instructions,
          rules,
          end_date,
          artist_id,
          approval_required,
          campaign_mode,
          starting_rate
        `)
        .eq('artist_id', userId)
        .order('created_at', { ascending: false });

      if (limit) {
        createdQuery = createdQuery.limit(limit);
      }

      const { data: created } = await createdQuery;

      // Fetch artist profiles separately
      const artistIds = [...new Set((created || []).map(c => c.artist_id))];
      const { data: artistProfiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name')
        .in('user_id', artistIds);

      // Create a lookup map for profiles
      const profileMap = new Map(
        artistProfiles?.map(p => [p.user_id, p]) || []
      );

      // Calculate budget statistics for each campaign
      const campaignsWithStats = await Promise.all(
        (created || []).map(async (campaign) => {
          // Get total spent/redeemed from participations
          const { data: participations } = await supabase
            .from('campaign_participations')
            .select('payout_amount, payout_claimed')
            .eq('campaign_id', campaign.id);

          const redeemed = participations?.reduce(
            (sum, p) => sum + (p.payout_claimed ? Number(p.payout_amount) : 0),
            0
          ) || 0;

          const availableBudget = Number(campaign.budget) - redeemed;
          const budgetUsedPercentage = (redeemed / Number(campaign.budget)) * 100;

          return {
            ...campaign,
            profiles: profileMap.get(campaign.artist_id) || null,
            redeemed,
            availableBudget,
            budgetUsedPercentage,
          };
        })
      );

      setCreatedCampaigns(campaignsWithStats);
      
      // Check which campaigns the current user has joined
      if (campaignsWithStats.length > 0) {
        const campaignIds = campaignsWithStats.map(c => c.id);
        await checkUserParticipations(campaignIds);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserParticipations = async (campaignIds: string[]) => {
    if (!user?.id || isOwnProfile) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('campaign_participations')
        .select('campaign_id')
        .eq('creator_id', user.id)
        .in('campaign_id', campaignIds);

      if (error) throw error;

      const participationMap: Record<string, boolean> = {};
      campaignIds.forEach(id => {
        participationMap[id] = data?.some(p => p.campaign_id === id) || false;
      });

      setCampaignParticipations(participationMap);
    } catch (error) {
      console.error('Error checking participations:', error);
    }
  };

  const handleDeleteClick = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!campaignToDelete || !user?.id) return;

    try {
      const isActive = campaignToDelete.status === 'active';
      
      if (isActive) {
        const { error: terminateError } = await supabase
          .from('campaigns')
          .update({ status: 'terminated' })
          .eq('id', campaignToDelete.id)
          .eq('artist_id', user.id);

        if (terminateError) throw terminateError;
      }

      const { error: deleteError } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignToDelete.id)
        .eq('artist_id', user.id);

      if (deleteError) throw deleteError;

      setCreatedCampaigns(prev => prev.filter(c => c.id !== campaignToDelete.id));
      
      toast({
        title: "Campaign deleted",
        description: isActive 
          ? "Campaign was terminated and deleted successfully" 
          : "Campaign deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete campaign",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setCampaignToDelete(null);
    }
  };

  const handleJoinCampaign = async (campaign: Campaign) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join campaigns",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    try {
      const { error: participationError } = await supabase
        .from('campaign_participations')
        .insert({
          campaign_id: campaign.id,
          creator_id: user.id,
          status: 'pending',
        });

      if (participationError) throw participationError;

      await supabase.from('campaign_activities').insert({
        campaign_id: campaign.id,
        user_id: user.id,
        activity_type: 'join_request',
        title: 'New Join Request',
        message: `${user.username || 'User'} requested to join the campaign`,
        priority: 'medium',
      });

      setCampaignParticipations(prev => ({
        ...prev,
        [campaign.id]: true,
      }));

      toast({
        title: "Success",
        description: campaign.approval_required 
          ? "Your join request has been submitted and is pending approval" 
          : "You've successfully joined the campaign!",
      });

      navigate(`/campaign/${campaign.id}`);
    } catch (error: any) {
      console.error('Error joining campaign:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join campaign",
        variant: "destructive",
      });
    }
  };

  const toggleAudio = (campaignId: string, audioUrl: string) => {
    if (currentlyPlaying === campaignId) {
      audioRef.current?.pause();
      setCurrentlyPlaying(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setCurrentlyPlaying(campaignId);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Campaigns Created */}
      {createdCampaigns.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Music2 className="w-5 h-5" />
              Campaigns Created
            </CardTitle>
            {isOwnProfile && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/artist-campaign')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {createdCampaigns.map((campaign) => (
                <div key={campaign.id} className="relative">
              <CampaignCard
                campaign={campaign}
                variant="creator-available"
                showPlayButton={true}
                showJoinButton={!isOwnProfile && !campaignParticipations[campaign.id]}
                isJoined={campaignParticipations[campaign.id]}
                onJoinCampaign={handleJoinCampaign}
                onCampaignClick={() => navigate(`/artist/campaign/${campaign.id}`)}
                onAudioToggle={toggleAudio}
                isPlaying={currentlyPlaying === campaign.id}
              />
                  {isOwnProfile && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background z-10"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/artist/campaign/${campaign.id}`); }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(campaign); }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
            <audio
              ref={audioRef}
              onEnded={() => setCurrentlyPlaying(null)}
              onError={() => setCurrentlyPlaying(null)}
            />

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {campaignToDelete?.status === 'active' 
                      ? 'This campaign is active and will be terminated before deletion. This action cannot be undone.'
                      : 'This action cannot be undone. This will permanently delete this campaign.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Campaigns</CardTitle>
            {isOwnProfile && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/artist-campaign')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No campaigns created yet
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
