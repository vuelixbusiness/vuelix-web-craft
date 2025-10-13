import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Search, Filter, PlayCircle, DollarSign, TrendingUp, Eye } from "lucide-react";
import Navigation from "@/components/Navigation";
import vuelixLogo from "@/assets/vuelix-logo-v.png";

const CreatorFlow = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const campaigns = [
    {
      id: 1,
      artist: "Drake",
      song: "God's Plan",
      payout: "$15",
      platforms: ["TikTok", "Instagram"],
      views: "2.5M",
      budget: "$50K",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      artist: "Ariana Grande",
      song: "positions",
      payout: "$20",
      platforms: ["TikTok", "YouTube"],
      views: "1.8M",
      budget: "$75K",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      artist: "Travis Scott",
      song: "SICKO MODE",
      payout: "$18",
      platforms: ["Instagram", "YouTube"],
      views: "3.1M",
      budget: "$60K",
      image: "/placeholder.svg"
    }
  ];

  const earnings = [
    { campaign: "Drake - God's Plan", views: 125000, earned: 1875, progress: 85 },
    { campaign: "Post Malone - Circles", views: 89000, earned: 1335, progress: 65 },
    { campaign: "Billie Eilish - bad guy", views: 156000, earned: 2340, progress: 95 }
  ];

  const totalEarned = earnings.reduce((sum, item) => sum + item.earned, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Creator Dashboard</h1>
            <p className="text-xl text-muted-foreground">Discover campaigns, create content, and track your earnings</p>
          </div>

          {/* Step Navigation */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-8">
              {[1, 2, 3].map((step) => (
                <button
                  key={step}
                  onClick={() => setActiveStep(step)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-smooth ${
                    activeStep === step 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-current opacity-20 flex items-center justify-center text-xs font-bold">
                    {step}
                  </span>
                  <span className="font-medium">
                    {step === 1 ? 'Find Campaigns' : step === 2 ? 'Upload Content' : 'Track Earnings'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 1: Find Campaigns */}
          {activeStep === 1 && (
            <div className="space-y-8">
              {/* Search and Filters */}
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="Search songs, artists, genres"
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>

                {/* Filter Chips */}
                <div className="flex gap-2 mb-8">
                  <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    TikTok
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    Instagram
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    YouTube
                  </Badge>
                </div>

                {/* Campaign Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns.map((campaign) => (
                    <Card key={campaign.id} className="group hover:shadow-lg transition-smooth cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                            <img src={vuelixLogo} alt="Vuelix" className="w-12 h-12" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{campaign.artist}</CardTitle>
                            <CardDescription>{campaign.song}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Payout per 1K views</span>
                          <span className="text-lg font-bold text-primary">{campaign.payout}</span>
                        </div>
                        
                        <div className="flex gap-1">
                          {campaign.platforms.map((platform) => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{campaign.views} total views</span>
                          <span>{campaign.budget} budget</span>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setActiveStep(2);
                          }}
                        >
                          Apply
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Upload Content */}
          {activeStep === 2 && (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Submit Content for Campaign</CardTitle>
                  <CardDescription>
                    {selectedCampaign ? `${selectedCampaign.artist} - ${selectedCampaign.song}` : 'Selected Campaign'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Campaign Summary */}
                  {selectedCampaign && (
                    <div className="bg-secondary p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Reward:</span>
                        <span className="text-primary font-bold">{selectedCampaign.payout}/1K views</span>
                      </div>
                      <div className="flex gap-2">
                        {selectedCampaign.platforms.map((platform) => (
                          <Badge key={platform} variant="outline">{platform}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Section */}
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Upload Your Video</h3>
                    <p className="text-muted-foreground mb-4">
                      Drag & drop your video file or paste a link to your TikTok/Instagram post
                    </p>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full">
                        Choose File
                      </Button>
                      <div className="text-xs text-muted-foreground">OR</div>
                      <Input placeholder="Paste TikTok/Instagram link here" />
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Campaign Requirements</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="duration" />
                        <label htmlFor="duration" className="text-sm">Video is 15-60 seconds long</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="music" />
                        <label htmlFor="music" className="text-sm">Uses the specified song/audio</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="creative" />
                        <label htmlFor="creative" className="text-sm">Original creative content (no reposts)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="tags" />
                        <label htmlFor="tags" className="text-sm">Includes required hashtags</label>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => setActiveStep(3)}
                  >
                    Submit for Review
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Track Earnings */}
          {activeStep === 3 && (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Total Earnings */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-muted-foreground">Total Earned</h3>
                      <p className="text-4xl font-bold text-primary">${totalEarned.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <Button variant="hero" size="lg">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Withdraw
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Earnings Breakdown */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Campaign Performance</h3>
                <div className="space-y-4">
                  {earnings.map((earning, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-medium">{earning.campaign}</h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Eye className="w-4 h-4 mr-1" />
                                {earning.views.toLocaleString()} views
                              </div>
                              <div className="flex items-center">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                ${earning.earned}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">${earning.earned}</div>
                            <div className="text-sm text-muted-foreground">{earning.progress}% complete</div>
                          </div>
                        </div>
                        <Progress value={earning.progress} className="h-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorFlow;