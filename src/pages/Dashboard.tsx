import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { TrendingUp, Users, Music, Trophy, Wallet, User } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  const quickStats = [
    { label: 'Total Earnings', value: '$0.00', icon: Wallet, color: 'text-green-500' },
    { label: 'Active Campaigns', value: '0', icon: Music, color: 'text-blue-500' },
    { label: 'Total Views', value: '0', icon: TrendingUp, color: 'text-purple-500' },
    { label: 'Rank', value: 'Unranked', icon: Trophy, color: 'text-yellow-500' },
  ];

  const quickActions = [
    { label: 'Join Campaign', path: '/campaigns', description: 'Discover new music campaigns' },
    { label: 'Create Campaign', path: '/artist', description: 'Launch your music promotion' },
    { label: 'View Wallet', path: '/wallet', description: 'Check earnings and transactions' },
    { label: 'Edit Profile', path: '/profile', description: 'Update your profile information' },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-elegant">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {user?.name || user?.username}!
              </h1>
              <p className="text-muted-foreground">
                Ready to discover amazing music and earn rewards?
              </p>
              <Badge variant={user?.membershipType === 'premium' ? 'default' : 'secondary'} className="mt-2">
                {user?.membershipType} Member
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="shadow-soft hover:shadow-elegant transition-smooth">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <IconComponent className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="shadow-soft hover:shadow-elegant transition-smooth cursor-pointer group">
                <Link to={action.path}>
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-primary transition-smooth">
                      {action.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {action.description}
                    </p>
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
                      Get Started
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No recent activity yet. Start participating in campaigns to see your progress here!
              </p>
              <Button asChild>
                <Link to="/campaigns">Browse Campaigns</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;