import { Calendar, DollarSign, Users, TrendingUp, Clock, Crown, Lock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CampaignMediaAssetsPanel } from "../CampaignMediaAssetsPanel";
import { CampaignReferencesBox } from "../CampaignReferencesBox";
import { CampaignParticipantsBox } from "../CampaignParticipantsBox";
import { FaTiktok, FaInstagram, FaYoutube, FaTwitter } from "react-icons/fa";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

import { formatCurrency } from "@/lib/utils";

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  artist_id: string;
  payout_type: string;
  payout_rate: number;
  vip_bonus?: number;
  max_payout?: number;
  vip_max_payout?: number;
  platforms: string[];
  budget?: number;
  availableBudget?: number;
  redeemed?: number;
  budgetUsedPercentage?: number;
  end_date?: string;
  created_at: string;
  cover_art_url?: string;
  genre?: string;
  status?: string;
  reference_links?: string;
}

interface Participation {
  id: string;
  status: string;
  created_at: string;
}

interface MediaAsset {
  id: string;
  url: string;
  type: string;
  created_at: string;
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

interface CampaignOverviewSectionProps {
  campaign: Campaign;
  participation?: Participation;
  mediaAssets?: MediaAsset[];
  participants?: UniqueParticipant[];
  onJoinCampaign?: (campaign: Campaign) => void;
}

const platformIcons = {
  tiktok: <FaTiktok className="w-4 h-4" />,
  instagram: <FaInstagram className="w-4 h-4" />,
  youtube: <FaYoutube className="w-4 h-4" />,
  twitter: <FaTwitter className="w-4 h-4" />,
  spotify: "🎧"
};

const platformNames: Record<string, string> = {
  tiktok: "TikTok",
  youtube: "YouTube",
  instagram: "Instagram", 
  twitter: "Twitter",
  spotify: "Spotify"
};

export function CampaignOverviewSection({ campaign, participation, mediaAssets = [], participants = [], onJoinCampaign }: CampaignOverviewSectionProps) {
  const [approvalRate, setApprovalRate] = useState<number | null>(null);
  const [avgResponseTime, setAvgResponseTime] = useState<number | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  const budgetSpent = (campaign.budget || 0) * 0.65; // Mock data
  const daysRemaining = campaign.end_date 
    ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  // Mock data for engagement pot if not provided
  const availableBudget = campaign.availableBudget || (campaign.budget || 0) - budgetSpent;
  const redeemed = campaign.redeemed || budgetSpent;
  const budgetUsedPercentage = campaign.budgetUsedPercentage || ((campaign.budget ? (budgetSpent / campaign.budget) * 100 : 0));

  useEffect(() => {
    const fetchCampaignMetrics = async () => {
      try {
        setIsLoadingMetrics(true);
        
        // Fetch all participations for this campaign
        const { data: participations, error } = await supabase
          .from('campaign_participations')
          .select('*')
          .eq('campaign_id', campaign.id);

        if (error) {
          console.error('Error fetching campaign participations:', error);
          return;
        }

        if (!participations || participations.length === 0) {
          setApprovalRate(null);
          setAvgResponseTime(null);
          return;
        }

        // Calculate approval rate
        const totalSubmissions = participations.length;
        const approvedSubmissions = participations.filter(p => 
          p.status === 'approved' || p.status === 'live'
        ).length;
        const calculatedApprovalRate = totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0;
        setApprovalRate(calculatedApprovalRate);

        // Calculate average response time for processed submissions
        const processedSubmissions = participations.filter(p => 
          p.status !== 'pending' && p.status !== 'submitted' && 
          p.created_at !== p.updated_at
        );

        if (processedSubmissions.length > 0) {
          const totalResponseTime = processedSubmissions.reduce((total, p) => {
            const createdAt = new Date(p.created_at).getTime();
            const updatedAt = new Date(p.updated_at).getTime();
            return total + (updatedAt - createdAt);
          }, 0);

          const avgResponseTimeMs = totalResponseTime / processedSubmissions.length;
          const avgResponseTimeHours = avgResponseTimeMs / (1000 * 60 * 60);
          setAvgResponseTime(avgResponseTimeHours);
        } else {
          setAvgResponseTime(null);
        }
      } catch (error) {
        console.error('Error calculating campaign metrics:', error);
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    fetchCampaignMetrics();
  }, [campaign.id]);

  return (
    <div className="space-y-6">
      {/* Campaign Header - Aligned with Media Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="relative">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24 rounded-xl">
                  <AvatarImage src={campaign.cover_art_url} alt={campaign.title} />
                  <AvatarFallback className="rounded-xl text-lg">
                    {campaign.title.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold">{campaign.title}</h1>
                    <p className="text-xl text-muted-foreground">{campaign.song_title}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {campaign.genre && <Badge variant="secondary">{campaign.genre}</Badge>}
                      {campaign.platforms.includes('tiktok') && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          {platformIcons['tiktok']}
                          <span>{platformNames['tiktok']}</span>
                        </Badge>
                      )}
                      {campaign.platforms.filter(platform => platform !== 'tiktok').map((platform) => (
                        <Badge key={platform} variant="outline" className="flex items-center gap-1">
                          {platformIcons[platform as keyof typeof platformIcons] || "📱"}
                          <span>{platformNames[platform] || platform}</span>
                        </Badge>
                      ))}
                      {campaign.status && (
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        ${campaign.payout_rate} per 1,000 Views
                      </span>
                      {campaign.vip_bonus && (
                        <Badge variant="outline" className="text-xs text-primary border-primary">
                          +${campaign.vip_bonus} VIP bonus
                        </Badge>
                      )}
                    </div>
                    {campaign.max_payout && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Max ${campaign.max_payout} payout
                        </span>
                      </div>
                    )}
                    {campaign.vip_max_payout && campaign.vip_max_payout !== campaign.max_payout && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs text-primary border-primary">
                          VIP Max ${campaign.vip_max_payout} payout
                        </Badge>
                        <Crown className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    {daysRemaining !== null && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {daysRemaining > 0 ? `${daysRemaining} days left` : 'Campaign ended'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Engagement Pot - Aligned with Media Assets */}
      {campaign.budget && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-secondary/30 rounded-lg px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Engagement Pot</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {budgetUsedPercentage.toFixed(1)}% used
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(availableBudget)}
                  </p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatCurrency(redeemed)} redeemed
                  </span>
                  <span className="text-muted-foreground">
                    of {formatCurrency(campaign.budget)} total
                  </span>
                </div>
                
                <div className="space-y-1">
                  <Progress value={budgetUsedPercentage} className="h-3" />
                  {budgetUsedPercentage > 15 && (
                    <div className="text-center">
                      <span className="text-xs font-medium">
                        {budgetUsedPercentage.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid - Two columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Media Assets, References, and Participants */}
        <div className="lg:col-span-2 space-y-6">
          <CampaignMediaAssetsPanel 
            campaign={campaign} 
            mediaAssets={mediaAssets} 
            isLoading={false} 
          />
          
          <CampaignReferencesBox 
            referenceLinks={campaign.reference_links} 
          />
          
        </div>

        {/* Right Column - Campaign Stats */}
        <div className="lg:col-span-1 space-y-6">

          {/* Stats Grid */}
          <div className="space-y-4">
            {/* Performance and Response Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingMetrics ? (
                      <div className="animate-pulse bg-muted rounded h-8 w-16"></div>
                    ) : approvalRate !== null ? (
                      `${Math.round(approvalRate)}%`
                    ) : (
                      "No data"
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    submission approval rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingMetrics ? (
                      <div className="animate-pulse bg-muted rounded h-8 w-16"></div>
                    ) : avgResponseTime !== null ? (
                      avgResponseTime < 1 ? 
                        `${Math.round(avgResponseTime * 60)}m` : 
                        `${avgResponseTime.toFixed(1)}h`
                    ) : (
                      "No data"
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    avg. response time
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Campaign Status Box */}
            {!participation ? (
              <Card className="opacity-60">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <Lock className="h-4 w-4 text-muted-foreground mr-2" />
                  <CardTitle className="text-sm font-medium">Campaign Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Join this Campaign to unlock access
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <CardTitle className="text-sm font-medium">Campaign Status</CardTitle>
                </CardHeader>
                 <CardContent>
                   <div className="space-y-2">
                     <Badge variant="outline" className="capitalize">
                       {participation.status === 'owner' ? 'Campaign Owner' : participation.status}
                     </Badge>
                     <p className="text-xs text-muted-foreground">
                       {participation.status === 'owner' 
                         ? `Created on ${new Date(participation.created_at).toLocaleDateString()}`
                         : `Joined on ${new Date(participation.created_at).toLocaleDateString()}`
                       }
                     </p>
                   </div>
                 </CardContent>
              </Card>
            )}

            {/* Campaign Participants Box - Only show for artists/owners */}
            {participation?.status === 'owner' && (
              <CampaignParticipantsBox 
                participants={participants}
              />
            )}
          </div>


           {/* Participation Status */}
           {participation && (
             <Card>
               <CardHeader>
                 <CardTitle>
                   {participation.status === 'owner' ? 'Campaign Owner' : 'Your Participation'}
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="font-medium">
                       {participation.status === 'owner' 
                         ? `Created on ${new Date(participation.created_at).toLocaleDateString()}`
                         : `Joined on ${new Date(participation.created_at).toLocaleDateString()}`
                       }
                     </p>
                     <p className="text-sm text-muted-foreground">
                       Current status: {participation.status === 'owner' ? 'Campaign Owner' : participation.status}
                     </p>
                   </div>
                   <Badge variant="outline" className="capitalize">
                     {participation.status === 'owner' ? 'Owner' : participation.status}
                   </Badge>
                 </div>
               </CardContent>
             </Card>
           )}
        </div>
      </div>

      {/* Dynamic Join/Status Button - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40">
        {!participation ? (
          <Button
            onClick={() => onJoinCampaign?.(campaign)}
            variant="hero"
            size="lg"
            className="animate-pulse shadow-elegant text-lg font-bold px-8 py-4 h-auto"
          >
            🔘 Join Now
          </Button>
        ) : (
          <Button
            disabled
            size="lg"
            className="bg-green-600 hover:bg-green-600 text-white shadow-elegant text-lg font-bold px-8 py-4 h-auto cursor-default"
          >
            🟢 Campaign Active
          </Button>
        )}
      </div>
    </div>
  );
}