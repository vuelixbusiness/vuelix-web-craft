import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClickableUsername } from "@/components/ui/clickable-username";
import { getUserTypeById } from "@/config/userTypes";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users } from "lucide-react";

interface ConnectionUser {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  user_type: string;
  membership_type: string;
}

interface ProfileConnectionsDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'partners' | 'following';
}

export function ProfileConnectionsDialog({ open, onClose, userId, type }: ProfileConnectionsDialogProps) {
  const [users, setUsers] = useState<ConnectionUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ConnectionUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open, userId, type]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(user => 
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let data: ConnectionUser[] = [];

      if (type === 'followers') {
        const { data: followers, error } = await supabase
          .from('user_followers')
          .select(`
            follower_id,
            profiles!user_followers_follower_id_fkey (
              user_id,
              username,
              display_name,
              avatar_url,
              user_type,
              membership_type
            )
          `)
          .eq('followed_id', userId);

        if (!error && followers) {
          data = followers.map(f => f.profiles as unknown as ConnectionUser).filter(Boolean);
        }
      } else if (type === 'partners') {
        const { data: partnerships, error } = await supabase
          .from('user_partnerships')
          .select(`
            user_id,
            partner_id,
            profiles!user_partnerships_partner_id_fkey (
              user_id,
              username,
              display_name,
              avatar_url,
              user_type,
              membership_type
            )
          `)
          .or(`user_id.eq.${userId},partner_id.eq.${userId}`)
          .eq('status', 'accepted');

        if (!error && partnerships) {
          data = partnerships.map(p => p.profiles as unknown as ConnectionUser).filter(Boolean);
        }
      } else if (type === 'following') {
        const { data: following, error } = await supabase
          .from('user_followers')
          .select(`
            followed_id,
            profiles!user_followers_followed_id_fkey (
              user_id,
              username,
              display_name,
              avatar_url,
              user_type,
              membership_type
            )
          `)
          .eq('follower_id', userId);

        if (!error && following) {
          data = following.map(f => f.profiles as unknown as ConnectionUser).filter(Boolean);
        }
      }

      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'followers': return 'Followers';
      case 'partners': return 'Partners';
      case 'following': return 'Following';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {getTitle()} ({users.length})
          </DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Search by name or username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />

        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
            <Users className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">
              {searchQuery ? 'No users found' : `No ${type} yet`}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 pr-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>
                      {(user.display_name || user.username)?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <ClickableUsername
                      username={user.username}
                      displayName={user.display_name}
                      showAt={false}
                      className="font-medium text-sm block truncate"
                    />
                    <p className="text-xs text-muted-foreground truncate">
                      @{user.username}
                    </p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {getUserTypeById(user.user_type)?.label || user.user_type}
                      </Badge>
                    </div>
                  </div>

                  <Button size="sm" variant="outline" asChild>
                    <a href={`/user/${user.username}`}>View</a>
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
