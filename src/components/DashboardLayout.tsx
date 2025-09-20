import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  { label: 'Profile', path: '/profile' },
  { label: 'Wallet', path: '/wallet' },
  { label: 'Artist', path: '/artist' },
  { label: 'Creator', path: '/creator' },
  { label: 'Campaigns', path: '/campaigns' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Vuelix', path: '/dashboard' },
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
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg shadow-elegant"></div>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Vuelix Clips
              </span>
            </Link>

            {/* Horizontal Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-smooth ${
                    isActivePath(item.path)
                      ? 'bg-gradient-primary text-primary-foreground shadow-elegant'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Avatar className="w-8 h-8">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="text-xs">
              {user?.name?.slice(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:block">
            <p className="text-sm font-medium">@{user?.username}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.membershipType}</p>
          </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden mt-4 flex flex-wrap gap-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-smooth ${
                  isActivePath(item.path)
                    ? 'bg-gradient-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {item.label}
              </Link>
            ))}
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