import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { 
  Bell, 
  BellOff, 
  MessageSquare, 
  DollarSign, 
  TrendingUp, 
  Check,
  X,
  Settings
 } from "lucide-react";

const Notifications = () => {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteAllRead 
  } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const notificationIcons = {
    payment: DollarSign,
    campaign: TrendingUp,
    message: MessageSquare,
    system: Bell,
    campaign_join: TrendingUp,
    campaign_joined: TrendingUp,
    status_update: Bell,
    participation_update: TrendingUp,
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
                <Bell className="w-8 h-8 text-primary" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground">
                Stay updated with your campaigns, earnings, and messages
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 mb-6">
            <Button onClick={markAllAsRead} disabled={unreadCount === 0}>
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
            <Button variant="outline" onClick={deleteAllRead}>
              <X className="w-4 h-4 mr-2" />
              Clear Read
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                  </h3>
                  <p className="text-muted-foreground">
                    {filter === 'unread' 
                      ? 'You\'re all caught up!' 
                      : 'Start participating in campaigns to receive notifications'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => {
                const IconComponent = notificationIcons[notification.type as keyof typeof notificationIcons] || Bell;
                
                return (
                  <Card 
                    key={notification.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !notification.read ? 'border-primary/50 bg-primary/5' : ''
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          !notification.read ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                            <div className="flex items-center space-x-2">
                              {notification.category && (
                                <Badge variant="outline" className="text-xs">
                                  {notification.category}
                                </Badge>
                              )}
                              {notification.priority && notification.priority !== 'medium' && (
                                <Badge 
                                  variant={notification.priority === 'high' || notification.priority === 'critical' ? 'destructive' : 'secondary'} 
                                  className="text-xs"
                                >
                                  {notification.priority}
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                {notification.type}
                              </Badge>
                              {!notification.read && (
                                <Badge variant="default" className="text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;