import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Video, 
  ExternalLink, 
  Clock, 
  Eye, 
  Heart,
  Upload,
  CheckCircle
} from "lucide-react";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";
import MediaAssetsSection from "./MediaAssetsSection";
import AudioAssetsSection from "./AudioAssetsSection";

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  song_url?: string;
  cover_art_url?: string;
  payout_type: string;
  payout_rate: number;
  platforms: string[];
  instructions: string;
}

interface MediaAsset {
  id: string;
  url: string;
  type: string;
  created_at: string;
}

interface VideoSubmissionProps {
  campaign: Campaign;
  onSubmissionComplete: () => void;
}

const VideoSubmission = ({ campaign, onSubmissionComplete }: VideoSubmissionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);

  useEffect(() => {
    const fetchMediaAssets = async () => {
      try {
        const { data, error } = await supabase
          .from('media_assets')
          .select('*')
          .eq('campaign_id', campaign.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMediaAssets(data || []);
      } catch (error) {
        console.error('Error fetching media assets:', error);
      } finally {
        setIsLoadingAssets(false);
      }
    };

    fetchMediaAssets();
  }, [campaign.id]);

  const platformIcons = {
    tiktok: <FaTiktok className="w-4 h-4" />,
    instagram: <FaInstagram className="w-4 h-4" />,
    youtube: <FaYoutube className="w-4 h-4" />
  };

  const platformNames = {
    tiktok: "TikTok",
    instagram: "Instagram",
    youtube: "YouTube"
  };

  const isValidUrl = (url: string, platform: string): boolean => {
    if (!url) return false;
    
    try {
      const urlObj = new URL(url);
      
      switch (platform) {
        case 'tiktok':
          return urlObj.hostname.includes('tiktok.com');
        case 'instagram':
          return urlObj.hostname.includes('instagram.com');
        case 'youtube':
          return urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be');
        default:
          return false;
      }
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !videoUrl || !selectedPlatform) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUrl(videoUrl, selectedPlatform)) {
      toast({
        title: "Invalid URL",
        description: `Please enter a valid ${platformNames[selectedPlatform as keyof typeof platformNames]} URL`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('campaign_participations')
        .insert({
          campaign_id: campaign.id,
          creator_id: user.id,
          video_url: videoUrl,
          platform: selectedPlatform
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already Submitted",
            description: "You have already submitted this video for this campaign",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Video Submitted!",
        description: "Your video has been submitted for review. View tracking will begin once approved.",
      });

      setVideoUrl("");
      setSelectedPlatform("");
      onSubmissionComplete();

    } catch (error) {
      console.error('Error submitting video:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Video className="w-5 h-5 text-primary" />
          <span>Submit Your Video</span>
        </CardTitle>
        <CardDescription>
          Submit your content for "{campaign.song_title}" and start earning from views
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Media Assets Section */}
          <MediaAssetsSection 
            campaign={campaign}
            mediaAssets={mediaAssets}
            isLoading={isLoadingAssets}
          />

          {/* Audio Assets Section */}
          <AudioAssetsSection 
            campaign={campaign}
            audioAssets={mediaAssets.filter(asset => asset.type === 'audio')}
            isLoading={isLoadingAssets}
          />

          {/* Campaign Info */}
          <div className="p-4 bg-secondary/20 rounded-lg">
            <h3 className="font-medium mb-2">{campaign.title}</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {campaign.platforms.map((platform) => (
                <Badge key={platform} variant="outline" className="flex items-center space-x-1">
                  {platformIcons[platform as keyof typeof platformIcons]}
                  <span>{platformNames[platform as keyof typeof platformNames]}</span>
                </Badge>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center space-x-2 mb-1">
                <Eye className="w-4 h-4" />
                <span>
                  Earn ${campaign.payout_rate} per {campaign.payout_type.replace('per_', '')}
                </span>
              </div>
            </div>
            {campaign.instructions && (
              <div className="mt-3 p-3 bg-background rounded border">
                <p className="text-sm">{campaign.instructions}</p>
              </div>
            )}
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {campaign.platforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      <div className="flex items-center space-x-2">
                        {platformIcons[platform as keyof typeof platformIcons]}
                        <span>{platformNames[platform as keyof typeof platformNames]}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="videoUrl"
                  type="url"
                  placeholder={`Paste your ${selectedPlatform ? platformNames[selectedPlatform as keyof typeof platformNames] : 'video'} URL here`}
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  disabled={!videoUrl || !selectedPlatform || !isValidUrl(videoUrl, selectedPlatform)}
                  onClick={() => window.open(videoUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
              {videoUrl && selectedPlatform && !isValidUrl(videoUrl, selectedPlatform) && (
                <p className="text-sm text-destructive">
                  Please enter a valid {platformNames[selectedPlatform as keyof typeof platformNames]} URL
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !videoUrl || !selectedPlatform || !isValidUrl(videoUrl, selectedPlatform)}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Video
                </>
              )}
            </Button>
          </form>

          {/* Info */}
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Videos are reviewed within 24 hours</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>View tracking starts automatically after approval</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoSubmission;