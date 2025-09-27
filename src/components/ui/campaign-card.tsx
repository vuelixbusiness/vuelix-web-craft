import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import RunningTimer from "@/components/RunningTimer";
import { 
  Play, 
  Pause, 
  Eye, 
  Heart, 
  DollarSign, 
  TrendingUp, 
  PlayCircle,
  Calendar,
  Target,
  Users,
  CheckSquare,
  ExternalLink
} from "lucide-react";
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
  } | null;
  actualSpent?: number;
  totalViews?: number;
  totalLikes?: number;
  activeCreators?: number;
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
  onJoinCampaign?: (campaign: Campaign) => void;
  onAudioToggle?: (campaignId: string, songUrl: string) => void;
  isPlaying?: boolean;
  className?: string;
}

const CampaignCard = ({ 
  campaign, 
  variant = 'creator-available',
  showJoinButton = false,
  showPlayButton = true,
  onJoinCampaign,
  onAudioToggle,
  isPlaying = false,
  className = ""
}: CampaignCardProps) => {
  const { toast } = useToast();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);
  
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

  const formatPayout = (rate?: number, type?: string) => {
    if (!rate) return "$0.00";
    return `$${parseFloat(rate.toFixed(3)).toString()}${type ? ` per ${type.replace('per_', '')}` : ''}`;
  };

  const formatPayoutForBox = (rate?: number, type?: string) => {
    const amount = rate ? `$${parseFloat(rate.toFixed(3)).toString()}` : '$0.00';
    return `${amount} / 1K Views`;
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
    <Card className={`relative shadow-soft hover:shadow-elegant transition-smooth ${className}`}>
      {/* Payout Rate Box - Top Right Corner */}
      {variant === 'creator-available' && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3 py-2 rounded-xl shadow-lg">
            <p className="text-xs font-medium opacity-90">Payout Rate</p>
            <p className="text-sm font-bold">
              {formatPayoutForBox(campaign.payout_rate, campaign.payout_type)}
            </p>
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
          <div className="w-20 h-20 rounded-lg flex items-center justify-center shadow-soft flex-shrink-0">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAudioToggle(campaign.id, campaign.song_url!)}
                    className="w-8 h-8 p-0 flex-shrink-0"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
              
              {campaign.status && (
                <Badge variant="outline" className={getStatusColor(campaign.status)}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </Badge>
              )}
            </div>

            {/* Artist Name */}
            <p className="text-muted-foreground text-sm mb-3">
              by {campaign.profiles?.display_name || campaign.title || "Unknown Artist"}
            </p>

            {/* Platforms & Genre */}
            <div className="flex flex-wrap gap-2 mb-4">
              {campaign.genre && (
                <Badge variant="outline" className="text-xs">{campaign.genre}</Badge>
              )}
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
                  <DollarSign className="w-5 h-5 mx-auto text-green-500 mb-1" />
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

        {/* Engagement Pot for creator-available variant */}
        {variant === 'creator-available' && campaign.budget && (
          <div className="bg-secondary/30 rounded-lg px-4 py-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="font-semibold">Engagement Pot</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {campaign.budgetUsedPercentage?.toFixed(1) || '0.0'}% used
              </span>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-primary">
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
                    <span className="text-xs font-medium">
                      {campaign.budgetUsedPercentage?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Engagement Pot for creator-joined variant */}
        {variant === 'creator-joined' && (
          <div className="bg-secondary/30 rounded-lg px-4 py-4 mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="font-semibold">Campaign Budget</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(campaign.budget || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Budget</p>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Campaign funding available
                </span>
                <span className="text-green-600 font-medium">
                  Active
                </span>
              </div>
              
              <div className="space-y-1">
                <Progress value={75} className="h-3" />
                <div className="text-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    Budget actively funding creators
                  </span>
                </div>
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

          {/* Campaign Rules */}
          <div className="bg-secondary/20 rounded-lg px-4 py-3 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckSquare className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium text-foreground">Campaign Rules</p>
            </div>
            <div>
              {(() => {
                const defaultRules = [
                  "Use the provided song in your content",
                  "Include relevant hashtags and mentions", 
                  "Follow platform community guidelines",
                  "Submit high-quality, original content",
                  "Track and report your video metrics"
                ];
                
                let rules = defaultRules;
                
                // Use campaign rules if available, otherwise use default rules
                if (campaign.rules && campaign.rules.trim()) {
                  rules = campaign.rules.split('\n')
                    .map(rule => rule.replace(/^[•\-\*]\s*/, '').trim())
                    .filter(rule => rule.length > 0);
                }
                
                const shouldTruncate = rules.length > 3;
                const displayRules = shouldTruncate && !isRulesExpanded ? rules.slice(0, 3) : rules;
                
                return (
                  <div>
                    <ul className="text-sm text-muted-foreground space-y-1 list-none">
                      {displayRules.map((rule, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-primary font-bold text-xs mt-0.5">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                      {shouldTruncate && !isRulesExpanded && (
                        <li className="flex items-start space-x-2 text-muted-foreground/60">
                          <span className="text-primary font-bold text-xs mt-0.5">•</span>
                          <span>And {rules.length - 3} more rules...</span>
                        </li>
                      )}
                    </ul>
                    <div className="mt-4 flex items-center justify-between">
                      {shouldTruncate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsRulesExpanded(!isRulesExpanded)}
                          className="h-auto p-0 text-primary hover:text-primary/80"
                        >
                          {isRulesExpanded ? "View Less" : "View All Rules"}
                        </Button>
                      )}
                      {showJoinButton && (
                        <Button 
                          onClick={() => onJoinCampaign?.(campaign)} 
                          className="ml-auto bg-gradient-primary hover:bg-gradient-primary/90"
                        >
                          Join Campaign
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CampaignCard;