import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Wallet, Music, Users, Trophy, BarChart3, Home } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationBell from '@/components/NotificationBell';
import vuelixLogo from "@/assets/vuelix-logo-v.png";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigationItems = [
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <img src={vuelixLogo} alt="Vuelix" className="w-8 h-8" />
              <span className="text-xl font-bold text-foreground">
                Vuelix
              </span>
            </div>

            {/* Horizontal Navigation - Centered */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.slice(0, -1).map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-smooth flex items-center space-x-2 ${
                      isActivePath(item.path)
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              {/* Special Vuelix button */}
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-smooth flex items-center space-x-2 ${
                  isActivePath('/dashboard')
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary/20 text-primary hover:bg-primary/30'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Vuelix</span>
              </Link>
            </nav>

            {/* User Menu - Right side */}
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <NotificationBell />
              <Link to="/profile" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="text-xs">
                    {user?.name?.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-foreground">@{user?.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.membershipType === 'regular' ? 'Member' : (user?.membershipType || 'Member')}
                  </p>
                </div>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden mt-4 flex flex-wrap gap-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-full text-xs font-medium transition-smooth flex items-center space-x-2 ${
                    isActivePath(item.path)
                      ? item.path === '/dashboard' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
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