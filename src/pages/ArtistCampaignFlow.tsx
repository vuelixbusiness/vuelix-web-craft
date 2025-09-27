import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CampaignCard from "@/components/ui/campaign-card";
import { 
  Upload, 
  Music, 
  Target, 
  DollarSign, 
  Eye, 
  Heart, 
  Calendar as CalendarIcon,
  PlayCircle,
  Users,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  Rocket,
  ImageIcon,
  Play
} from "lucide-react";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";
import DashboardLayout from "@/components/DashboardLayout";

interface CampaignData {
  // Step 1
  songFile?: File;
  songLink?: string;
  songTitle?: string;
  coverArtFile?: File;
  coverArtLink?: string;
  campaignType?: string;
  genre?: string;
  customGenre?: string;
  platforms: string[];
  
  // Step 2
  payoutType?: string;
  payoutRate?: number;
  vipBonus?: number;
  maxPayout?: number;
  vipMaxPayout?: number;
  instructions?: string;
  rules?: string;
  referenceLinks?: string;
  approvalRequired?: boolean;
  
  // Step 3
  endDate?: Date;
  budget?: number; // Net budget after 5% platform fee deduction
  totalInvestment?: number; // Total amount artist pays (before fee)
}

const DEFAULT_CAMPAIGN_RULES = `• Post on the required platforms listed in the campaign.
• Include the provided hashtags and mentions.
• Keep your submission public for the full campaign duration.
• Submit only original content that follows platform and Vuelix guidelines.`;

const ArtistCampaignFlow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    platforms: [],
    rules: DEFAULT_CAMPAIGN_RULES
  });
  const [isConnectingSong, setIsConnectingSong] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const songFileInputRef = useRef<HTMLInputElement>(null);
  const coverArtFileInputRef = useRef<HTMLInputElement>(null);
  
  // Object URL management to prevent memory leaks
  const [songObjectUrl, setSongObjectUrl] = useState<string | null>(null);
  const [coverArtObjectUrl, setCoverArtObjectUrl] = useState<string | null>(null);

  // Memoized object URLs to prevent re-creation on every render
  const memoizedCoverArtUrl = useMemo(() => {
    return coverArtObjectUrl || campaignData.coverArtLink;
  }, [coverArtObjectUrl, campaignData.coverArtLink]);

  const memoizedSongUrl = useMemo(() => {
    return songObjectUrl || campaignData.songLink;
  }, [songObjectUrl, campaignData.songLink]);

  // Transform campaignData to Campaign interface for CampaignCard
  const transformToCampaign = useCallback(() => {

    return {
      id: 'preview-campaign',
      song_title: campaignData.songTitle || 'Song Title',
      title: `${campaignData.songTitle || 'Song Title'} Campaign`,
      cover_art_url: memoizedCoverArtUrl,
      song_url: memoizedSongUrl,
      genre: campaignData.genre,
      platforms: campaignData.platforms,
      payout_rate: campaignData.payoutRate,
      payout_type: campaignData.payoutType,
      budget: campaignData.budget || 0,
      status: 'active',
      description: campaignData.instructions,
      rules: campaignData.rules,
      profiles: { display_name: 'Your Artist Name' },
      budgetUsedPercentage: 0,
      availableBudget: campaignData.budget || 0,
      redeemed: 0,
      views: 0,
      likes: 0,
      activeCreators: 0
    };
  }, [campaignData, memoizedCoverArtUrl, memoizedSongUrl]);

  const handleSongFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Song file must be under 50MB",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    // Cleanup old object URL if exists
    if (songObjectUrl) {
      URL.revokeObjectURL(songObjectUrl);
    }
    
    // Create new object URL
    const newObjectUrl = URL.createObjectURL(file);
    setSongObjectUrl(newObjectUrl);
    
    // Use single state update to prevent re-render loop
    setCampaignData(prev => ({
      ...prev,
      songFile: file,
      songTitle: file.name.replace(/\.[^/.]+$/, ""),
      songLink: undefined // Clear song link when file is uploaded
    }));
    
    setIsUploading(false);
    
    // Reset file input to allow re-uploading same file
    if (event.target) {
      event.target.value = '';
    }
  }, [toast]);

  const handleCoverArtUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Cover art must be under 10MB",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    // Cleanup old object URL if exists
    if (coverArtObjectUrl) {
      URL.revokeObjectURL(coverArtObjectUrl);
    }
    
    // Create new object URL
    const newObjectUrl = URL.createObjectURL(file);
    setCoverArtObjectUrl(newObjectUrl);
    
    setCampaignData(prev => ({
      ...prev,
      coverArtFile: file,
      coverArtLink: undefined // Clear cover art link when file is uploaded
    }));
    
    setIsUploading(false);
    
    // Reset file input to allow re-uploading same file
    if (event.target) {
      event.target.value = '';
    }
  }, [toast, coverArtObjectUrl]);

  const handleApplyCoverArtLink = async () => {
    if (!campaignData.coverArtLink) return;
    
    try {
      // Validate if it's a valid image URL
      const response = await fetch(campaignData.coverArtLink, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.startsWith('image/')) {
        alert('Please provide a valid image URL');
        return;
      }
      
      // Create a temporary image file from the URL for preview
      const imageResponse = await fetch(campaignData.coverArtLink);
      const blob = await imageResponse.blob();
      const file = new File([blob], 'cover-art.jpg', { type: blob.type });
      
      updateCampaignData('coverArtFile', file);
      
    } catch (error) {
      console.error('Failed to load image:', error);
      alert('Failed to load image. Please check the URL and try again.');
    }
  };

  const toggleAudioPreview = (campaignId?: string, songUrl?: string) => {
    // Use provided songUrl from CampaignCard or fallback to memoized URLs
    const audioSrc = songUrl || memoizedSongUrl;

    if (!audioSrc) return;

    if (!audioRef.current) {
      // Create audio element
      const audio = new Audio(audioSrc);
      audioRef.current = audio;
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlayingPreview(false);
      });
    } else if (audioRef.current.src !== audioSrc) {
      // Update audio source if different
      audioRef.current.src = audioSrc;
    }

    if (isPlayingPreview) {
      audioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlayingPreview(true))
        .catch(() => {
          toast({ 
            title: "Error", 
            description: "Failed to play audio", 
            variant: "destructive" 
          });
        });
    }
  };

  const handleConnectSongLink = async () => {
    if (!campaignData.songLink) return;
    
    setIsConnectingSong(true);
    
    try {
      // Simulate connecting to the song service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Extract song title from URL if possible
      const url = new URL(campaignData.songLink);
      const pathSegments = url.pathname.split('/');
      const songTitle = pathSegments[pathSegments.length - 1] || 'Unknown Song';
      
      updateCampaignData('songTitle', songTitle.replace(/-/g, ' '));
      
    } catch (error) {
      console.error('Failed to connect song:', error);
    } finally {
      setIsConnectingSong(false);
    }
  };

  const isValidSongLink = (link: string) => {
    if (!link) return false;
    try {
      const url = new URL(link);
      return url.hostname.includes('soundcloud.com') || 
             url.hostname.includes('spotify.com') ||
             url.hostname.includes('youtube.com');
    } catch {
      return false;
    }
  };

  const genres = [
    "Hip Hop", "Pop", "R&B", "Rock", "Electronic", "Country", 
    "Jazz", "Reggae", "Latin", "Indie", "Folk", "Classical", "Custom"
  ];

  const platforms = [
    { id: "tiktok", name: "TikTok", icon: <FaTiktok className="w-6 h-6" /> },
    { id: "instagram", name: "Instagram", icon: <FaInstagram className="w-6 h-6" /> },
    { id: "youtube", name: "YouTube", icon: <FaYoutube className="w-6 h-6" /> }
  ];

  // Utility functions for platform fee calculation
  const calculatePlatformFee = (totalInvestment: number) => {
    return totalInvestment * 0.05;
  };

  const calculateNetBudget = (totalInvestment: number) => {
    return totalInvestment - calculatePlatformFee(totalInvestment);
  };

  const updateCampaignData = useCallback((field: keyof CampaignData, value: any) => {
    setCampaignData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Optimized file input trigger functions using refs
  const triggerSongFileInput = useCallback(() => {
    if (isUploading) return; // Prevent multiple clicks during upload
    songFileInputRef.current?.click();
  }, [isUploading]);

  const triggerCoverArtInput = useCallback(() => {
    if (isUploading) return; // Prevent multiple clicks during upload
    coverArtFileInputRef.current?.click();
  }, [isUploading]);

  // Handle budget input with automatic fee calculation
  const handleBudgetChange = (totalInvestment: number) => {
    const netBudget = calculateNetBudget(totalInvestment);
    setCampaignData(prev => ({ 
      ...prev, 
      budget: netBudget,
      totalInvestment: totalInvestment
    }));
  };

  const togglePlatform = (platformId: string) => {
    setCampaignData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId) 
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const canContinue = (step: number) => {
    // Temporarily disabled validation - allows progression through all steps except step 3 terms
    if (step === 3) {
      return termsAccepted;
    }
    return true;
    
    /* Original validation logic - commented out for now
    switch (step) {
      case 1:
        return (campaignData.songFile || campaignData.songLink) && 
               campaignData.campaignType && 
               campaignData.genre && 
               campaignData.platforms.length > 0;
      case 2:
        return campaignData.payoutType && 
               campaignData.payoutRate && 
               campaignData.instructions;
      case 3:
        return campaignData.endDate && campaignData.budget;
      default:
        return false;
    }
    */
  };

  const handleLaunchCampaign = async () => {
    console.log('🚀 Launch Campaign button clicked!', { user, campaignData });
    
    if (!user) {
      console.log('❌ No user found');
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a campaign",
        variant: "destructive"
      });
      return;
    }

    // Basic validation
    if (!campaignData.songTitle || !campaignData.platforms.length || !campaignData.payoutType || !campaignData.budget) {
      console.log('❌ Validation failed - missing fields:', {
        songTitle: campaignData.songTitle,
        platforms: campaignData.platforms,
        payoutType: campaignData.payoutType,
        budget: campaignData.budget
      });
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before launching",
        variant: "destructive"
      });
      return;
    }

    console.log('✅ Starting campaign launch process...');
    setIsLaunching(true);

    try {
      // Prepare campaign data for database
      const campaignToInsert = {
        title: campaignData.songTitle,
        song_title: campaignData.songTitle,
        song_url: campaignData.songLink || null,
        cover_art_url: campaignData.coverArtLink || null,
        genre: campaignData.genre === 'Custom' ? campaignData.customGenre : campaignData.genre,
        campaign_type: campaignData.campaignType,
        platforms: campaignData.platforms,
        payout_type: campaignData.payoutType,
        payout_rate: campaignData.payoutRate,
        max_payout: campaignData.maxPayout || null,
        vip_bonus: campaignData.vipBonus || 0,
        vip_max_payout: campaignData.vipMaxPayout || null,
        instructions: campaignData.instructions || null,
        rules: campaignData.rules || null,
        reference_links: campaignData.referenceLinks || null,
        approval_required: campaignData.approvalRequired || false,
        budget: campaignData.budget,
        end_date: campaignData.endDate?.toISOString() || null,
        artist_id: user.id,
        status: 'active'
      };

      console.log('📤 Inserting campaign data:', campaignToInsert);

      const { data, error } = await supabase
        .from('campaigns')
        .insert(campaignToInsert)
        .select()
        .single();

      if (error) {
        console.error('❌ Campaign creation error:', error);
        toast({
          title: "Campaign Creation Failed",
          description: error.message || "There was an error creating your campaign",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Campaign created successfully!', data);
      
      toast({
        title: "🎉 Campaign Launched Successfully!",
        description: "Your campaign is now live and creators can start participating"
      });

      // Navigate to artist dashboard after a brief delay
      setTimeout(() => {
        console.log('📍 Navigating to artist dashboard...');
        navigate('/artist-dashboard');
      }, 1500);

    } catch (error) {
      console.error('❌ Unexpected error during campaign creation:', error);
      toast({
        title: "Campaign Launch Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      console.log('🔄 Setting isLaunching to false');
      setIsLaunching(false);
    }
  };

  // Cleanup object URLs on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (songObjectUrl) {
        URL.revokeObjectURL(songObjectUrl);
      }
      if (coverArtObjectUrl) {
        URL.revokeObjectURL(coverArtObjectUrl);
      }
    };
  }, [songObjectUrl, coverArtObjectUrl]);

  // Clear object URLs when switching from file to link
  useEffect(() => {
    if (campaignData.songLink && songObjectUrl) {
      URL.revokeObjectURL(songObjectUrl);
      setSongObjectUrl(null);
    }
  }, [campaignData.songLink, songObjectUrl]);

  useEffect(() => {
    if (campaignData.coverArtLink && coverArtObjectUrl) {
      URL.revokeObjectURL(coverArtObjectUrl);
      setCoverArtObjectUrl(null);
    }
  }, [campaignData.coverArtLink, coverArtObjectUrl]);

  return (
    <DashboardLayout>
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => window.history.back()}
                  className="hover:bg-secondary"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-3xl font-bold text-foreground">Launch Your Campaign</h1>
              </div>
              <div className="text-sm text-muted-foreground">
                Step {currentStep} of 3
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="flex space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`flex-1 h-2 rounded-full transition-smooth ${
                    step <= currentStep ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
              ))}
            </div>
            
            {/* Step Labels */}
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Choose Song</span>
              <span>Set Rewards</span>
              <span>Launch</span>
            </div>
          </div>

          {/* Step 1: Choose a Song */}
          {currentStep === 1 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Music className="w-5 h-5 text-primary" />
                  <span>Choose Your Song</span>
                </CardTitle>
                <CardDescription>
                  Upload your track and set the campaign parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Song Upload */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Upload Song</Label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-smooth ${
                    campaignData.songFile ? 'border-primary bg-primary/5' : 'border-border'
                  }`}>
                    <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="text-base font-medium mb-2">Upload Music File</h3>
                    {campaignData.songFile ? (
                      <div className="mb-3">
                        <p className="text-primary font-medium text-sm mb-1">
                          Selected: {campaignData.songFile.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {(campaignData.songFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground mb-3 text-sm">
                        Drag & drop your audio file or browse to upload
                      </p>
                    )}
                    <input
                      ref={songFileInputRef}
                      type="file"
                      accept="audio/*,.mp3,.wav,.flac"
                      onChange={handleSongFileUpload}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mb-3"
                      onClick={triggerSongFileInput}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        campaignData.songFile ? 'Change File' : 'Choose File'
                      )}
                    </Button>
                    <div className="text-xs text-muted-foreground mb-3">
                      Supported: MP3, WAV, FLAC (Max 50MB)
                    </div>
                    
                    <div className="relative my-3">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Input 
                        placeholder="Paste SoundCloud or Spotify link"
                        value={campaignData.songLink || ''}
                        onChange={(e) => updateCampaignData('songLink', e.target.value)}
                      />
                      
                      {campaignData.songLink && isValidSongLink(campaignData.songLink) && (
                        <Button 
                          variant="default"
                          size="sm"
                          onClick={handleConnectSongLink}
                          disabled={isConnectingSong}
                          className="w-full"
                        >
                          {isConnectingSong ? (
                            <>
                              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                              Connecting Song...
                            </>
                          ) : (
                            <>
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Connect Song to Campaign
                            </>
                          )}
                        </Button>
                      )}
                      
                      {campaignData.songLink && !isValidSongLink(campaignData.songLink) && (
                        <div className="text-xs text-destructive text-center">
                          Please enter a valid SoundCloud, Spotify, or YouTube link
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Song Title */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Song Title</Label>
                  <Input 
                    placeholder="Enter your song title"
                    value={campaignData.songTitle || ''}
                    onChange={(e) => updateCampaignData('songTitle', e.target.value)}
                  />
                </div>

                {/* Cover Art Upload */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Upload Cover Art</Label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-smooth ${
                    campaignData.coverArtFile ? 'border-primary bg-primary/5' : 'border-border'
                  }`}>
                    {campaignData.coverArtFile ? (
                      <div className="mb-4">
                        <img 
                          src={URL.createObjectURL(campaignData.coverArtFile)} 
                          alt="Cover preview" 
                          className="w-20 h-20 object-cover rounded-lg mx-auto mb-2"
                        />
                        <p className="text-primary font-medium text-sm">
                          {campaignData.coverArtFile.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {(campaignData.coverArtFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-base font-medium mb-2">Upload Cover Art</h3>
                        <p className="text-muted-foreground mb-4">
                          Add album artwork or campaign image
                        </p>
                      </>
                    )}
                    <input
                      ref={coverArtFileInputRef}
                      type="file"
                      accept="image/*,.jpg,.jpeg,.png,.webp"
                      onChange={handleCoverArtUpload}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mb-4"
                      onClick={triggerCoverArtInput}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        campaignData.coverArtFile ? 'Change Image' : 'Choose Image'
                      )}
                    </Button>
                    <div className="text-xs text-muted-foreground mb-4">
                      Supported: JPG, PNG, WEBP (Max 10MB)
                    </div>
                    
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Paste image link"
                        value={campaignData.coverArtLink || ''}
                        onChange={(e) => updateCampaignData('coverArtLink', e.target.value)}
                        className="flex-1"
                      />
                      {campaignData.coverArtLink && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleApplyCoverArtLink}
                          className="px-4"
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Campaign Type */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Campaign Type</Label>
                  <Select 
                    value={campaignData.campaignType} 
                    onValueChange={(value) => updateCampaignData('campaignType', value)}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select campaign type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border z-50">
                      <SelectItem value="clipping">Clipping - Use song in content</SelectItem>
                      <SelectItem value="duet">Duet - Create response videos</SelectItem>
                      <SelectItem value="reaction">Reaction - React to your content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Genre Selector */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Genre</Label>
                  <Select 
                    value={campaignData.genre} 
                    onValueChange={(value) => updateCampaignData('genre', value)}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border z-50 max-h-60">
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre.toLowerCase()}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Custom Genre Input */}
                  {campaignData.genre === 'custom' && (
                    <Input 
                      placeholder="Enter custom genre"
                      value={campaignData.customGenre || ''}
                      onChange={(e) => updateCampaignData('customGenre', e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>

                {/* Platform Toggles */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Target Platforms</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {platforms.map((platform) => (
                      <Card 
                        key={platform.id}
                        className={`cursor-pointer transition-smooth border-2 ${
                          campaignData.platforms.includes(platform.id) 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => togglePlatform(platform.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="mb-2 flex justify-center text-primary">{platform.icon}</div>
                          <div className="font-medium">{platform.name}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  disabled={!canContinue(1)}
                  onClick={() => setCurrentStep(2)}
                >
                  Continue to Rewards
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Set Rewards & Guidelines */}
          {currentStep === 2 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span>Set Rewards & Creator Guidelines</span>
                </CardTitle>
                <CardDescription>
                  Define how creators will be compensated and what you expect from them
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payout Type */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Payout Type</Label>
                  <Select 
                    value={campaignData.payoutType} 
                    onValueChange={(value) => updateCampaignData('payoutType', value)}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Choose payout method" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border z-50">
                      <SelectItem value="per-view">
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4" />
                          <span>Per View - Pay based on video views</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="per-like">
                        <div className="flex items-center space-x-2">
                          <Heart className="w-4 h-4" />
                          <span>Per Like - Pay based on likes received</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="flat-rate">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4" />
                          <span>Flat Rate - Fixed payment per submission</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payout Rate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">
                      {campaignData.payoutType === 'flat-rate' ? 'Flat Rate ($)' : 'Payout Rate per 1k Views'}
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="number"
                        placeholder="0.00"
                        className="pl-10"
                        value={campaignData.payoutRate || ''}
                        onChange={(e) => updateCampaignData('payoutRate', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-base font-medium">VIP Creator Payout Rate ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="number"
                        placeholder="0.00"
                        className="pl-10"
                        value={campaignData.vipBonus || ''}
                        onChange={(e) => updateCampaignData('vipBonus', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* MAX Payout Totals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">MAX Payout Total ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="number"
                        placeholder="0.00"
                        className="pl-10"
                        value={campaignData.maxPayout || ''}
                        onChange={(e) => updateCampaignData('maxPayout', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-base font-medium">VIP MAX Payout Total ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="number"
                        placeholder="0.00"
                        className="pl-10"
                        value={campaignData.vipMaxPayout || ''}
                        onChange={(e) => updateCampaignData('vipMaxPayout', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* Creator Instructions */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Creator Instructions</Label>
                  <Textarea 
                    placeholder="Provide clear instructions for creators. Include any specific requirements, hashtags to use, or creative direction..."
                    className="min-h-[120px]"
                    value={campaignData.instructions || ''}
                    onChange={(e) => updateCampaignData('instructions', e.target.value)}
                  />
                </div>

                {/* Campaign Rules */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Campaign Rules</Label>
                  <Textarea 
                    placeholder="Set clear rules for participation. Examples: Must include song title in caption, Must use specified hashtags, No explicit content, Must be original content..."
                    className="min-h-[120px]"
                    value={campaignData.rules || ''}
                    onChange={(e) => updateCampaignData('rules', e.target.value)}
                  />
                </div>

                {/* Reference Links */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Reference Links (Optional)</Label>
                  <Textarea 
                    placeholder="Add links to example videos, mood boards, or other reference materials..."
                    className="min-h-[80px]"
                    value={campaignData.referenceLinks || ''}
                    onChange={(e) => updateCampaignData('referenceLinks', e.target.value)}
                  />
                </div>

                {/* Approval Required */}
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="approval"
                    checked={campaignData.approvalRequired || false}
                    onCheckedChange={(checked) => updateCampaignData('approvalRequired', checked)}
                  />
                  <Label htmlFor="approval" className="text-base font-medium">
                    Require approval before content goes live
                  </Label>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setCurrentStep(1)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    className="flex-1" 
                    disabled={!canContinue(2)}
                    onClick={() => setCurrentStep(3)}
                  >
                    Continue to Preview
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Preview & Launch */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Campaign Preview */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PlayCircle className="w-5 h-5 text-primary" />
                    <span>Campaign Preview</span>
                  </CardTitle>
                  <CardDescription>
                    This is how your campaign will appear to creators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground bg-secondary/20 rounded-lg p-3 border border-primary/20">
                      <strong className="text-primary">Preview Mode:</strong> This shows exactly how your campaign will appear to creators.
                    </div>
                    
                    <CampaignCard
                      campaign={transformToCampaign()}
                      variant="creator-available"
                      showJoinButton={false}
                      showPlayButton={true}
                      onAudioToggle={toggleAudioPreview}
                      isPlaying={isPlayingPreview}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Settings */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Rocket className="w-5 h-5 text-primary" />
                    <span>Final Campaign Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* End Date */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Campaign End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !campaignData.endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {campaignData.endDate ? format(campaignData.endDate, "PPP") : "Pick end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background border-border z-50" align="start">
                        <Calendar
                          mode="single"
                          selected={campaignData.endDate}
                          onSelect={(date) => updateCampaignData('endDate', date)}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Budget */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Total Investment ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="number"
                        placeholder="0.00"
                        className="pl-10"
                        value={(campaignData as any).totalInvestment || ''}
                        onChange={(e) => handleBudgetChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This includes the 5% Vuelix platform fee
                    </p>
                  </div>

                  {/* Budget Summary */}
                  {(campaignData as any).totalInvestment && campaignData.payoutRate && (
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Budget Breakdown</h4>
                        <div className="text-sm space-y-1 text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Total Investment:</span>
                            <span className="font-medium">{formatCurrency((campaignData as any).totalInvestment || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platform Fee (5%):</span>
                            <span className="font-medium text-destructive">-{formatCurrency(calculatePlatformFee((campaignData as any).totalInvestment || 0))}</span>
                          </div>
                          <div className="border-t pt-1 mt-2 flex justify-between font-medium">
                            <span>Available to Creators:</span>
                            <span className="text-primary">{formatCurrency(campaignData.budget || 0)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Terms Acceptance */}
                  <div className="space-y-4 p-4 bg-secondary/20 rounded-lg border border-primary/20">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms-accepted"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="terms-accepted"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          I confirm that I have the rights to all media I upload and agree to the{" "}
                          <Link
                            to="/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline hover:text-primary/80"
                          >
                            Vuelix Terms of Service
                          </Link>
                          .
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setCurrentStep(2)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      variant="hero" 
                      className="flex-1" 
                      disabled={!canContinue(3) || isLaunching}
                      onClick={handleLaunchCampaign}
                    >
                      {isLaunching ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                          Launching Campaign...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 mr-2" />
                          Launch Campaign
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ArtistCampaignFlow;