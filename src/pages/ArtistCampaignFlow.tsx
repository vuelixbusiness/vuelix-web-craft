import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
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
  ImageIcon
} from "lucide-react";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";
import Navigation from "@/components/Navigation";

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
  referenceLinks?: string;
  approvalRequired?: boolean;
  
  // Step 3
  endDate?: Date;
  budget?: number;
}

const ArtistCampaignFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    platforms: []
  });

  const genres = [
    "Hip Hop", "Pop", "R&B", "Rock", "Electronic", "Country", 
    "Jazz", "Reggae", "Latin", "Indie", "Folk", "Classical", "Custom"
  ];

  const platforms = [
    { id: "tiktok", name: "TikTok", icon: <FaTiktok className="w-6 h-6" /> },
    { id: "instagram", name: "Instagram", icon: <FaInstagram className="w-6 h-6" /> },
    { id: "youtube", name: "YouTube", icon: <FaYoutube className="w-6 h-6" /> }
  ];

  const updateCampaignData = (field: keyof CampaignData, value: any) => {
    setCampaignData(prev => ({ ...prev, [field]: value }));
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
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-12">
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
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="text-base font-medium mb-2">Upload Music File</h3>
                    <p className="text-muted-foreground mb-3 text-sm">
                      Drag & drop your audio file or browse to upload
                    </p>
                    <Button variant="outline" size="sm" className="mb-3">
                      Choose File
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
                    
                    <Input 
                      placeholder="Paste SoundCloud or Spotify link"
                      value={campaignData.songLink || ''}
                      onChange={(e) => updateCampaignData('songLink', e.target.value)}
                    />
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
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <ImageIcon className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-base font-medium mb-2">Upload Cover Art</h3>
                    <p className="text-muted-foreground mb-4">
                      Add album artwork or campaign image
                    </p>
                    <Button variant="outline" size="sm" className="mb-4">
                      Choose Image
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
                    
                    <Input 
                      placeholder="Paste image link"
                      value={campaignData.coverArtLink || ''}
                      onChange={(e) => updateCampaignData('coverArtLink', e.target.value)}
                    />
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
                  <Card className="bg-secondary relative">
                    <CardContent className="p-6">
                       {/* Highlighted Payout Rate Box - Top Right */}
                       <div className="absolute top-4 right-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-3.5 py-1.5 rounded-lg shadow-lg border-2 border-white/20">
                          <div className="text-lg font-bold">
                            Earn ${campaignData.payoutRate} /1k views
                          </div>
                       </div>
                       
                       {/* Max Payout Info - Below Earn Button */}
                       <div className="absolute top-16 right-4 mt-2">
                         {campaignData.maxPayout && (
                           <div className="bg-black/80 backdrop-blur-sm border border-cyan-400/30 rounded-lg px-3 py-2 shadow-lg">
                             <div className="text-xs text-cyan-400 font-medium mb-1 tracking-wider uppercase">Max Total</div>
                             <div className="text-lg font-bold text-white bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                               ${campaignData.maxPayout}
                             </div>
                           </div>
                         )}
                       </div>
                       
                       <div className="flex items-center space-x-4 mb-6">
                         <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center">
                           <Music className="w-8 h-8 text-white" />
                         </div>
                         <div>
                           <h3 className="text-xl font-bold">Your Artist Name - {campaignData.songTitle || 'Song Title'}</h3>
                           <p className="text-muted-foreground">
                             {campaignData.genre} • {campaignData.campaignType}
                           </p>
                         </div>
                       </div>
                       
                       {/* Campaign Budget Progress Bar */}
                       {campaignData.budget && (
                         <div className="mb-6 p-4 bg-secondary/30 rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm font-medium">Campaign Budget Remaining</span>
                              <span className="text-sm font-bold text-primary">100% remaining</span>
                            </div>
                            <div className="relative w-full bg-muted/40 rounded-full h-4 overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 transition-all duration-500 ease-out animate-scale-in relative"
                                style={{ width: '100%' }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-300/20 to-purple-500/20 animate-pulse"></div>
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
                                100%
                              </div>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                              <span>Used: $0</span>
                              <span>Available: ${campaignData.budget.toFixed(0)}</span>
                            </div>
                         </div>
                       )}

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                         <div className="space-y-3">
                           <div>
                             <div className="text-xs text-muted-foreground mb-1">Payout Rate</div>
                             <div className="text-sm font-bold text-primary">
                               ${campaignData.payoutRate}/{campaignData.payoutType?.replace('-', ' ')}
                             </div>
                           </div>
                           {campaignData.vipBonus && (
                             <div>
                               <div className="text-xs text-muted-foreground mb-1">VIP Payout Rate</div>
                               <div className="text-sm font-bold text-primary">
                                 ${campaignData.vipBonus}
                               </div>
                             </div>
                           )}
                         </div>
                         
                         <div className="space-y-3">
                           {campaignData.vipMaxPayout && (
                             <div>
                               <div className="text-xs text-muted-foreground mb-1">VIP Max Payout Total</div>
                               <div className="text-sm font-bold text-primary">
                                 ${campaignData.vipMaxPayout}
                               </div>
                             </div>
                           )}
                         </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-sm text-muted-foreground mb-2">Target Platforms</div>
                        <div className="flex gap-2">
                          {campaignData.platforms.map((platform) => (
                            <Badge key={platform} variant="outline" className="text-xs capitalize">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full" disabled>
                        Apply to Campaign
                      </Button>
                    </CardContent>
                  </Card>
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
                    <Label className="text-base font-medium">Campaign Budget ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="number"
                        placeholder="0.00"
                        className="pl-10"
                        value={campaignData.budget || ''}
                        onChange={(e) => updateCampaignData('budget', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Budget Summary */}
                  {campaignData.budget && campaignData.payoutRate && (
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Budget Summary</h4>
                        <div className="text-sm space-y-1 text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Total Budget:</span>
                            <span className="font-medium">${campaignData.budget}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Rate per 1K:</span>
                            <span className="font-medium">${campaignData.payoutRate}</span>
                          </div>
                          <div className="flex justify-between border-t pt-1 mt-1">
                            <span>Estimated Reach:</span>
                            <span className="font-medium text-primary">
                              ~{Math.floor((campaignData.budget / campaignData.payoutRate) * 1000).toLocaleString()} views
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

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
                      disabled={!canContinue(3)}
                    >
                      <Rocket className="w-4 h-4 mr-2" />
                      Launch Campaign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistCampaignFlow;