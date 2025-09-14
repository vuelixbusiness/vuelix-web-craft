import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, MessageCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

interface DashboardNavProps {
  dashboardType: 'creator' | 'artist';
}

const DashboardNav = ({ dashboardType }: DashboardNavProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getMembershipColor = (membershipType: 'regular' | 'premium') => {
    return membershipType === 'premium' ? 'text-yellow-400' : 'text-gray-400';
  };

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg"></div>
              <span className="text-xl font-bold">Vuelix Clips</span>
            </Link>
            <Badge variant="secondary" className="hidden md:inline-flex">
              {dashboardType === 'creator' ? 'Creator Dashboard' : 'Artist Dashboard'}
            </Badge>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-smooth">
              How It Works
            </Link>
            <Link to="/#for-artists" className="text-muted-foreground hover:text-foreground transition-smooth">
              For Artists
            </Link>
            <Link to="/#for-creators" className="text-muted-foreground hover:text-foreground transition-smooth">
              For Creators
            </Link>
            <Link to="/vuelix-plus" className="text-muted-foreground hover:text-foreground transition-smooth">
              Vuelix+
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