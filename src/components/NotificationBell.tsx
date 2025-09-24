import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationBellProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

const NotificationBell = ({ className, size = 'default' }: NotificationBellProps) => {
  const { unreadCount } = useNotifications();

  const iconSize = {
    sm: 'w-4 h-4',
    default: 'w-5 h-5',
    lg: 'w-6 h-6'
  }[size];

  const getButtonSize = (s: 'sm' | 'default' | 'lg'): 'sm' | 'default' | 'lg' | 'icon' => {
    if (s === 'sm') return 'sm';
    if (s === 'lg') return 'lg';
    return 'default';
  };

  return (
    <Button 
      variant="ghost" 
      size={getButtonSize(size)} 
      asChild 
      className={`relative ${className}`}
    >
      <Link to="/notifications">
        <Bell className={iconSize} />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0 min-w-0 border-2 border-background"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
        <span className="sr-only">
          {unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        </span>
      </Link>
    </Button>
  );
};

export default NotificationBell;