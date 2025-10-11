import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Wallet, Trophy, BarChart3, Home, Globe } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationBell from '@/components/NotificationBell';
import vuelixLogo from "@/assets/vuelix-logo-v.png";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  { label: 'User Home', path: '/dashboard', icon: Home },
  { label: 'Wallet', path: '/wallet', icon: Wallet },
  { label: 'Campaigns', path: '/campaigns', icon: BarChart3 },
  { label: 'Discover', path: '/discover', icon: Globe },
  { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
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
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-purple-800">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <Link 
              to="/dashboard" 
              className={`flex items-center space-x-3 hover:opacity-80 transition-smooth ${
                isActivePath('/dashboard') ? 'opacity-100' : ''
              }`}
            >
              <img src={vuelixLogo} alt="Vuelix" className="w-8 h-8" />
              <span className="text-xl font-bold text-foreground">
                Vuelix
              </span>
            </Link>

            {/* Horizontal Navigation - Centered */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
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
                      ? 'bg-muted text-foreground'
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