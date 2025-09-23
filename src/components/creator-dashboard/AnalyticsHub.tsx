import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Heart,
  PlayCircle,
  Calendar,
  Target,
  BarChart3
} from "lucide-react";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  totalViews: number;
  totalEarnings: number;
  totalVideos: number;
  avgEngagementRate: number;
  monthlyData: Array<{
    month: string;
    views: number;
    earnings: number;
    videos: number;
  }>;
  platformData: Array<{
    platform: string;
    views: number;
    earnings: number;
    videos: number;
  }>;
  topPerforming: Array<{
    song_title: string;
    artist: string;
    views: number;
    earnings: number;
    platform: string;
  }>;
}

const AnalyticsHub = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalViews: 0,
    totalEarnings: 0,
    totalVideos: 0,
    avgEngagementRate: 0,
    monthlyData: [],
    platformData: [],
    topPerforming: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const platformIcons = {
    tiktok: <FaTiktok className="w-4 h-4" />,
    instagram: <FaInstagram className="w-4 h-4" />,
    youtube: <FaYoutube className="w-4 h-4" />
  };

  const platformColors = {
    tiktok: '#FF0050',
    instagram: '#E4405F', 
    youtube: '#FF0000'
  };

  const fetchAnalytics = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      // Fetch campaign participations with campaigns data
      const { data: participations, error } = await supabase
        .from('campaign_participations')
        .select(`
          *,
          campaigns (
            song_title,
            profiles!campaigns_artist_id_fkey (display_name)
          )
        `)
        .eq('creator_id', user.id);

      if (error) throw error;

      if (!participations || participations.length === 0) {
        setIsLoading(false);
        return;
      }

      // Calculate totals
      const totalViews = participations.reduce((sum, p) => sum + (p.current_views || 0), 0);
      const totalEarnings = participations.reduce((sum, p) => sum + (p.payout_amount || 0), 0);
      const totalVideos = participations.length;

      // Calculate monthly data (mock data for now)
      const monthlyData = [
        { month: 'Jan', views: Math.floor(totalViews * 0.1), earnings: Math.floor(totalEarnings * 0.1), videos: Math.floor(totalVideos * 0.1) },
        { month: 'Feb', views: Math.floor(totalViews * 0.15), earnings: Math.floor(totalEarnings * 0.15), videos: Math.floor(totalVideos * 0.15) },
        { month: 'Mar', views: Math.floor(totalViews * 0.2), earnings: Math.floor(totalEarnings * 0.2), videos: Math.floor(totalVideos * 0.2) },
        { month: 'Apr', views: Math.floor(totalViews * 0.25), earnings: Math.floor(totalEarnings * 0.25), videos: Math.floor(totalVideos * 0.25) },
        { month: 'May', views: Math.floor(totalViews * 0.3), earnings: Math.floor(totalEarnings * 0.3), videos: Math.floor(totalVideos * 0.3) },
        { month: 'Current', views: totalViews, earnings: totalEarnings, videos: totalVideos }
      ];

      // Calculate platform data
      const platformStats = participations.reduce((acc, p) => {
        const platform = p.platform || 'unknown';
        if (!acc[platform]) {
          acc[platform] = { views: 0, earnings: 0, videos: 0 };
        }
        acc[platform].views += p.current_views || 0;
        acc[platform].earnings += p.payout_amount || 0;
        acc[platform].videos += 1;
        return acc;
      }, {} as Record<string, { views: number; earnings: number; videos: number }>);

      const platformData = Object.entries(platformStats).map(([platform, stats]) => ({
        platform,
        ...stats
      }));

      // Get top performing campaigns
      const topPerforming = participations
        .sort((a, b) => (b.current_views || 0) - (a.current_views || 0))
        .slice(0, 5)
        .map(p => ({
          song_title: p.campaigns?.song_title || 'Unknown Song',
          artist: p.campaigns?.profiles?.[0]?.display_name || 'Unknown Artist',
          views: p.current_views || 0,
          earnings: p.payout_amount || 0,
          platform: p.platform || 'unknown'
        }));

      setAnalyticsData({
        totalViews,
        totalEarnings,
        totalVideos,
        avgEngagementRate: totalViews > 0 ? Math.round((participations.reduce((sum, p) => sum + (p.current_likes || 0), 0) / totalViews) * 100) : 0,
        monthlyData,
        platformData,
        topPerforming
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-secondary rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Hub</h2>
          <p className="text-muted-foreground">Track your performance and earnings</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{analyticsData.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">${analyticsData.totalEarnings.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Videos Created</p>
                <p className="text-2xl font-bold">{analyticsData.totalVideos}</p>
              </div>
              <PlayCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Engagement</p>
                <p className="text-2xl font-bold">{analyticsData.avgEngagementRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Monthly Views</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Earnings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Monthly Earnings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="earnings" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
                <CardDescription>Views by platform</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.platformData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ platform, percent }) => `${platform} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="views"
                    >
                      {analyticsData.platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={platformColors[entry.platform as keyof typeof platformColors] || '#8884d8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Platform Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
                <CardDescription>Detailed platform metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.platformData.map((platform) => (
                  <div key={platform.platform} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {platformIcons[platform.platform as keyof typeof platformIcons]}
                      <div>
                        <p className="font-medium capitalize">{platform.platform}</p>
                        <p className="text-sm text-muted-foreground">{platform.videos} videos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{platform.views.toLocaleString()} views</p>
                      <p className="text-sm text-green-600">${platform.earnings.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Videos</CardTitle>
              <CardDescription>Your best performing content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topPerforming.map((video, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{video.song_title}</p>
                        <p className="text-sm text-muted-foreground">by {video.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold">{video.views.toLocaleString()} views</p>
                        <p className="text-sm text-green-600">${video.earnings.toFixed(2)}</p>
                      </div>
                      <Badge variant="outline" className="flex items-center space-x-1">
                        {platformIcons[video.platform as keyof typeof platformIcons]}
                        <span className="capitalize">{video.platform}</span>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsHub;