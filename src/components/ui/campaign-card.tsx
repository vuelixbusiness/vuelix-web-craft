import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import RunningTimer from "@/components/RunningTimer";
import { ClickableUsername } from "@/components/ui/clickable-username";
import { AudioPlayer } from "@/components/ui/audio-player";
import { 
  Play, 
  Pause, 
  Eye, 
  Heart, 
  TrendingUp, 
  PlayCircle,
  Calendar,
  Target,
  Users,
  CheckSquare,
  ExternalLink,
  Music,
  Euro
} from "lucide-react";
import PotIcon from "@/components/ui/pot-icon";
import { FaTiktok, FaInstagram, FaYoutube, FaTwitter } from "react-icons/fa";
import vuelixLogo from "@/assets/vuelix-logo-official.png";

interface Campaign {
  id: string;
  title?: string;
  song_title: string;
  song_url?: string;
  cover_art_url?: string;
  genre?: string;
  platforms?: string[];
  payout_rate?: number;
  payout_type?: string;
  hybrid_reward_description?: string;
  fixed_rate_description?: string;
  budget?: number;
  spent?: number;
  redeemed?: number;
  availableBudget?: number;
  budgetUsedPercentage?: number;
  views?: number;
  likes?: number;
  status?: string;
  end_date?: string;
  description?: string;
  rules?: string;
  profiles?: {
    display_name?: string;
    username?: string;
  } | null;
  actualSpent?: number;
  totalViews?: number;
  totalLikes?: number;
  activeCreators?: number;
  campaign_mode?: string;
  starting_rate?: number;
  campaign_badges?: Array<{ name: string; icon?: string }>;
  // Submission-specific fields
  current_views?: number;
  current_likes?: number;
  payout_amount?: number;
  video_url?: string;
  platform?: string;
  updated_at?: string;
}

interface CampaignCardProps {
  campaign: Campaign;
  variant?: 'artist' | 'creator-available' | 'creator-joined' | 'creator-submission';
  showJoinButton?: boolean;
  showPlayButton?: boolean;
  isJoined?: boolean;
  isServiceOffering?: boolean;
  onJoinCampaign?: (campaign: Campaign) => void;
  onCampaignClick?: (campaign: Campaign) => void;
  onAudioToggle?: (campaignId: string, songUrl: string) => void;
  isPlaying?: boolean;
  className?: string;
}

const CampaignCard = ({ 
  campaign, 
  variant = 'creator-available',
  showJoinButton = false,
  showPlayButton = true,
  isJoined = false,
  isServiceOffering = false,
  onJoinCampaign,
  onCampaignClick,
  onAudioToggle,
  isPlaying = false,
  className = ""
}: CampaignCardProps) => {
  const { toast } = useToast();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isAudioExpanded, setIsAudioExpanded] = useState(false);
  const [isRewardBoxExpanded, setIsRewardBoxExpanded] = useState(true);
  const [isRateBoxExpanded, setIsRateBoxExpanded] = useState(true);
  
  const platformIcons = {
    tiktok: <FaTiktok className="w-4 h-4" />,
    instagram: <FaInstagram className="w-4 h-4" />,
    youtube: <FaYoutube className="w-4 h-4" />,
    twitter: <FaTwitter className="w-4 h-4" />
  };

  const platformNames = {
    tiktok: "TikTok",
    instagram: "Instagram", 
    youtube: "YouTube",
    twitter: "Twitter"
  };

  const formatPayout = (rate?: number, type?: string, hybridDescription?: string, fixedDescription?: string) => {
    if (type === 'hybrid' && hybridDescription) {
      return hybridDescription;
    }
    if (type === 'fixed_rate' && fixedDescription) {
      return fixedDescription;
    }
    if (!rate) return "$0.00";
    
    const amount = `$${parseFloat(rate.toFixed(3)).toString()}`;
    
    if (type === 'fixed_rate') {
      return `${amount} Fix`;
    }
    
    return `${amount} per 1,000 Views`;
  };

  const formatPayoutForBox = (rate?: number, type?: string, hybridDescription?: string, fixedDescription?: string) => {
    if (type === 'hybrid' && hybridDescription) {
      return hybridDescription;
    }
    if (type === 'fixed_rate' && fixedDescription) {
      return fixedDescription;
    }
    const amount = rate ? `$${parseFloat(rate.toFixed(3)).toString()}` : '$0.00';
    
    if (type === 'fixed_rate') {
      return `${amount} Fix`;
    }
    
    return `${amount} / 1,000 Views`;
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'paused': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Card 
      className={`relative shadow-soft hover:shadow-elegant transition-smooth ${
        onCampaignClick ? 'cursor-pointer hover:shadow-lg' : ''
      } ${className}`}
      onClick={() => onCampaignClick?.(campaign)}
    >
      {/* Reward Box - Top Right Corner - Hide for service offerings */}
      {variant === 'creator-available' && !isServiceOffering && campaign.campaign_mode !== 'get_rewarded' && (
        <div 
          className="absolute top-3 right-3 z-10 group cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setIsRewardBoxExpanded(!isRewardBoxExpanded);
          }}
          aria-label={isRewardBoxExpanded ? "Collapse reward details" : "Expand reward details"}
          title={isRewardBoxExpanded 
            ? "Click to collapse" 
            : `Reward: ${formatPayoutForBox(campaign.payout_rate, campaign.payout_type, campaign.hybrid_reward_description, campaign.fixed_rate_description)}`
          }
        >
          <div className={`
            relative overflow-hidden rounded-lg border border-yellow-600/30 
            bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 
            dark:from-yellow-950/95 dark:via-amber-950/95 dark:to-yellow-900/90 
            shadow-[0_6px_18px_-4px_rgba(234,179,8,0.3)] 
            transition-all duration-300 ease-in-out
            hover:shadow-[0_8px_24px_-6px_rgba(234,179,8,0.5)] hover:scale-105
            ${isRewardBoxExpanded ? 'p-2' : 'p-1.5'}
          `}>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative flex items-center space-x-1.5">
              {/* Animated Pot Icon */}
              <div className={`flex-shrink-0 transition-all duration-300 ${isRewardBoxExpanded ? '' : 'animate-bounce'}`}>
                <PotIcon className={`drop-shadow-lg transition-all duration-300 ${isRewardBoxExpanded ? 'w-4 h-4' : 'w-5 h-5'}`} />
              </div>
              
              {/* Text Content - Animated */}
              <div className={`
                flex flex-col overflow-hidden transition-all duration-300 ease-in-out
                ${isRewardBoxExpanded ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'}
              `}>
                <p className="text-[8px] font-semibold uppercase tracking-wider text-yellow-700 dark:text-yellow-400/90 mb-0 whitespace-nowrap">
                  Reward
                </p>
                <p className="text-xs font-bold text-yellow-900 dark:text-yellow-200 leading-tight whitespace-nowrap">
                  {formatPayoutForBox(campaign.payout_rate, campaign.payout_type, campaign.hybrid_reward_description, campaign.fixed_rate_description)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rate Box - Top Right Corner - Show for service offerings */}
      {variant === 'creator-available' && (isServiceOffering || campaign.campaign_mode === 'get_rewarded') && (campaign.starting_rate || campaign.budget) && (
        <div 
          className="absolute top-3 right-3 z-10 group cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setIsRateBoxExpanded(!isRateBoxExpanded);
          }}
              aria-label={isRateBoxExpanded ? "Collapse service fee details" : "Expand service fee details"}
              title={isRateBoxExpanded 
                ? "Click to collapse" 
                : `Service Fee: €${campaign.starting_rate}`
              }
        >
          <div className={`
            relative overflow-hidden rounded-lg border border-blue-600/30 
            bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 
            dark:from-blue-950/95 dark:via-cyan-950/95 dark:to-blue-900/90 
            shadow-[0_6px_18px_-4px_rgba(59,130,246,0.3)] 
            transition-all duration-300 ease-in-out
            hover:shadow-[0_8px_24px_-6px_rgba(59,130,246,0.5)] hover:scale-105
            ${isRateBoxExpanded ? 'p-2' : 'p-1.5'}
          `}>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative flex items-center space-x-1.5">
              {/* Icon */}
              <div className={`flex-shrink-0 transition-all duration-300`}>
                <Euro className={`drop-shadow-lg transition-all duration-300 text-blue-700 dark:text-blue-400 ${isRateBoxExpanded ? 'w-4 h-4' : 'w-5 h-5'}`} />
              </div>
              
              {/* Text Content - Animated */}
              <div className={`
                flex flex-col overflow-hidden transition-all duration-300 ease-in-out
                ${isRateBoxExpanded ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'}
              `}>
              <p className="text-[8px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400/90 mb-0 whitespace-nowrap">
                Service Fee
              </p>
                <p className="text-xs font-bold text-blue-900 dark:text-blue-200 leading-tight whitespace-nowrap">
                  €{(campaign.starting_rate || campaign.budget)?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timer - Bottom Right Corner for Submissions */}
      {variant === 'creator-submission' && campaign.status && campaign.updated_at && (
        <div className="absolute bottom-4 right-4 z-10">
          <RunningTimer 
            startTime={campaign.updated_at} 
            status={campaign.status}
            className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md border border-primary/20"
          />
        </div>
      )}
      
      <CardContent className="p-6">
        {/* Top Section: Photo + Key Details (Horizontal Layout) */}
        <div className="flex items-start space-x-4 mb-4">
          {/* Campaign Cover Art */}
          <div className="w-20 h-20 rounded-lg flex items-center justify-center shadow-soft flex-shrink-0 relative">
            {/* Status indicator dot for active campaigns */}
            {campaign.status?.toLowerCase() === 'active' && (
              <div className="absolute top-1 left-1 z-10">
                <div className="relative">
                  {/* Pulsing ring effect */}
                  <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
                  {/* Solid dot */}
                  <div className="relative w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white shadow-lg"></div>
                </div>
              </div>
            )}
            
            {campaign.cover_art_url ? (
              <img 
                src={campaign.cover_art_url} 
                alt={campaign.song_title} 
                className="w-20 h-20 rounded-lg object-cover" 
              />
            ) : (
              <img src={vuelixLogo} alt="Vuelix" className="w-16 h-16" />
            )}
          </div>

          {/* Key Campaign Details */}
          <div className="flex-1 min-w-0">
            {/* Song Title & Play Button */}
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <h3 className="text-xl font-bold text-foreground truncate">
                  {campaign.song_title}
                </h3>
              {showPlayButton && campaign.song_url && onAudioToggle && (
                <AudioPlayer
                  audioUrl={campaign.song_url}
                  isPlaying={isPlaying}
                  onTogglePlay={() => onAudioToggle(campaign.id, campaign.song_url!)}
                  isExpanded={isAudioExpanded}
                  onToggleExpand={() => setIsAudioExpanded(!isAudioExpanded)}
                  className="flex-shrink-0"
                />
              )}
              </div>
            </div>

            {/* Artist Name */}
            <div className="text-muted-foreground text-sm mb-3">
              by{' '}
              {campaign.profiles?.username ? (
                <ClickableUsername 
                  username={campaign.profiles.username}
                  displayName={campaign.profiles.display_name}
                  showAt={false}
                  className="text-muted-foreground hover:text-primary"
                />
              ) : (
                <span>{campaign.profiles?.username || "Unknown Artist"}</span>
              )}
            </div>

            {/* Platforms & Genre */}
            <div className="flex flex-wrap gap-2 mb-4">
              {campaign.genre && (
                <Badge variant="outline" className="text-xs">{campaign.genre}</Badge>
              )}
              {campaign.campaign_badges?.map((badge, index) => (
                <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                  {badge.icon && <span>{badge.icon}</span>}
                  <span>{badge.name}</span>
                </Badge>
              ))}
              {variant === 'creator-submission' ? (
                // Show only the single platform for submissions with clickable link
                campaign.platform && (
                  <button
                    onClick={() => campaign.video_url && window.open(campaign.video_url, '_blank')}
                    className="flex items-center space-x-1 px-2 py-1 text-xs border rounded-md hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    {platformIcons[campaign.platform as keyof typeof platformIcons]}
                    <span>{platformNames[campaign.platform as keyof typeof platformNames] || campaign.platform}</span>
                    {campaign.video_url && <ExternalLink className="w-3 h-3 ml-1" />}
                  </button>
                )
              ) : (
                // Show all platforms for other variants
                campaign.platforms?.map((platform) => (
                  <Badge key={platform} variant="outline" className="flex items-center space-x-1 text-xs">
                    {platformIcons[platform as keyof typeof platformIcons]}
                    <span>{platformNames[platform as keyof typeof platformNames] || platform}</span>
                  </Badge>
                ))
              )}
            </div>

            {/* Campaign Stats - Different for each variant */}
            {variant === 'artist' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-secondary/20 rounded-lg">
                  <PotIcon className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="font-semibold text-sm">${campaign.budget?.toLocaleString() || '0'}</p>
                </div>
                <div className="text-center p-3 bg-secondary/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 mx-auto text-red-500 mb-1" />
                  <p className="text-xs text-muted-foreground">Spent</p>
                  <p className="font-semibold text-sm">${(campaign.spent || campaign.actualSpent || 0).toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-secondary/20 rounded-lg">
                  <Eye className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                  <p className="text-xs text-muted-foreground">Views</p>
                  <p className="font-semibold text-sm">{(campaign.views || campaign.totalViews || 0).toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-secondary/20 rounded-lg">
                  <Users className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                  <p className="text-xs text-muted-foreground">Creators</p>
                  <p className="font-semibold text-sm">{campaign.activeCreators || 0}</p>
                </div>
              </div>
            )}

            {(variant === 'creator-joined' || variant === 'creator-submission') && (
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Eye className="w-4 h-4 mr-1" />
                  {(campaign.current_views || campaign.views || 0).toLocaleString()}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Heart className="w-4 h-4 mr-1" />
                  {(campaign.current_likes || campaign.likes || 0).toLocaleString()}
                </div>
                <div className="font-semibold text-green-600">
                  ${(campaign.payout_amount || 0).toFixed(2)}
                </div>
                {campaign.end_date && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(campaign.end_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Engagement Pot for both creator-available and creator-joined variants */}
        {(variant === 'creator-available' || variant === 'creator-joined') && campaign.budget && campaign.campaign_mode !== 'get_rewarded' && (
          <div className="bg-secondary/30 rounded-lg px-4 py-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <PotIcon className="w-5 h-5" />
                <span className="font-semibold">Engagement Pot</span>
              </div>
              <span className="text-sm text-red-600">
                {campaign.budgetUsedPercentage?.toFixed(1) || '0.0'}% used
              </span>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(campaign.availableBudget || campaign.budget)}
                </p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatCurrency(campaign.redeemed || 0)} redeemed
                </span>
                <span className="text-muted-foreground">
                  of {formatCurrency(campaign.budget)} total
                </span>
              </div>
              
              <div className="space-y-1">
                <Progress value={campaign.budgetUsedPercentage || 0} className="h-3" />
                {(campaign.budgetUsedPercentage || 0) > 15 && (
                  <div className="text-center">
                    <span className="text-xs font-medium text-red-600">
                      {campaign.budgetUsedPercentage?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Description and Rules - Only for creator-available variant */}
        {variant === 'creator-available' && (
          <>
            <div className="bg-secondary/30 rounded-lg px-4 py-3 mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-0.5">Campaign Description</p>
              {(() => {
                const description = campaign.description || "Join this exciting campaign to promote amazing music and earn rewards for your creative content!";
                const characterLimit = 254;
                const shouldTruncate = description.length > characterLimit;
                
                return (
                  <div>
                    <p className="text-sm text-foreground leading-normal">
                      {shouldTruncate && !isDescriptionExpanded 
                        ? `${description.slice(0, characterLimit)}...` 
                        : description
                      }
                    </p>
                    {shouldTruncate && (
                      <div className="mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                          className="h-auto p-0 text-primary hover:text-primary/80"
                        >
                          {isDescriptionExpanded ? "View Less" : "View More"}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Join Campaign Button */}
          {showJoinButton && !isJoined && (
            <div className="mt-4">
              <Button
                onClick={() => onJoinCampaign?.(campaign)}
                className="w-full bg-gradient-primary text-primary-foreground hover:bg-gradient-primary/90"
              >
                {isServiceOffering || campaign.campaign_mode === 'get_rewarded' ? 'Request Service' : 'Join Campaign'}
              </Button>
            </div>
          )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CampaignCard;