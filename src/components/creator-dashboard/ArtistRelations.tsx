import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { 
  Heart,
  Search,
  Star,
  DollarSign,
  Music,
  Users,
  TrendingUp,
  MessageCircle,
  Calendar
} from "lucide-react";

interface Artist {
  id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  collaborations: number;
  totalEarnings: number;
  genres: string[];
  avgRating: number;
  lastCollaboration?: string;
}

interface Collaboration {
  id: string;
  campaign_id: string;
  artist_id: string;
  earnings: number;
  views: number;
  created_at: string;
  campaigns: {
    song_title: string;
    genre: string;
  };
  profiles: {
    display_name: string;
    avatar_url?: string;
  };
}

const ArtistRelations = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('favorites');
  const [searchTerm, setSearchTerm] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [recommendedArtists, setRecommendedArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCollaborations = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('campaign_participations')
        .select(`
          id,
          campaign_id,
          payout_amount,
          current_views,
          created_at,
          campaigns (
            song_title,
            genre,
            artist_id,
            profiles!campaigns_artist_id_fkey (
              display_name,
              avatar_url
            )
          )
        `)
        .eq('creator_id', user.id)
        .eq('status', 'approved');

      if (error) throw error;

      const collaborationsData = (data || []).map(item => ({
        id: item.id,
        campaign_id: item.campaign_id,
        artist_id: item.campaigns?.artist_id || '',
        earnings: item.payout_amount || 0,
        views: item.current_views || 0,
        created_at: item.created_at,
        campaigns: {
          song_title: item.campaigns?.song_title || 'Unknown Song',
          genre: item.campaigns?.genre || 'Unknown'
        },
        profiles: {
          display_name: item.campaigns?.profiles?.[0]?.display_name || 'Unknown Artist',
          avatar_url: item.campaigns?.profiles?.[0]?.avatar_url
        }
      }));

      setCollaborations(collaborationsData);

      // Process artist data from collaborations
      const artistStats = collaborationsData.reduce((acc, collab) => {
        const artistId = collab.artist_id;
        if (!acc[artistId]) {
          acc[artistId] = {
            id: artistId,
            display_name: Array.isArray(collab.profiles) ? collab.profiles[0]?.display_name || 'Unknown Artist' : collab.profiles?.display_name || 'Unknown Artist',
            username: (Array.isArray(collab.profiles) ? collab.profiles[0]?.display_name || 'unknown' : collab.profiles?.display_name || 'unknown').toLowerCase().replace(/\s+/g, ''),
            avatar_url: Array.isArray(collab.profiles) ? collab.profiles[0]?.avatar_url : collab.profiles?.avatar_url,
            collaborations: 0,
            totalEarnings: 0,
            genres: new Set<string>(),
            avgRating: 4.5 + Math.random() * 0.5, // Mock rating
            lastCollaboration: collab.created_at
          };
        }
        
        acc[artistId].collaborations += 1;
        acc[artistId].totalEarnings += collab.earnings;
        acc[artistId].genres.add(collab.campaigns.genre);
        
        // Update last collaboration if this one is more recent
        if (new Date(collab.created_at) > new Date(acc[artistId].lastCollaboration || '')) {
          acc[artistId].lastCollaboration = collab.created_at;
        }
        
        return acc;
      }, {} as Record<string, any>);

      const artistsData = Object.values(artistStats).map(artist => ({
        ...artist,
        genres: Array.from(artist.genres)
      })) as Artist[];

      setArtists(artistsData);

      // Generate recommended artists (mock data)
      const mockRecommended: Artist[] = [
        {
          id: 'rec-1',
          display_name: 'Rising Pop Star',
          username: 'risingpopstar',
          collaborations: 0,
          totalEarnings: 0,
          genres: ['Pop', 'Dance'],
          avgRating: 4.8,
          bio: 'Up-and-coming pop artist with viral hits'
        },
        {
          id: 'rec-2',
          display_name: 'Indie Vibes',
          username: 'indievibes',
          collaborations: 0,
          totalEarnings: 0,
          genres: ['Indie', 'Alternative'],
          avgRating: 4.6,
          bio: 'Creating authentic indie music with meaningful lyrics'
        },
        {
          id: 'rec-3',
          display_name: 'Hip Hop Fusion',
          username: 'hiphopfusion',
          collaborations: 0,
          totalEarnings: 0,
          genres: ['Hip Hop', 'R&B'],
          avgRating: 4.7,
          bio: 'Blending classic hip hop with modern R&B influences'
        }
      ];

      setRecommendedArtists(mockRecommended);

    } catch (error) {
      console.error('Error fetching collaborations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArtists = artists.filter(artist =>
    artist.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.genres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    fetchCollaborations();
  }, [user?.id]);

  if (isLoading) {
    return <div className="space-y-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Artist Relations</h2>
          <p className="text-muted-foreground">Manage relationships with artists you've worked with</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="history">History ({collaborations.length})</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="space-y-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search artists..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Favorite Artists */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtists
              .sort((a, b) => b.totalEarnings - a.totalEarnings)
              .slice(0, 6)
              .map((artist) => (
              <Card key={artist.id} className="hover:shadow-lg transition-smooth">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                        {artist.display_name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{artist.display_name}</CardTitle>
                        <CardDescription>@{artist.username}</CardDescription>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{artist.avgRating.toFixed(1)}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Collaborations</p>
                      <p className="font-semibold">{artist.collaborations}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Earned</p>
                      <p className="font-semibold text-green-600">{formatCurrency(artist.totalEarnings)}</p>
                    </div>
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-1">
                    {artist.genres.slice(0, 3).map((genre) => (
                      <Badge key={genre} variant="outline" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>

                  {/* Last Collaboration */}
                  {artist.lastCollaboration && (
                    <p className="text-xs text-muted-foreground">
                      Last worked: {new Date(artist.lastCollaboration).toLocaleDateString()}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button size="sm" variant="outline">
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredArtists.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No favorite artists yet</h3>
                <p className="text-muted-foreground">
                  Start collaborating with artists to build your network!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collaborations.map((collaboration) => (
              <Card key={collaboration.id}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {collaboration.profiles.display_name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{collaboration.campaigns.song_title}</CardTitle>
                      <CardDescription>by {collaboration.profiles.display_name}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Views</p>
                      <p className="font-semibold">{collaboration.views.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Earned</p>
                      <p className="font-semibold text-green-600">{formatCurrency(collaboration.earnings)}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{collaboration.campaigns.genre}</Badge>
                  <p className="text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {new Date(collaboration.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommended" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedArtists.map((artist) => (
              <Card key={artist.id} className="hover:shadow-lg transition-smooth">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                        {artist.display_name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{artist.display_name}</CardTitle>
                        <CardDescription>@{artist.username}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{artist.avgRating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">rating</span>
                  </div>

                  <p className="text-sm text-muted-foreground">{artist.bio}</p>

                  <div className="flex flex-wrap gap-1">
                    {artist.genres.map((genre) => (
                      <Badge key={genre} variant="outline" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>

                  <Button className="w-full">
                    <Music className="w-4 h-4 mr-2" />
                    Follow Artist
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Direct Messages Coming Soon</h3>
              <p className="text-muted-foreground">
                Chat directly with artists to discuss collaborations and build relationships.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArtistRelations;