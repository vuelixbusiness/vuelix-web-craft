import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Wallet, Music, Users, Trophy, BarChart3, Home } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  { label: 'Profile', path: '/profile', icon: User },
  { label: 'Wallet', path: '/wallet', icon: Wallet },
  { label: 'Artist', path: '/artist', icon: Music },
  { label: 'Creator', path: '/creator', icon: Users },
  { label: 'Campaigns', path: '/campaigns', icon: BarChart3 },
  { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  { label: 'Vuelix', path: '/dashboard', icon: Home },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-primary rounded-lg shadow-elegant"></div>
              <span className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Vuelix
              </span>
            </Link>

            {/* Horizontal Navigation */}
            <nav className="hidden md:flex items-center space-x-3">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-6 py-3 rounded-full text-base font-medium transition-smooth flex items-center space-x-2 ${
                      isActivePath(item.path)
                        ? 'bg-gradient-primary text-primary-foreground shadow-elegant'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-6">
              <ThemeToggle />
              <Avatar className="w-12 h-12">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="text-sm">
              {user?.name?.slice(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:block">
            <p className="text-base font-medium">@{user?.username}</p>
            <p className="text-sm text-muted-foreground capitalize">{user?.membershipType}</p>
          </div>
              <Button variant="ghost" size="default" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden mt-6 flex flex-wrap gap-3">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-smooth flex items-center space-x-2 ${
                    isActivePath(item.path)
                      ? 'bg-gradient-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;