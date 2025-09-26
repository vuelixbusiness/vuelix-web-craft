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
    { label: 'Total Earnings', value: '$0.00', icon: Wallet, color: 'text-stat-green' },
    { label: 'Active Campaigns', value: '0', icon: Music, color: 'text-stat-blue' },
    { label: 'Total Views', value: '0', icon: TrendingUp, color: 'text-stat-purple' },
    { label: 'Rank', value: 'Unranked', icon: Trophy, color: 'text-stat-yellow' },
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
        <div className="mb-12">
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                Welcome back, {user?.name || user?.username}!
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Ready to discover amazing music and earn rewards?
              </p>
              <Badge variant="secondary" className="mt-3 text-sm px-3 py-1 bg-muted text-muted-foreground">
                {user?.membershipType || 'regular'} Member
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="bg-card border-border hover:border-accent/50 transition-smooth">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <IconComponent className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="bg-card border-border hover:border-accent/50 transition-smooth cursor-pointer group">
                <Link to={action.path}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg group-hover:text-primary transition-smooth text-foreground">
                      {action.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {action.description}
                    </p>
                    <Button variant="default" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Get Started
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-xl text-foreground">
              <TrendingUp className="w-6 h-6 text-stat-purple" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                No recent activity yet. Start participating in campaigns to see your progress here!
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
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