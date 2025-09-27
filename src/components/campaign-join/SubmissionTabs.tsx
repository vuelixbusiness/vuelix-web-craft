import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  ExternalLink, 
  Calendar, 
  Eye,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";

interface Campaign {
  id: string;
  platforms: string[];
}

interface Participation {
  id: string;
  video_url: string;
  platform: string;
  status: string;
  created_at: string;
  current_views: number;
  current_likes: number;
  payout_claimed: boolean;
  payout_amount: number;
}

interface SubmissionTabsProps {
  campaign: Campaign;
  onSubmissionComplete: () => void;
}

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

const statusIcons = {
  pending: <Clock className="w-4 h-4 text-yellow-600" />,
  approved: <CheckCircle className="w-4 h-4 text-green-600" />,
  live: <Eye className="w-4 h-4 text-blue-600" />,
  rejected: <AlertCircle className="w-4 h-4 text-red-600" />
};

export default function SubmissionTabs({ campaign, onSubmissionComplete }: SubmissionTabsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchParticipations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('campaign_participations')
        .select('*')
        .eq('campaign_id', campaign.id)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParticipations(data || []);
    } catch (error) {
      console.error('Error fetching participations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipations();
  }, [campaign.id, user?.id]);

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

    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the Terms & Conditions to continue",
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
        if (error.code === '23505') {
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
        description: "Your video has been submitted for review.",
      });

      setVideoUrl("");
      setSelectedPlatform("");
      setTermsAccepted(false);
      await fetchParticipations();
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

  const updateViews = async (participationId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('track-video-views', {
        body: { participationId, forceUpdate: true }
      });

      if (error) throw error;

      toast({
        title: "Views Updated",
        description: `Found ${data.stats?.views || 0} views`,
      });

      await fetchParticipations();
    } catch (error) {
      console.error('Error updating views:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update view count",
        variant: "destructive",
      });
    }
  };

  return (
    <Tabs defaultValue="new" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="new">New Submission</TabsTrigger>
        <TabsTrigger value="history">
          Submission History 
          {participations.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {participations.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="new" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Submit Your Content
            </CardTitle>
          </CardHeader>
          <CardContent>
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

              {/* Terms & Conditions Section */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="terms" className="text-sm leading-none">
                      I agree to the Terms & Conditions and Campaign Rules
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      By submitting, you agree to follow all campaign guidelines and platform rules.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !videoUrl || !selectedPlatform || !isValidUrl(videoUrl, selectedPlatform) || !termsAccepted}
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
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Your Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-muted-foreground">Loading submissions...</p>
              </div>
            ) : participations.length === 0 ? (
              <div className="text-center py-8">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No submissions yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participations.map((participation) => (
                    <TableRow key={participation.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {platformIcons[participation.platform as keyof typeof platformIcons]}
                          <span>{platformNames[participation.platform as keyof typeof platformNames]}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {statusIcons[participation.status as keyof typeof statusIcons]}
                          <Badge variant={
                            participation.status === 'approved' || participation.status === 'live' ? 'default' :
                            participation.status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {participation.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-blue-500" />
                          <span>{participation.current_views.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(participation.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(participation.video_url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          {(participation.status === 'approved' || participation.status === 'live') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateViews(participation.id)}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}