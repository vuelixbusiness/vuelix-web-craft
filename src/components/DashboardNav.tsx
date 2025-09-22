import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, MessageCircle, ArrowLeftRight, Home, Settings } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import vuelixLogo from "@/assets/vuelix-logo-v.png";

interface DashboardNavProps {
  dashboardType: 'creator' | 'artist';
}

const DashboardNav = ({ dashboardType }: DashboardNavProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleDashboardSwitch = () => {
    if (location.pathname === '/home') {
      navigate('/artist-dashboard');
    } else {
      navigate('/home');
    }
  };

  const isOnSpecializedDashboard = location.pathname.includes('dashboard');

  const getMembershipColor = (membershipType: 'regular' | 'premium') => {
    return membershipType === 'premium' ? 'text-yellow-400' : 'text-gray-400';
  };

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <img src={vuelixLogo} alt="Vuelix" className="w-8 h-8" />
              <span className="text-xl font-bold">Vuelix</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="hidden md:inline-flex">
                {isOnSpecializedDashboard 
                  ? (dashboardType === 'creator' ? 'Creator Dashboard' : 'Artist Dashboard')
                  : 'Home Dashboard'
                }
              </Badge>
              {user?.type === 'artist' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDashboardSwitch}
                  className="flex items-center space-x-1 text-xs h-6 px-2"
                  title={isOnSpecializedDashboard ? 'Switch to Home Dashboard' : 'Switch to Artist Dashboard'}
                >
                  {isOnSpecializedDashboard ? (
                    <>
                      <Home className="w-3 h-3" />
                      <span className="hidden lg:inline">Home</span>
                    </>
                  ) : (
                    <>
                      <Settings className="w-3 h-3" />
                      <span className="hidden lg:inline">Artist</span>
                    </>
                  )}
                  <ArrowLeftRight className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-smooth">
              How It Works
            </Link>
            <Link to="/#for-artists" className="text-muted-foreground hover:text-foreground transition-smooth">
              For Artists
            </Link>
            <Link to="/#for-creators" className="text-muted-foreground hover:text-foreground transition-smooth">
              For Creators
            </Link>
            <Link to="/notifications" className="text-muted-foreground hover:text-foreground transition-smooth">
              Notifications
            </Link>
            <Link to="/support" className="text-muted-foreground hover:text-foreground transition-smooth">
              Support
            </Link>
            <Link to="/friends" className="text-muted-foreground hover:text-foreground transition-smooth">
              Friends
            </Link>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/chat">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Avatar>
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium flex items-center space-x-2">
                <span className={getMembershipColor(user?.membershipType || 'regular')}>
                  @{user?.username}
                </span>
                <Badge variant={user?.membershipType === 'premium' ? 'default' : 'secondary'} className="text-xs">
                  {user?.membershipType}
                </Badge>
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNav;