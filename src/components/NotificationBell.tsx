import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const NotificationBell = ({ 
  className, 
  variant = 'ghost', 
  size = 'icon' 
}: NotificationBellProps) => {
  const { unreadCount, isLoading } = useNotifications();

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={cn("relative", className)}
      asChild
    >
      <Link to="/notifications">
        <Bell className="w-5 h-5" />
        {!isLoading && unreadCount > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs font-bold bg-destructive text-destructive-foreground border-2 border-background flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Link>
    </Button>
  );
};

export default NotificationBell;