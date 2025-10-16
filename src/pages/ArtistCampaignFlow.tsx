import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { z } from "zod";
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
import { campaignSchema } from "@/lib/validation";
import { CAMPAIGN_TYPES } from "@/config/campaignTypes";
import { CAMPAIGN_FORM_CONFIGS, CampaignFormConfig } from "@/config/campaignFormConfig";
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
  Play,
  Zap
} from "lucide-react";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";
import DashboardLayout from "@/components/DashboardLayout";

interface CampaignData {
  // Campaign Mode
  campaignMode?: 'reward_others' | 'get_rewarded';
  
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
  hybridRewardDescription?: string;
  fixedRateDescription?: string;
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
  const [currentStep, setCurrentStep] = useState(-1); // Start at step -1 for campaign mode selection
  const [campaignMode, setCampaignMode] = useState<'reward_others' | 'get_rewarded' | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    platforms: [],
    rules: DEFAULT_CAMPAIGN_RULES
  });
  const [formConfig, setFormConfig] = useState<CampaignFormConfig | null>(null);
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
      hybrid_reward_description: campaignData.hybridRewardDescription,
      fixed_rate_description: campaignData.fixedRateDescription,
      budget: campaignData.budget || 0,
      description: campaignData.instructions,
      rules: campaignData.rules,
      profiles: { display_name: user?.name || 'Unknown Artist' },
      budgetUsedPercentage: 0,
      availableBudget: campaignData.budget || 0,
      redeemed: 0,
      views: 0,
      likes: 0,
      activeCreators: 0
    };
  }, [campaignData, memoizedCoverArtUrl, memoizedSongUrl, user]);

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

    console.log('toggleAudioPreview called:', { audioSrc, songUrl, memoizedSongUrl });

    if (!audioSrc) {
      toast({ 
        title: "No audio available", 
        description: "Please upload or link a song first", 
        variant: "destructive" 
      });
      return;
    }

    if (!audioRef.current) {
      // Create audio element
      const audio = new Audio();
      audioRef.current = audio;
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlayingPreview(false);
      });

      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        toast({ 
          title: "Audio Error", 
          description: "Failed to load audio file. Please check the file format.", 
          variant: "destructive" 
        });
        setIsPlayingPreview(false);
      });
    }

    // Always update the source
    if (audioRef.current.src !== audioSrc) {
      audioRef.current.src = audioSrc;
      audioRef.current.load(); // Force reload
    }

    if (isPlayingPreview) {
      audioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioRef.current.play()
        .then(() => {
          console.log('Audio playing successfully');
          setIsPlayingPreview(true);
        })
        .catch((error) => {
          console.error('Play error:', error);
          toast({ 
            title: "Playback Error", 
            description: error.message || "Failed to play audio", 
            variant: "destructive" 
          });
          setIsPlayingPreview(false);
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

  const handleModeSelect = (mode: 'reward_others' | 'get_rewarded') => {
    setCampaignMode(mode);
    setCurrentStep(0); // Proceed to campaign type selection
  };

  const handleCampaignTypeSelect = (typeId: string) => {
    const config = CAMPAIGN_FORM_CONFIGS[typeId];
    setFormConfig(config);
    updateCampaignData('campaignType', typeId);
    setCurrentStep(1); // Move to next step
  };

  const canContinue = (step: number) => {
    if (step === -1) {
      return campaignMode !== null;
    }
    if (step === 0) {
      return campaignData.campaignType !== undefined;
    }
    if (step === 3) {
      return termsAccepted;
    }
    return true;
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

    console.log('✅ Starting campaign launch process...');
    setIsLaunching(true);

    try {
      // Validate campaign data using zod schema
      const validatedData = campaignSchema.parse({
        songTitle: campaignData.songTitle?.trim(),
        artistName: user.id, // Use user ID as placeholder since we store artist_id
        genre: campaignData.genre === 'Custom' ? campaignData.customGenre : campaignData.genre,
        campaignType: campaignData.campaignType,
        platforms: campaignData.platforms,
        payoutType: campaignData.payoutType,
        budget: campaignData.budget,
        payoutRate: campaignData.payoutRate,
        maxPayout: campaignData.maxPayout || null,
        vipBonus: campaignData.vipBonus || null,
        vipMaxPayout: campaignData.vipMaxPayout || null,
        hybridRewardDescription: campaignData.hybridRewardDescription || null,
        fixedRateDescription: campaignData.fixedRateDescription || null,
        songLink: campaignData.songLink || null,
        instructions: campaignData.instructions || null,
        rules: campaignData.rules || null,
        referenceLinks: campaignData.referenceLinks || null,
        approvalRequired: campaignData.approvalRequired || false,
        endDate: campaignData.endDate || null
      });

      try {
        console.log('🚀 Starting campaign creation process...');
        
        // Step 1: Create campaign first to get campaign ID
        const campaignToInsert = {
          title: validatedData.songTitle,
          song_title: validatedData.songTitle,
          song_url: validatedData.songLink || null,
          cover_art_url: campaignData.coverArtLink || null,
          genre: validatedData.genre,
          campaign_type: validatedData.campaignType,
          platforms: validatedData.platforms,
          payout_type: validatedData.payoutType,
          payout_rate: 
            validatedData.payoutType === 'hybrid' || validatedData.payoutType === 'fixed_rate' 
              ? null 
              : validatedData.payoutRate,
          max_payout: validatedData.maxPayout,
          vip_bonus: validatedData.vipBonus || 0,
          vip_max_payout: validatedData.vipMaxPayout,
          hybrid_reward_description: validatedData.hybridRewardDescription || null,
          fixed_rate_description: validatedData.fixedRateDescription || null,
          instructions: validatedData.instructions,
          rules: validatedData.rules,
          reference_links: validatedData.referenceLinks,
          approval_required: validatedData.approvalRequired,
          budget: validatedData.budget,
          end_date: validatedData.endDate?.toISOString() || null,
          artist_id: user.id,
          status: 'active',
          campaign_mode: campaignMode || 'reward_others'
        };

        console.log('📤 Creating campaign record...');

        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .insert(campaignToInsert)
          .select()
          .single();

        if (campaignError) {
          console.error('❌ Campaign creation error:', campaignError);
          toast({
            title: "Campaign Creation Failed",
            description: campaignError.message || "There was an error creating your campaign",
            variant: "destructive"
          });
          return;
        }

        console.log('✅ Campaign created with ID:', campaign.id);

        // Step 2: Upload files using campaign ID as folder name
        let coverArtUrl: string | null = campaign.cover_art_url;
        let songUrl: string | null = campaign.song_url;
        let hasUpdates = false;

        // Upload cover art file if it exists
        if (campaignData.coverArtFile) {
          console.log('📤 Uploading cover art file...');
          const fileExt = campaignData.coverArtFile.name.split('.').pop();
          const fileName = `${campaign.id}/cover-art-${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('campaign-cover-art')
            .upload(fileName, campaignData.coverArtFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('❌ Cover art upload error:', uploadError);
            toast({
              title: "Warning",
              description: `Campaign created but cover art upload failed: ${uploadError.message}`,
              variant: "destructive"
            });
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('campaign-cover-art')
              .getPublicUrl(fileName);

            coverArtUrl = publicUrl;
            hasUpdates = true;
            console.log('✅ Cover art uploaded:', publicUrl);
          }
        }

        // Upload song file if it exists
        if (campaignData.songFile) {
          console.log('📤 Uploading song file...');
          const fileExt = campaignData.songFile.name.split('.').pop();
          const fileName = `${campaign.id}/song-${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('campaign-audio')
            .upload(fileName, campaignData.songFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('❌ Song upload error:', uploadError);
            toast({
              title: "Warning",
              description: `Campaign created but song upload failed: ${uploadError.message}`,
              variant: "destructive"
            });
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('campaign-audio')
              .getPublicUrl(fileName);

            songUrl = publicUrl;
            hasUpdates = true;
            console.log('✅ Song uploaded:', publicUrl);
          }
        }

        // Step 3: Update campaign with file URLs if we uploaded anything
        if (hasUpdates) {
          console.log('📤 Updating campaign with file URLs...');
          const { error: updateError } = await supabase
            .from('campaigns')
            .update({
              cover_art_url: coverArtUrl,
              song_url: songUrl
            })
            .eq('id', campaign.id);

          if (updateError) {
            console.error('❌ Campaign update error:', updateError);
            toast({
              title: "Warning",
              description: "Campaign created but failed to update with file URLs",
              variant: "destructive"
            });
          }
        }

        console.log('✅ Campaign launched successfully!', campaign);
      } catch (error: any) {
        console.error('❌ Unexpected error during campaign creation:', error);
        toast({
          title: "Campaign Launch Failed",
          description: error?.message || "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
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
      
      // Handle validation errors from zod
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        const fieldName = firstError.path.join('.');
        toast({
          title: "Validation Error",
          description: `${fieldName}: ${firstError.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Campaign Launch Failed",
          description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      }
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
                Step {currentStep === -1 ? '1' : currentStep === 0 ? '2' : currentStep + 2} of 4
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="flex space-x-2">
              {currentStep === -1 ? (
                <>
                  <div className="flex-1 h-2 rounded-full bg-primary" />
                  <div className="flex-1 h-2 rounded-full bg-secondary" />
                  <div className="flex-1 h-2 rounded-full bg-secondary" />
                  <div className="flex-1 h-2 rounded-full bg-secondary" />
                </>
              ) : currentStep === 0 ? (
                <>
                  <div className="flex-1 h-2 rounded-full bg-primary" />
                  <div className="flex-1 h-2 rounded-full bg-primary" />
                  <div className="flex-1 h-2 rounded-full bg-secondary" />
                  <div className="flex-1 h-2 rounded-full bg-secondary" />
                </>
              ) : (
                [1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 h-2 rounded-full transition-smooth ${
                      step <= currentStep + 2 ? 'bg-primary' : 'bg-secondary'
                    }`}
                  />
                ))
              )}
            </div>
            
            {/* Step Labels */}
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              {currentStep === -1 ? (
                <>
                  <span className="flex-1 text-center">Mode</span>
                  <span className="flex-1 text-center text-muted-foreground/50">Type</span>
                  <span className="flex-1 text-center text-muted-foreground/50">Setup</span>
                  <span className="flex-1 text-center text-muted-foreground/50">Launch</span>
                </>
              ) : currentStep === 0 ? (
                <>
                  <span className="flex-1 text-center">Mode</span>
                  <span className="flex-1 text-center">Type</span>
                  <span className="flex-1 text-center text-muted-foreground/50">Setup</span>
                  <span className="flex-1 text-center text-muted-foreground/50">Launch</span>
                </>
              ) : (
                <>
                  <span>Mode</span>
                  <span>Type</span>
                  <span>{formConfig?.step1.title || 'Setup'}</span>
                  <span>Launch</span>
                </>
              )}
            </div>
          </div>

          {/* Step -1: Campaign Mode Selection */}
          {currentStep === -1 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-6 h-6 text-primary" />
                  <span>What do you want to do?</span>
                </CardTitle>
                <CardDescription>
                  Choose whether you're offering a service or seeking help from others.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Option 1: Reward Others */}
                  <button
                    onClick={() => handleModeSelect('reward_others')}
                    className="group relative p-8 border-3 rounded-xl text-left transition-all hover:border-primary hover:shadow-2xl hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-primary bg-gradient-to-br from-background to-secondary/20"
                  >
                    <div className="text-6xl mb-4">💰</div>
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                      Reward People for Their Service
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      You have a budget and want others to help promote your work, create content, 
                      collaborate, or provide services. You'll set up an engagement pot and reward 
                      participants based on their performance.
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-green-500">✓</span>
                        <span>Set engagement budget</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-green-500">✓</span>
                        <span>Define reward rules</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-green-500">✓</span>
                        <span>Track participant performance</span>
                      </div>
                    </div>
                    
                    <Badge variant="default" className="text-xs">Most Popular</Badge>
                  </button>

                  {/* Option 2: Get Rewarded */}
                  <button
                    onClick={() => handleModeSelect('get_rewarded')}
                    className="group relative p-8 border-3 rounded-xl text-left transition-all hover:border-primary hover:shadow-2xl hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-primary bg-gradient-to-br from-background to-primary/10"
                  >
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                      Get Rewarded for Providing a Service
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      Showcase your skills and services to attract clients and opportunities. 
                      Display your portfolio, set your pricing, and let others book or hire you 
                      for your expertise.
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-green-500">✓</span>
                        <span>Showcase portfolio</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-green-500">✓</span>
                        <span>Set service pricing</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-green-500">✓</span>
                        <span>Receive booking requests</span>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="text-xs">Service Provider</Badge>
                  </button>

                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 0: Campaign Type Selection */}
          {currentStep === 0 && (
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-primary" />
                      <span>Choose Your Campaign Type</span>
                    </CardTitle>
                    <CardDescription>
                      {campaignMode === 'reward_others' 
                        ? 'Select what you need help with or want to promote'
                        : 'Select the type of service you provide'
                      }
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCurrentStep(-1);
                      setCampaignMode(null);
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Change Mode
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Show campaign types based on selected mode */}
                  {campaignMode === 'reward_others' && (
                    <>
                  {/* 1. Song / Content Promotion */}
                  <button
                    onClick={() => handleCampaignTypeSelect('song_content_promotion')}
                    className="group relative p-6 border-2 rounded-lg text-left transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <div className="text-4xl mb-3">🎵</div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      Song / Content Promotion
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Promote a new single, album, or visual content.
                    </p>
                    <div className="text-xs text-primary font-medium mb-2">
                      Goal: reach, engagement, conversions
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Artists</Badge>
                      <Badge variant="secondary" className="text-xs">Creators</Badge>
                      <Badge variant="secondary" className="text-xs">DJs</Badge>
                      <Badge variant="secondary" className="text-xs">Collectives</Badge>
                    </div>
                  </button>

                  {/* 2. Collaboration Campaign */}
                  <button
                    onClick={() => handleCampaignTypeSelect('collaboration_campaign')}
                    className="group relative p-6 border-2 rounded-lg text-left transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <div className="text-4xl mb-3">🤝</div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      Collaboration Campaign
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Find and fund partnerships with other artists, producers, or creators.
                    </p>
                    <div className="text-xs text-primary font-medium mb-2">
                      Goal: connect, co-create, share royalties
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Artists</Badge>
                      <Badge variant="secondary" className="text-xs">Producers</Badge>
                      <Badge variant="secondary" className="text-xs">Visual Creatives</Badge>
                      <Badge variant="secondary" className="text-xs">Collectives</Badge>
                    </div>
                  </button>

                  {/* 3. Visual Production */}
                  <button
                    onClick={() => handleCampaignTypeSelect('visual_production')}
                    className="group relative p-6 border-2 rounded-lg text-left transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <div className="text-4xl mb-3">🎬</div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      Visual Production
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Commission cover art, lyric videos, short films, photo shoots, etc.
                    </p>
                    <div className="text-xs text-primary font-medium mb-2">
                      Goal: connect with visual creatives
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Artists</Badge>
                      <Badge variant="secondary" className="text-xs">Producers</Badge>
                      <Badge variant="secondary" className="text-xs">Visual Creatives</Badge>
                      <Badge variant="secondary" className="text-xs">Studios</Badge>
                    </div>
                  </button>

                  {/* 4. Brand Partnership */}
                  <button
                    onClick={() => handleCampaignTypeSelect('brand_partnership')}
                    className="group relative p-6 border-2 rounded-lg text-left transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <div className="text-4xl mb-3">🏢</div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      Brand Partnership
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Launch co-branded content, sponsored challenges, or influencer campaigns.
                    </p>
                    <div className="text-xs text-primary font-medium mb-2">
                      Goal: merge influence with brand exposure
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Brands</Badge>
                      <Badge variant="secondary" className="text-xs">Artists</Badge>
                      <Badge variant="secondary" className="text-xs">Creators</Badge>
                      <Badge variant="secondary" className="text-xs">Festivals</Badge>
                    </div>
                  </button>

                  {/* 5. Community Campaign */}
                  <button
                    onClick={() => handleCampaignTypeSelect('community_campaign')}
                    className="group relative p-6 border-2 rounded-lg text-left transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <div className="text-4xl mb-3">👥</div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      Community Campaign
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Build awareness, host group challenges, or empower social causes.
                    </p>
                    <div className="text-xs text-primary font-medium mb-2">
                      Goal: engagement, social impact, growth
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Collectives</Badge>
                      <Badge variant="secondary" className="text-xs">Community Leaders</Badge>
                      <Badge variant="secondary" className="text-xs">Creators</Badge>
                      <Badge variant="secondary" className="text-xs">Brands</Badge>
                    </div>
                  </button>

                  {/* 6. Performance / Live Event */}
                  <button
                    onClick={() => handleCampaignTypeSelect('performance_live_event')}
                    className="group relative p-6 border-2 rounded-lg text-left transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <div className="text-4xl mb-3">🎤</div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      Performance / Live Event
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Promote concerts, DJ sets, live streams, or virtual events.
                    </p>
                    <div className="text-xs text-primary font-medium mb-2">
                      Goal: ticket sales, attendance, reach
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Artists</Badge>
                      <Badge variant="secondary" className="text-xs">DJs</Badge>
                      <Badge variant="secondary" className="text-xs">Festivals</Badge>
                      <Badge variant="secondary" className="text-xs">Studios</Badge>
                    </div>
                  </button>
                    </>
                  )}

                  {/* Service Offering Mode - Get Rewarded */}
                  {campaignMode === 'get_rewarded' && (
                    <>
                      {/* 1. Music Production Services */}
                      <button
                        onClick={() => handleCampaignTypeSelect('song_content_promotion')}
                        className="group relative p-6 border-2 rounded-lg text-left transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <div className="text-4xl mb-3">🎵</div>
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                          Music Production Services
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Offer beat making, mixing, mastering, or full production services.
                        </p>
                        <div className="text-xs text-primary font-medium mb-2">
                          Goal: attract artists, showcase work, get hired
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">Producers</Badge>
                          <Badge variant="secondary" className="text-xs">Beat Makers</Badge>
                          <Badge variant="secondary" className="text-xs">Audio Engineers</Badge>
                          <Badge variant="secondary" className="text-xs">Studios</Badge>
                        </div>
                      </button>

                      {/* 2. Collaboration Services */}
                      <button
                        onClick={() => handleCampaignTypeSelect('collaboration_campaign')}
                        className="group relative p-6 border-2 rounded-lg text-left transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <div className="text-4xl mb-3">🤝</div>
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                          Collaboration Services
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Partner with artists, producers, or brands on joint projects.
                        </p>
                        <div className="text-xs text-primary font-medium mb-2">
                          Goal: find partnerships, co-create, split revenue
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">Artists</Badge>
                          <Badge variant="secondary" className="text-xs">Producers</Badge>
                          <Badge variant="secondary" className="text-xs">Songwriters</Badge>
                          <Badge variant="secondary" className="text-xs">Visual Creatives</Badge>
                        </div>
                      </button>

                      {/* 3. Visual Production Services */}
                      <button
                        onClick={() => handleCampaignTypeSelect('visual_production')}
                        className="group relative p-6 border-2 rounded-lg text-left transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <div className="text-4xl mb-3">🎬</div>
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                          Visual Production Services
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Provide music videos, photography, cover art, or visual content creation.
                        </p>
                        <div className="text-xs text-primary font-medium mb-2">
                          Goal: showcase portfolio, attract clients, accept bookings
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">Visual Creatives</Badge>
                          <Badge variant="secondary" className="text-xs">Photographers</Badge>
                          <Badge variant="secondary" className="text-xs">Videographers</Badge>
                          <Badge variant="secondary" className="text-xs">Studios</Badge>
                        </div>
                      </button>

                      {/* 4. Brand Collaboration Services */}
                      <button
                        onClick={() => handleCampaignTypeSelect('brand_partnership')}
                        className="group relative p-6 border-2 rounded-lg text-left transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <div className="text-4xl mb-3">🏢</div>
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                          Brand Collaboration Services
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Offer influencer services, sponsored content, or brand ambassador opportunities.
                        </p>
                        <div className="text-xs text-primary font-medium mb-2">
                          Goal: partner with brands, sponsored opportunities
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">Influencers</Badge>
                          <Badge variant="secondary" className="text-xs">Artists</Badge>
                          <Badge variant="secondary" className="text-xs">Creators</Badge>
                          <Badge variant="secondary" className="text-xs">Content Creators</Badge>
                        </div>
                      </button>

                      {/* 5. Community Management Services */}
                      <button
                        onClick={() => handleCampaignTypeSelect('community_campaign')}
                        className="group relative p-6 border-2 rounded-lg text-left transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <div className="text-4xl mb-3">👥</div>
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                          Community Management Services
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Provide social media management, community building, or fan engagement services.
                        </p>
                        <div className="text-xs text-primary font-medium mb-2">
                          Goal: manage communities, grow audiences, engagement
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">Social Media Managers</Badge>
                          <Badge variant="secondary" className="text-xs">Community Leaders</Badge>
                          <Badge variant="secondary" className="text-xs">Strategists</Badge>
                        </div>
                      </button>

                      {/* 6. Performance Services */}
                      <button
                        onClick={() => handleCampaignTypeSelect('performance_live_event')}
                        className="group relative p-6 border-2 rounded-lg text-left transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <div className="text-4xl mb-3">🎤</div>
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                          Performance Services
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Offer live performances, DJ sets, hosting, or event entertainment.
                        </p>
                        <div className="text-xs text-primary font-medium mb-2">
                          Goal: book gigs, showcase talent, event opportunities
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">Artists</Badge>
                          <Badge variant="secondary" className="text-xs">DJs</Badge>
                          <Badge variant="secondary" className="text-xs">Performers</Badge>
                          <Badge variant="secondary" className="text-xs">Entertainers</Badge>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Campaign Assets */}
          {currentStep === 1 && formConfig && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Music className="w-5 h-5 text-primary" />
                  <span>{formConfig.step1.title}</span>
                </CardTitle>
                <CardDescription>
                  {formConfig.step1.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Asset Upload */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">{formConfig.step1.assetUploadLabel}</Label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-smooth ${
                    campaignData.songFile ? 'border-primary bg-primary/5' : 'border-border'
                  }`}>
                    <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="text-base font-medium mb-2">{formConfig.step1.assetUploadLabel}</h3>
                    <p className="text-muted-foreground mb-3 text-sm">{formConfig.step1.assetUploadDescription}</p>
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
                    
              {/* Only show link input for Song/Content Promotion campaigns */}
              {campaignData.campaignType === 'song_content_promotion' && (
                <>
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
                </>
              )}
                  </div>
                </div>

                {/* Asset Title */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">{formConfig.step1.assetTitleLabel}</Label>
                  <Input 
                    placeholder={formConfig.step1.assetTitlePlaceholder}
                    value={campaignData.songTitle || ''}
                    onChange={(e) => updateCampaignData('songTitle', e.target.value)}
                  />
                </div>

                {/* Cover Art Upload */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">{formConfig.step1.coverArtLabel}</Label>
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
                        <h3 className="text-base font-medium mb-2">{formConfig.step1.coverArtLabel}</h3>
                        <p className="text-muted-foreground mb-4">
                          {formConfig.step1.coverArtDescription}
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

                {/* Genre/Category Selector */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">{formConfig.step1.genreLabel}</Label>
                  <Select 
                    value={campaignData.genre} 
                    onValueChange={(value) => updateCampaignData('genre', value)}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder={`Select ${formConfig.step1.genreLabel.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border z-50 max-h-60">
                      {formConfig.step1.genres.map((genre) => (
                        <SelectItem key={genre} value={genre.toLowerCase()}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Custom Genre Input */}
                  {campaignData.genre === 'custom' && (
                    <Input 
                      placeholder={`Enter custom ${formConfig.step1.genreLabel.toLowerCase()}`}
                      value={campaignData.customGenre || ''}
                      onChange={(e) => updateCampaignData('customGenre', e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>

                {/* Platform Toggles */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">{formConfig.step1.platformsLabel}</Label>
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
                  {campaignData.campaignType === 'visual_services_offering' 
                    ? 'Continue to Service Details' 
                    : 'Continue to Rewards'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Set Rewards & Guidelines */}
          {currentStep === 2 && formConfig && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span>{formConfig.step2.title}</span>
                </CardTitle>
                <CardDescription>
                  {formConfig.step2.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Reward Type - Hide for visual_services_offering */}
                {campaignData.campaignType !== 'visual_services_offering' && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Reward Type</Label>
                    <Select 
                      value={campaignData.payoutType} 
                      onValueChange={(value) => updateCampaignData('payoutType', value)}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Choose Reward" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border z-50">
                        <SelectItem value="performance_based">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4" />
                            <span>Performance Based - Rewards based on metrics</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fixed_rate">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" />
                            <span>Fixed Rate - Set payment amount</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="hybrid">
                          <div className="flex items-center space-x-2">
                            <Zap className="w-4 h-4" />
                            <span>Hybrid - Combination of both</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Reward Rate Section - Conditional based on payoutType - Hide for visual_services_offering */}
                {campaignData.campaignType !== 'visual_services_offering' && (
                  <>
                    {campaignData.payoutType === 'hybrid' ? (
                  // HYBRID: Free-text custom reward structure
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Hybrid Reward Structure</Label>
                    <Textarea 
                      placeholder="Describe your hybrid reward structure. Example: $100 base payment + $0.50 per 1k views + $500 bonus at 1M views"
                      className="min-h-[120px]"
                      value={campaignData.hybridRewardDescription || ''}
                      onChange={(e) => updateCampaignData('hybridRewardDescription', e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Explain how creators will be compensated with your custom hybrid model combining fixed payments, performance metrics, and bonuses.
                    </p>
                  </div>
                ) : campaignData.payoutType === 'fixed_rate' ? (
                  // FIXED RATE: Free-text custom fixed payment
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Fixed Rate Payment</Label>
                    <Textarea 
                      placeholder="Describe your fixed payment offer. Example: $50 per approved video submission"
                      className="min-h-[120px]"
                      value={campaignData.fixedRateDescription || ''}
                      onChange={(e) => updateCampaignData('fixedRateDescription', e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Explain the fixed payment amount and conditions for creators to earn this reward.
                    </p>
                  </div>
                ) : (
                  // PERFORMANCE BASED: Structured fields
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Reward Rate per 1k Views</Label>
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
                        <Label className="text-base font-medium">VIP Creator Reward Rate ($)</Label>
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

                    {/* MAX Reward Totals */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">MAX Reward Total ($)</Label>
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
                        <Label className="text-base font-medium">VIP MAX Reward Total ($)</Label>
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
                  </>
                    )}
                  </>
                )}

                {/* Service-specific fields for visual_services_offering */}
                {campaignData.campaignType === 'visual_services_offering' && formConfig.step2.additionalFields && (
                  <>
                    {formConfig.step2.additionalFields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label className="text-base font-medium">
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        {field.type === 'textarea' ? (
                          <Textarea 
                            placeholder={field.placeholder}
                            className="min-h-[120px]"
                            value={(campaignData as any)[field.id] || ''}
                            onChange={(e) => updateCampaignData(field.id as keyof CampaignData, e.target.value)}
                          />
                        ) : field.type === 'select' ? (
                          <Select 
                            value={(campaignData as any)[field.id] || ''} 
                            onValueChange={(value) => updateCampaignData(field.id as keyof CampaignData, value)}
                          >
                            <SelectTrigger className="bg-background border-border">
                              <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent className="bg-background border-border z-50">
                              {field.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input 
                            type={field.type}
                            placeholder={field.placeholder}
                            value={(campaignData as any)[field.id] || ''}
                            onChange={(e) => updateCampaignData(field.id as keyof CampaignData, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </>
                )}

                {/* Instructions - Use formConfig labels */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">{formConfig.step2.instructionsLabel}</Label>
                  <Textarea 
                    placeholder={formConfig.step2.instructionsPlaceholder}
                    className="min-h-[120px]"
                    value={campaignData.instructions || ''}
                    onChange={(e) => updateCampaignData('instructions', e.target.value)}
                  />
                </div>

                {/* Rules - Use formConfig labels */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">{formConfig.step2.rulesLabel}</Label>
                  <Textarea 
                    placeholder={formConfig.step2.rulesPlaceholder}
                    className="min-h-[120px]"
                    value={campaignData.rules || ''}
                    onChange={(e) => updateCampaignData('rules', e.target.value)}
                  />
                </div>

                {/* Reference Links - Use formConfig labels */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">{formConfig.step2.referenceLinksLabel}</Label>
                  <Textarea 
                    placeholder={formConfig.step2.referenceLinksPlaceholder}
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
                    <Label className="text-base font-medium">{formConfig?.step3.endDateLabel || 'Campaign End Date'}</Label>
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
                    <p className="text-sm text-muted-foreground">
                      {formConfig?.step3.endDateDescription || 'Leave blank for ongoing campaigns'}
                    </p>
                  </div>

                  {/* Budget */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium">{formConfig?.step3.budgetLabel || 'Total Investment'} ($)</Label>
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
                      {formConfig?.step3.budgetDescription || 'Total amount you\'ll invest in this campaign'}
                      {campaignData.campaignType !== 'visual_services_offering' && ' (includes 5% platform fee)'}
                    </p>
                  </div>

                  {/* Budget Summary - Hide for visual_services_offering */}
                  {campaignData.campaignType !== 'visual_services_offering' && (campaignData as any).totalInvestment && campaignData.payoutRate && (
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
                            <span className="text-green-600">{formatCurrency(campaignData.budget || 0)}</span>
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