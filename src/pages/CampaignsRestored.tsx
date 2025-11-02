import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import DashboardLayout from '@/components/DashboardLayout';

interface Campaign {
  id: string;
  owner_id: string | null;
  artist_id: string;
  title: string;
  description: string | null;
  track_url: string | null;
  cover_url: string | null;
  song_url: string | null;
  cover_art_url: string | null;
  bounty_cents: number;
  budget_cents: number;
  status: string;
  start_at: string | null;
  end_at: string | null;
  end_date: string | null;
  created_at: string;
}

export default function CampaignsRestored() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 12;

  const fetchCampaigns = async (pageNum: number, searchQuery: string, sort: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('campaigns')
        .select('*')
        .in('status', ['live', 'ended'])
        .not('start_at', 'is', null)
        .lte('start_at', new Date().toISOString());

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      if (sort === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sort === 'ending') {
        query = query.not('end_at', 'is', null).order('end_at', { ascending: true });
      } else if (sort === 'bounty') {
        query = query.order('bounty_cents', { ascending: false });
      }

      const { data, error } = await query
        .range(pageNum * pageSize, (pageNum + 1) * pageSize - 1);

      if (error) throw error;

      setHasMore(data.length === pageSize);
      setCampaigns(pageNum === 0 ? data as any : [...campaigns, ...data as any]);
    } catch (error: any) {
      toast({
        title: 'Error loading campaigns',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns(0, search, sortBy);
  }, [search, sortBy]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCampaigns(nextPage, search, sortBy);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Campaigns</h1>
            <p className="text-muted-foreground mt-2">Discover and join active music campaigns</p>
          </div>
          {user && (
            <Button onClick={() => navigate('/campaigns/new')}>
              New Campaign
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="ending">Ending Soon</SelectItem>
              <SelectItem value="bounty">Highest Bounty</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading && page === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No campaigns found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <Card
                  key={campaign.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/campaign/${campaign.id}`)}
                >
                  {(campaign.cover_url || campaign.cover_art_url) && (
                    <div className="aspect-video w-full overflow-hidden bg-muted">
                      <img
                        src={campaign.cover_url || campaign.cover_art_url || ''}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={campaign.status === 'live' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{campaign.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {campaign.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Bounty:</span>
                        <span className="font-semibold text-primary">
                          ${(campaign.bounty_cents / 100).toFixed(2)}
                        </span>
                      </div>
                      {campaign.budget_cents > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Budget:</span>
                          <span className="font-semibold">
                            ${(campaign.budget_cents / 100).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground flex-col items-start gap-1">
                    {campaign.start_at && <div>Starts: {format(new Date(campaign.start_at), 'MMM d, yyyy')}</div>}
                    {(campaign.end_at || campaign.end_date) && <div>Ends: {format(new Date(campaign.end_at || campaign.end_date!), 'MMM d, yyyy')}</div>}
                  </CardFooter>
                </Card>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
