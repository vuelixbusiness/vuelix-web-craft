import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, Heart, Users, Music, Play, Pause, Edit, MoreHorizontal, Search, Filter, Trash2 } from "lucide-react";
import { FaTiktok, FaInstagram, FaYoutube, FaTwitter } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  song_url?: string;
  status: string;
  budget: number;
  genre: string;
  created_at: string;
  payout_type: string;
  platforms: string[];
  cover_art_url?: string;
  artist_id: string;
  instructions?: string;
  rules?: string;
  actualSpent?: number;
  estimatedPending?: number;
  totalViews?: number;
  totalLikes?: number;
  creatorCount?: number;
  availableBudget?: number;
}

interface ArtistCampaignListProps {
  campaigns: Campaign[];
  isLoading: boolean;
  currentlyPlaying: string | null;
  onToggleAudio: (campaignId: string, songUrl: string) => void;
  onDeleteCampaign?: (campaignId: string) => void;
}

const platformIcons: { [key: string]: JSX.Element } = {
  'tiktok': <FaTiktok className="w-4 h-4" />,
  'instagram': <FaInstagram className="w-4 h-4" />,
  'youtube': <FaYoutube className="w-4 h-4" />,
  'twitter': <FaTwitter className="w-4 h-4" />,
};

const statusColors: { [key: string]: string } = {
  'active': 'bg-green-100 text-green-800 border-green-200',
  'paused': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'completed': 'bg-blue-100 text-blue-800 border-blue-200',
  'draft': 'bg-gray-100 text-gray-800 border-gray-200',
  'terminated': 'bg-red-100 text-red-800 border-red-200',
};

const ArtistCampaignList = ({ campaigns, isLoading, currentlyPlaying, onToggleAudio, onDeleteCampaign }: ArtistCampaignListProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [deletingCampaign, setDeletingCampaign] = useState<string | null>(null);

  // Filter and sort campaigns
  const filteredCampaigns = campaigns
    .filter(campaign => {
      const matchesSearch = campaign.song_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          campaign.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "song_title":
          return a.song_title.localeCompare(b.song_title);
        case "status":
          return a.status.localeCompare(b.status);
        case "budget":
          return Number(b.budget) - Number(a.budget);
        case "views":
          return (b.totalViews || 0) - (a.totalViews || 0);
        case "creators":
          return (b.creatorCount || 0) - (a.creatorCount || 0);
        case "created_at":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const getProgressPercentage = (campaign: Campaign) => {
    const totalCommitted = (campaign.actualSpent || 0) + (campaign.estimatedPending || 0);
    return campaign.budget > 0 ? (totalCommitted / campaign.budget) * 100 : 0;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
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
            <div className="flex flex-1 gap-4 w-full sm:w-auto">
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
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
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="creators">Creators</SelectItem>
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
                <TableHead>Budget & Spending</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Platforms</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== "all" ? 
                        "No campaigns match your filters" : 
                        "No campaigns found"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCampaigns.map((campaign) => {
                  const progressPercentage = getProgressPercentage(campaign);
                  const totalCommitted = (campaign.actualSpent || 0) + (campaign.estimatedPending || 0);
                  
                  return (
                    <TableRow key={campaign.id} className="hover:bg-muted/50">
                      {/* Play Button */}
                      <TableCell>
                        {campaign.song_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleAudio(campaign.id, campaign.song_url!)}
                            className="w-8 h-8 p-0"
                          >
                            {currentlyPlaying === campaign.id ? 
                              <Pause className="w-4 h-4" /> : 
                              <Play className="w-4 h-4" />
                            }
                          </Button>
                        )}
                      </TableCell>

                      {/* Song & Campaign Info */}
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                            <img 
                              src={campaign.cover_art_url || "/placeholder.svg"} 
                              alt={campaign.song_title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold">{campaign.song_title}</p>
                            <p className="text-sm text-muted-foreground">by {user?.name || 'Unknown Artist'}</p>
                            <p className="text-xs text-muted-foreground">{campaign.genre}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={statusColors[campaign.status] || statusColors.draft}
                        >
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                      </TableCell>

                      {/* Budget & Spending */}
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Budget: {formatCurrency(campaign.budget)}</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Spent: {formatCurrency(campaign.actualSpent || 0)}</span>
                            <span>Available: {formatCurrency(campaign.availableBudget || campaign.budget)}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Performance */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span>{campaign.creatorCount || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4 text-muted-foreground" />
                              <span>{(campaign.totalViews || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4 text-muted-foreground" />
                              <span>{(campaign.totalLikes || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Platforms */}
                      <TableCell>
                        <div className="flex space-x-1">
                          {campaign.platforms.map((platform) => (
                            <div key={platform} className="flex items-center justify-center w-6 h-6 rounded bg-muted">
                              {platformIcons[platform.toLowerCase()] || <Music className="w-3 h-3" />}
                            </div>
                          ))}
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
                            <DropdownMenuItem onClick={() => navigate(`/campaign-management?id=${campaign.id}`)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Campaign
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/campaign-details/${campaign.id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {campaign.status === 'terminated' && onDeleteCampaign && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem 
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-red-600 focus:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Forever
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Campaign Forever?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to permanently delete the campaign "{campaign.title}"? 
                                      This action cannot be undone and will remove all campaign data, including 
                                      participant submissions and analytics.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        setDeletingCampaign(campaign.id);
                                        onDeleteCampaign(campaign.id);
                                      }}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete Forever
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArtistCampaignList;