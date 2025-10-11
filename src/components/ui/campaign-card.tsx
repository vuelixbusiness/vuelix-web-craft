import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import RunningTimer from "@/components/RunningTimer";
import { ClickableUsername } from "@/components/ui/clickable-username";
import { 
  Play, 
  Pause, 
  Eye, 
  Heart, 
  TrendingUp,
  ExternalLink,
  Music,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Crown,
  Target,
  Copy,
  ChevronDown,
  ChevronUp,
  Calendar
} from "lucide-react";
import PotIcon from "@/components/ui/pot-icon";
import { FaTiktok, FaInstagram, FaYoutube, FaTwitter } from "react-icons/fa";
import vuelixLogo from "@/assets/vuelix-logo-official.png";
import { formatDistanceToNow } from "date-fns";

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
  instructions?: string;
  reference_links?: string;
  campaign_type?: string;
  approval_required?: boolean;
  vip_bonus?: number;
  vip_max_payout?: number;
  max_payout?: number;
  created_at?: string;
  profiles?: {
    display_name?: string;
    username?: string;
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
  isJoined?: boolean;
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
  onJoinCampaign,
  onCampaignClick,
  onAudioToggle,
  isPlaying = false,
  className = ""
}: CampaignCardProps) => {
  const { toast } = useToast();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isInstructionsExpanded, setIsInstructionsExpanded] = useState(false);
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

  const campaignTypeColors = {
    clipping: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-700 dark:text-purple-300',
    promotion: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300',
    review: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-700 dark:text-green-300',
    default: 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 border-gray-500/30 text-gray-700 dark:text-gray-300'
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30';
      case 'paused': return 'bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30';
      case 'live': return 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30';
      case 'submitted': return 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30';
      case 'approved': return 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    });
  };

  const referenceLinksArray = campaign.reference_links 
    ? campaign.reference_links.split(',').map(link => link.trim()).filter(Boolean)
    : [];

  const truncateText = (text: string, limit: number) => {
    if (text.length <= limit) return text;
    return text.slice(0, limit) + '...';
  };

  return (
    <Card 
      className={`relative shadow-soft hover:shadow-elegant transition-smooth overflow-hidden border-border/50 ${
        onCampaignClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={() => onCampaignClick?.(campaign)}
    >
      {/* Premium gradient overlay on top */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-primary" />
      
      <CardContent className="p-6">
        {/* Header: Badges Row */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Campaign Type Badge */}
            {campaign.campaign_type && (
              <Badge 
                variant="outline" 
                className={`${campaignTypeColors[campaign.campaign_type as keyof typeof campaignTypeColors] || campaignTypeColors.default} font-semibold`}
              >
                <Target className="w-3 h-3 mr-1" />
                {campaign.campaign_type.charAt(0).toUpperCase() + campaign.campaign_type.slice(1)}
              </Badge>
            )}
            
            {/* Status Badge */}
            {campaign.status && (
              <Badge variant="outline" className={getStatusColor(campaign.status)}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </Badge>
            )}
            
            {/* Approval Required Badge */}
            {campaign.approval_required && variant === 'creator-available' && (
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30">
                <AlertCircle className="w-3 h-3 mr-1" />
                Approval Required
              </Badge>
            )}
            
            {/* VIP Bonus Badge */}
            {campaign.vip_bonus && campaign.vip_bonus > 0 && (
              <Badge 
                variant="outline" 
                className="bg-gradient-to-r from-yellow-400/30 to-amber-500/30 border-yellow-500/50 text-yellow-900 dark:text-yellow-100 font-bold"
              >
                <Crown className="w-3 h-3 mr-1" />
                VIP +{campaign.vip_bonus}%
              </Badge>
            )}
          </div>
          
          {/* Timer for Submissions */}
          {variant === 'creator-submission' && campaign.status && campaign.updated_at && (
            <RunningTimer 
              startTime={campaign.updated_at} 
              status={campaign.status}
              className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md border border-primary/20"
            />
          )}
        </div>

        {/* Main Content: Cover Art + Details */}
        <div className="flex items-start gap-4 mb-4">
          {/* Cover Art with Play Button Overlay */}
          <div className="relative w-24 h-24 rounded-lg flex-shrink-0 overflow-hidden shadow-soft group">
            {campaign.cover_art_url ? (
              <img 
                src={campaign.cover_art_url} 
                alt={campaign.song_title} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-secondary flex items-center justify-center">
                <img src={vuelixLogo} alt="Vuelix" className="w-16 h-16 opacity-80" />
              </div>
            )}
            
            {/* Play Button Overlay */}
            {showPlayButton && campaign.song_url && onAudioToggle && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAudioToggle(campaign.id, campaign.song_url!);
                  }}
                  className="w-10 h-10 p-0 rounded-full"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </Button>
              </div>
            )}
            
            {/* Music Icon Badge */}
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-md bg-gradient-primary flex items-center justify-center shadow-md">
              <Music className="w-3 h-3 text-primary-foreground" />
            </div>
          </div>

          {/* Campaign Info */}
          <div className="flex-1 min-w-0">
            {/* Campaign Title (if different from song) */}
            {campaign.title && campaign.title !== campaign.song_title && (
              <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1">
                {campaign.title}
              </h3>
            )}
            
            {/* Song Title */}
            <h4 className="text-xl font-bold text-foreground mb-1 line-clamp-1">
              {campaign.song_title}
            </h4>

            {/* Artist Name */}
            <div className="text-sm text-muted-foreground mb-3">
              by{' '}
              {campaign.profiles?.username ? (
                <ClickableUsername 
                  username={campaign.profiles.username}
                  displayName={campaign.profiles.display_name}
                  showAt={false}
                  className="text-muted-foreground hover:text-primary font-medium"
                />
              ) : (
                <span className="font-medium">{campaign.profiles?.display_name || "Unknown Artist"}</span>
              )}
            </div>

            {/* Platforms & Genre Tags */}
            <div className="flex flex-wrap gap-2">
              {campaign.genre && (
                <Badge variant="secondary" className="text-xs font-medium">
                  {campaign.genre}
                </Badge>
              )}
              
              {variant === 'creator-submission' && campaign.platform ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    campaign.video_url && window.open(campaign.video_url, '_blank');
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs border rounded-md hover:bg-secondary/80 transition-colors"
                >
                  {platformIcons[campaign.platform as keyof typeof platformIcons]}
                  <span className="font-medium">{platformNames[campaign.platform as keyof typeof platformNames] || campaign.platform}</span>
                  {campaign.video_url && <ExternalLink className="w-3 h-3" />}
                </button>
              ) : (
                campaign.platforms?.map((platform) => (
                  <Badge key={platform} variant="secondary" className="flex items-center gap-1.5 text-xs font-medium">
                    {platformIcons[platform as keyof typeof platformIcons]}
                    <span>{platformNames[platform as keyof typeof platformNames] || platform}</span>
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Payout Information Box - Prominent for creator-available */}
        {variant === 'creator-available' && (
          <div className="bg-gradient-to-br from-yellow-50/80 via-amber-50/60 to-yellow-100/80 dark:from-yellow-950/40 dark:via-amber-950/30 dark:to-yellow-900/30 border border-yellow-400/30 rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700 dark:text-yellow-400">
                    Payout Rate
                  </p>
                  <p className="text-lg font-bold text-yellow-900 dark:text-yellow-200">
                    ${campaign.payout_rate?.toFixed(3) || '0.000'} / 1K Views
                  </p>
                </div>
              </div>
              
              {campaign.max_payout && (
                <div className="text-right">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">Max Payout</p>
                  <p className="text-sm font-bold text-yellow-900 dark:text-yellow-200">
                    ${campaign.max_payout}
                  </p>
                </div>
              )}
            </div>
            
            {campaign.vip_max_payout && campaign.vip_max_payout > (campaign.max_payout || 0) && (
              <div className="flex items-center gap-2 text-xs">
                <Crown className="w-4 h-4 text-yellow-700 dark:text-yellow-400" />
                <span className="text-yellow-800 dark:text-yellow-300 font-medium">
                  VIP Members can earn up to ${campaign.vip_max_payout}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Stats Grid - Different for each variant */}
        {variant === 'artist' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border border-green-200 dark:border-green-800/30 rounded-lg p-3 text-center">
              <PotIcon className="w-5 h-5 mx-auto mb-1 text-green-600 dark:text-green-400" />
              <p className="text-xs text-green-700 dark:text-green-400 font-medium">Budget</p>
              <p className="font-bold text-sm text-green-900 dark:text-green-200">${campaign.budget?.toLocaleString() || '0'}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20 border border-red-200 dark:border-red-800/30 rounded-lg p-3 text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-1 text-red-600 dark:text-red-400" />
              <p className="text-xs text-red-700 dark:text-red-400 font-medium">Spent</p>
              <p className="font-bold text-sm text-red-900 dark:text-red-200">${(campaign.spent || campaign.actualSpent || 0).toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3 text-center">
              <Eye className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Views</p>
              <p className="font-bold text-sm text-blue-900 dark:text-blue-200">{(campaign.views || campaign.totalViews || 0).toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/20 border border-purple-200 dark:border-purple-800/30 rounded-lg p-3 text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
              <p className="text-xs text-purple-700 dark:text-purple-400 font-medium">Creators</p>
              <p className="font-bold text-sm text-purple-900 dark:text-purple-200">{campaign.activeCreators || 0}</p>
            </div>
          </div>
        )}

        {/* Performance Stats for Joined/Submission */}
        {(variant === 'creator-joined' || variant === 'creator-submission') && (
          <div className="bg-gradient-secondary rounded-lg p-4 mb-4 border border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-stat-blue" />
                  <span className="text-sm font-medium">{(campaign.current_views || campaign.views || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-stat-purple" />
                  <span className="text-sm font-medium">{(campaign.current_likes || campaign.likes || 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Earnings</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  ${(campaign.payout_amount || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Budget Engagement Pot */}
        {(variant === 'creator-available' || variant === 'creator-joined') && campaign.budget && (
          <div className="bg-gradient-to-br from-secondary/50 to-secondary/30 border border-border/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PotIcon className="w-5 h-5" />
                <span className="font-semibold text-foreground">Engagement Pot</span>
              </div>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {campaign.budgetUsedPercentage?.toFixed(1) || '0.0'}% used
              </span>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(campaign.availableBudget || campaign.budget)}
                </p>
                <p className="text-xs text-muted-foreground">Available to earn</p>
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{formatCurrency(campaign.redeemed || 0)} claimed</span>
                <span>of {formatCurrency(campaign.budget)} total</span>
              </div>
              
              <Progress value={campaign.budgetUsedPercentage || 0} className="h-2" />
            </div>
          </div>
        )}

        {/* Instructions Section - Creator Available */}
        {variant === 'creator-available' && campaign.instructions && (
          <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-200">Campaign Instructions</h4>
              </div>
              {campaign.instructions.length > 200 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsInstructionsExpanded(!isInstructionsExpanded);
                  }}
                  className="h-auto p-1"
                >
                  {isInstructionsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              )}
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
              {isInstructionsExpanded || campaign.instructions.length <= 200
                ? campaign.instructions
                : truncateText(campaign.instructions, 200)}
            </p>
          </div>
        )}

        {/* Reference Links Section */}
        {variant === 'creator-available' && referenceLinksArray.length > 0 && (
          <div className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-200">Reference Links</h4>
            </div>
            <div className="space-y-2">
              {referenceLinksArray.map((link, index) => (
                <div key={index} className="flex items-center gap-2 group">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 hover:underline flex-1 truncate"
                  >
                    {link}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(link);
                    }}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description Section */}
        {variant === 'creator-available' && campaign.description && (
          <div className="bg-secondary/30 border border-border/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-muted-foreground">Campaign Description</p>
              {campaign.description.length > 250 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDescriptionExpanded(!isDescriptionExpanded);
                  }}
                  className="h-auto p-1"
                >
                  {isDescriptionExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              )}
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {isDescriptionExpanded || campaign.description.length <= 250
                ? campaign.description
                : truncateText(campaign.description, 250)}
            </p>
          </div>
        )}

        {/* Rules Section */}
        {variant === 'creator-available' && campaign.rules && (
          <div className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-800/30 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <h4 className="font-semibold text-sm text-orange-900 dark:text-orange-200">Campaign Rules</h4>
              </div>
              {campaign.rules.length > 200 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRulesExpanded(!isRulesExpanded);
                  }}
                  className="h-auto p-1"
                >
                  {isRulesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              )}
            </div>
            <p className="text-sm text-orange-800 dark:text-orange-300 leading-relaxed">
              {isRulesExpanded || campaign.rules.length <= 200
                ? campaign.rules
                : truncateText(campaign.rules, 200)}
            </p>
          </div>
        )}

        {/* Timeline Section */}
        {(campaign.created_at || campaign.end_date) && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            {campaign.created_at && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Started {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}</span>
              </div>
            )}
            {campaign.end_date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Ends {new Date(campaign.end_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Join Campaign Button */}
        {variant === 'creator-available' && showJoinButton && !isJoined && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onJoinCampaign?.(campaign);
            }}
            className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity font-semibold shadow-elegant"
          >
            Join Campaign
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CampaignCard;