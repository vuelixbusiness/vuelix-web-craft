import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Heart, Music, Play, Pause, Search, Filter, ExternalLink } from "lucide-react";
import { FaTiktok, FaInstagram, FaYoutube, FaTwitter } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Participation {
  id: string;
  campaign_id: string;
  status: string;
  platform: string;
  video_url: string | null;
  current_views: number;
  current_likes: number;
  payout_amount: number;
  created_at: string;
  campaigns: {
    song_title: string;
    song_url: string | null;
    cover_art_url: string | null;
    genre: string;
    title: string;
    profiles: {
      display_name: string;
    } | null;
  };
}

interface CreatorCampaignListProps {
  currentlyPlaying: string | null;
  onToggleAudio: (participationId: string, songUrl: string) => void;
}

const platformIcons: { [key: string]: JSX.Element } = {
  'tiktok': <FaTiktok className="w-4 h-4" />,
  'instagram': <FaInstagram className="w-4 h-4" />,
  'youtube': <FaYoutube className="w-4 h-4" />,
  'twitter': <FaTwitter className="w-4 h-4" />,
};

const statusColors: { [key: string]: string } = {
  'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'approved': 'bg-green-100 text-green-800 border-green-200',
  'live': 'bg-blue-100 text-blue-800 border-blue-200',
  'rejected': 'bg-red-100 text-red-800 border-red-200',
  'submitted': 'bg-purple-100 text-purple-800 border-purple-200',
  'joined': 'bg-gray-100 text-gray-800 border-gray-200',
};

const CreatorCampaignList = ({ currentlyPlaying, onToggleAudio }: CreatorCampaignListProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");

  useEffect(() => {
    if (user?.id) {
      fetchParticipations();
    }
  }, [user?.id]);

  const fetchParticipations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('campaign_participations')
        .select(`
          id,
          campaign_id,
          status,
          platform,
          video_url,
          current_views,
          current_likes,
          payout_amount,
          created_at,
          campaigns (
            song_title,
            song_url,
            cover_art_url,
            genre,
            title,
            profiles:profiles!campaigns_artist_id_fkey (
              display_name
            )
          )
        `)
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParticipations((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching participations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort participations
  const filteredParticipations = participations
    .filter(participation => {
      const matchesSearch = participation.campaigns.song_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          participation.campaigns.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || participation.status === statusFilter;
      const matchesPlatform = platformFilter === "all" || participation.platform?.toLowerCase() === platformFilter;
      return matchesSearch && matchesStatus && matchesPlatform;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "song_title":
          return a.campaigns.song_title.localeCompare(b.campaigns.song_title);
        case "status":
          return a.status.localeCompare(b.status);
        case "earnings":
          return Number(b.payout_amount) - Number(a.payout_amount);
        case "views":
          return (b.current_views || 0) - (a.current_views || 0);
        case "created_at":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 w-full sm:w-auto flex-wrap">
              <div className="relative flex-1 sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="joined">Joined</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Latest</SelectItem>
                  <SelectItem value="song_title">Song Title</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="earnings">Earnings</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Song & Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== "all" || platformFilter !== "all" ? 
                        "No campaigns match your filters" : 
                        "No campaigns joined yet"}
                    </p>
                    {!searchTerm && statusFilter === "all" && platformFilter === "all" && (
                      <Button 
                        className="mt-4"
                        onClick={() => navigate('/campaigns')}
                      >
                        Browse Campaigns
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredParticipations.map((participation) => (
                  <TableRow key={participation.id} className="hover:bg-muted/50">
                    {/* Play Button */}
                    <TableCell>
                      {participation.campaigns.song_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleAudio(participation.id, participation.campaigns.song_url!)}
                          className="w-8 h-8 p-0"
                        >
                          {currentlyPlaying === participation.id ? 
                            <Pause className="w-4 h-4" /> : 
                            <Play className="w-4 h-4" />
                          }
                        </Button>
                      )}
                    </TableCell>

                    {/* Song & Campaign Info */}
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 overflow-hidden relative">
                          <img 
                            src={participation.campaigns.cover_art_url || "/placeholder.svg"} 
                            alt={participation.campaigns.song_title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-sm bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
                            <Music className="w-2.5 h-2.5 text-primary" />
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold">{participation.campaigns.song_title}</p>
                          <p className="text-sm text-muted-foreground">
                            by {participation.campaigns.profiles?.display_name || 'Unknown Artist'}
                          </p>
                          <p className="text-xs text-muted-foreground">{participation.campaigns.genre}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={statusColors[participation.status] || statusColors.joined}
                      >
                        {participation.status.charAt(0).toUpperCase() + participation.status.slice(1)}
                      </Badge>
                    </TableCell>

                    {/* Platform */}
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded bg-muted">
                          {participation.platform ? 
                            platformIcons[participation.platform.toLowerCase()] || <Music className="w-4 h-4" /> :
                            <Music className="w-4 h-4" />
                          }
                        </div>
                        <span className="text-sm capitalize">{participation.platform || 'Not set'}</span>
                      </div>
                    </TableCell>

                    {/* Performance */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            <span>{(participation.current_views || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4 text-muted-foreground" />
                            <span>{(participation.current_likes || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Earnings */}
                    <TableCell>
                      <div className="font-semibold text-green-600">
                        {formatCurrency(participation.payout_amount || 0)}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {participation.video_url && (
                            <DropdownMenuItem 
                              onClick={() => window.open(participation.video_url!, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View My Submission
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => navigate(`/campaign-details/${participation.campaign_id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Campaign Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorCampaignList;
