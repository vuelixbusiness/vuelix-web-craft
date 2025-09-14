import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { 
  Music, 
  Video, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Play,
  Plus,
  BarChart3
} from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const isArtist = user.type === 'artist';
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back, {user.name}!
                </h1>
                <div className="flex items-center space-x-3 mt-2">
                  <Badge variant={isArtist ? "default" : "secondary"}>
                    {isArtist ? <Music className="w-4 h-4 mr-1" /> : <Video className="w-4 h-4 mr-1" />}
                    {user.type === 'artist' ? 'Artist' : 'Creator'}
                  </Badge>
                  <Badge variant="outline">
                    {user.membershipType === 'premium' ? 'Premium' : 'Regular'} Member
                  </Badge>
                </div>
              </div>
              <Button variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card className="col-span-full lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>
                  Jump right into what you need to do
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isArtist ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col space-y-2"
                        onClick={() => navigate('/artist-campaign')}
                      >
                        <Plus className="w-6 h-6" />
                        <span>Create Campaign</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col space-y-2"
                        onClick={() => navigate('/artist-dashboard')}
                      >
                        <BarChart3 className="w-6 h-6" />
                        <span>View Analytics</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col space-y-2"
                        onClick={() => navigate('/creator-flow')}
                      >
                        <Video className="w-6 h-6" />
                        <span>Find Campaigns</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col space-y-2"
                        onClick={() => navigate('/creator-dashboard')}
                      >
                        <DollarSign className="w-6 h-6" />
                        <span>Track Earnings</span>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Your Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {isArtist ? 'Active Campaigns' : 'Campaigns Joined'}
                    </span>
                    <span className="font-bold">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {isArtist ? 'Total Views' : 'Total Earnings'}
                    </span>
                    <span className="font-bold">
                      {isArtist ? '12.5K' : '$247.50'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">This Month</span>
                    <span className="font-bold text-primary">
                      {isArtist ? '+2.1K' : '+$89.20'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      action: isArtist ? 'Campaign "Midnight Dreams" went live' : 'Submitted content for "Summer Vibes"',
                      time: '2 hours ago',
                      status: 'success'
                    },
                    {
                      action: isArtist ? 'New creator applied to "Electric Nights"' : 'Earned $25 from "Midnight Dreams" campaign',
                      time: '1 day ago',
                      status: 'info'
                    },
                    {
                      action: isArtist ? 'Campaign budget updated' : 'Content approved for "Electric Nights"',
                      time: '3 days ago',
                      status: 'success'
                    }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/20">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;