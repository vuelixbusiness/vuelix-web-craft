import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardLayout from "@/components/DashboardLayout";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Crown, Medal, TrendingUp, Users, DollarSign } from "lucide-react";

const Leaderboard = () => {
  const { user } = useAuth();
  // Mock leaderboard data - replace with actual data
  const topCreators = [
    {
      id: '1',
      username: 'creator1',
      name: 'Top Creator',
      avatar: null,
      total_earnings: 1250.00,
      total_views: 50000,
      campaigns_completed: 15,
      rank: 1,
    },
    {
      id: '2',
      username: 'creator2',
      name: 'Second Place',
      avatar: null,
      total_earnings: 980.50,
      total_views: 38000,
      campaigns_completed: 12,
      rank: 2,
    },
    {
      id: '3',
      username: 'creator3',
      name: 'Third Place',
      avatar: null,
      total_earnings: 750.25,
      total_views: 25000,
      campaigns_completed: 10,
      rank: 3,
    },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Trophy className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700';
      default:
        return 'bg-gradient-primary';
    }
  };

  const leaderboardStats = [
    {
      title: 'Total Creators',
      value: '156',
      description: 'Active this month',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Total Earnings',
      value: '$45,230',
      description: 'Paid out this month',
      icon: DollarSign,
      color: 'text-green-500',
    },
    {
      title: 'Top Views',
      value: '2.1M',
      description: 'Highest this month',
      icon: TrendingUp,
      color: 'text-purple-500',
    },
  ];

  const leaderboardContent = (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">
            See how creators rank and compete for rewards
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {leaderboardStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <IconComponent className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Top 3 Podium */}
        <Card className="mb-8 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span>Top Performers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topCreators.slice(0, 3).map((creator) => (
                <div 
                  key={creator.id} 
                  className={`relative p-6 rounded-lg text-center ${getRankColor(creator.rank)} text-white shadow-elegant`}
                >
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-background rounded-full p-2 shadow-soft">
                      {getRankIcon(creator.rank)}
                    </div>
                  </div>
                  
                  <Avatar className="w-16 h-16 mx-auto mb-4 border-4 border-white/20">
                    <AvatarImage src={creator.avatar} alt={creator.name} />
                    <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                      {creator.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="text-lg font-bold mb-1">{creator.name}</h3>
                  <p className="text-white/80 text-sm mb-3">@{creator.username}</p>
                  
                  <div className="space-y-1 text-sm">
                    <div className="font-semibold">${creator.total_earnings.toLocaleString()}</div>
                    <div className="text-white/80">{creator.total_views.toLocaleString()} views</div>
                    <div className="text-white/80">{creator.campaigns_completed} campaigns</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Full Leaderboard */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Full Rankings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCreators.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No rankings yet</h3>
                <p className="text-muted-foreground">
                  Start participating in campaigns to appear on the leaderboard!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {topCreators.map((creator, index) => (
                  <div 
                    key={creator.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border transition-smooth hover:shadow-soft ${
                      index < 3 ? 'bg-gradient-to-r from-primary/5 to-transparent border-primary/20' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8">
                        {index < 3 ? getRankIcon(creator.rank) : (
                          <span className="font-bold text-lg">#{creator.rank}</span>
                        )}
                      </div>
                      
                      <Avatar>
                        <AvatarImage src={creator.avatar} alt={creator.name} />
                        <AvatarFallback>
                          {creator.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h4 className="font-medium">{creator.name}</h4>
                        <p className="text-sm text-muted-foreground">@{creator.username}</p>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="font-bold text-green-500">
                        ${creator.total_earnings.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {creator.total_views.toLocaleString()} views
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {creator.campaigns_completed} campaigns
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Show appropriate layout based on authentication status
  if (user) {
    return (
      <DashboardLayout>
        {leaderboardContent}
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        {leaderboardContent}
      </div>
    </div>
  );
};

export default Leaderboard;