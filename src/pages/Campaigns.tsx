import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Search, Filter, Play, Users, DollarSign, Clock } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const campaignData = [
  {
    id: 1,
    title: "Midnight Dreams",
    artist: "Aria Moon",
    genre: "Indie Pop",
    views: "4.8M",
    rate: "$25/1k views",
    budget: "$10,000",
    deadline: "7 days left",
    image: "/placeholder.svg",
    status: "active",
    participants: 23
  },
  {
    id: 2,
    title: "Electric Soul",
    artist: "DJ Phoenix",
    genre: "Electronic",
    views: "3.2M",
    rate: "$22/1k views",
    budget: "$8,500",
    deadline: "12 days left",
    image: "/placeholder.svg",
    status: "active",
    participants: 18
  },
  {
    id: 3,
    title: "Golden Hour",
    artist: "Sunset Valley",
    genre: "Acoustic",
    views: "5.1M",
    rate: "$28/1k views",
    budget: "$15,000",
    deadline: "3 days left",
    image: "/placeholder.svg",
    status: "trending",
    participants: 34
  },
  {
    id: 4,
    title: "City Lights",
    artist: "Urban Echo",
    genre: "Hip-Hop",
    views: "6.7M",
    rate: "$30/1k views",
    budget: "$20,000",
    deadline: "5 days left",
    image: "/placeholder.svg",
    status: "hot",
    participants: 45
  },
  {
    id: 5,
    title: "Ocean Waves",
    artist: "Blue Horizon",
    genre: "Chill",
    views: "2.9M",
    rate: "$20/1k views",
    budget: "$6,000",
    deadline: "10 days left",
    image: "/placeholder.svg",
    status: "active",
    participants: 12
  },
  {
    id: 6,
    title: "Fire & Ice",
    artist: "Storm Riders",
    genre: "Rock",
    views: "4.3M",
    rate: "$26/1k views",
    budget: "$12,000",
    deadline: "8 days left",
    image: "/placeholder.svg",
    status: "active",
    participants: 29
  },
  {
    id: 7,
    title: "Neon Nights",
    artist: "Cyber Dreams",
    genre: "Synthwave",
    views: "3.8M",
    rate: "$24/1k views",
    budget: "$9,500",
    deadline: "15 days left",
    image: "/placeholder.svg",
    status: "new",
    participants: 8
  },
  {
    id: 8,
    title: "Woodland Tales",
    artist: "Folk Collective",
    genre: "Folk",
    views: "2.1M",
    rate: "$18/1k views",
    budget: "$5,500",
    deadline: "20 days left",
    image: "/placeholder.svg",
    status: "active",
    participants: 15
  }
];

const Campaigns = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [sortBy, setSortBy] = useState("trending");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleApplyToCampaign = (campaignId: number) => {
    if (user) {
      navigate('/creator-flow');
    } else {
      navigate('/login');
    }
  };

  const filteredCampaigns = campaignData.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "all" || campaign.genre.toLowerCase() === selectedGenre.toLowerCase();
    return matchesSearch && matchesGenre;
  });

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case "rate":
        return parseInt(b.rate.replace(/[^0-9]/g, "")) - parseInt(a.rate.replace(/[^0-9]/g, ""));
      case "deadline":
        return parseInt(a.deadline.split(" ")[0]) - parseInt(b.deadline.split(" ")[0]);
      case "budget":
        return parseInt(b.budget.replace(/[^0-9]/g, "")) - parseInt(a.budget.replace(/[^0-9]/g, ""));
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "trending":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "hot":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "new":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Discover
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Campaigns</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse active music campaigns and start earning by creating content with amazing tracks.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 p-6 bg-card rounded-xl border border-border">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns or artists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                <SelectItem value="indie pop">Indie Pop</SelectItem>
                <SelectItem value="electronic">Electronic</SelectItem>
                <SelectItem value="acoustic">Acoustic</SelectItem>
                <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                <SelectItem value="chill">Chill</SelectItem>
                <SelectItem value="rock">Rock</SelectItem>
                <SelectItem value="synthwave">Synthwave</SelectItem>
                <SelectItem value="folk">Folk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="rate">Highest Rate</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campaign Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedCampaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:border-primary/30 cursor-pointer group">
                <div className="relative">
                  <img 
                    src={campaign.image} 
                    alt={campaign.title}
                    className="w-full h-48 object-cover bg-muted"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={`${getStatusColor(campaign.status)} font-semibold`}>
                      {campaign.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {campaign.genre}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-3 w-3 mr-1" />
                      {campaign.participants}
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-1 leading-tight">{campaign.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">by {campaign.artist}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rate:</span>
                      <span className="font-semibold text-primary">{campaign.rate}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-semibold">{campaign.budget}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{campaign.deadline}</span>
                      </div>
                      <span className="font-semibold text-muted-foreground">{campaign.views} views</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => handleApplyToCampaign(campaign.id)}
                  >
                    Apply to Campaign
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {sortedCampaigns.length === 0 && (
            <div className="text-center py-16">
              <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No campaigns found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or check back later for new campaigns.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Campaigns;