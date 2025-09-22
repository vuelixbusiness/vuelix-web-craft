import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Search, 
  Clock,
  MessageSquare,
  TrendingUp
} from "lucide-react";

interface Profile {
  user_id: string;
  username: string;
  display_name: string;
  user_type: string;
  membership_type: string;
  avatar_url?: string;
}

interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  requester_profile?: Profile;
  addressee_profile?: Profile;
}

const Friends = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const fetchFriendships = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          requester_profile:profiles!friendships_requester_id_fkey(
            user_id, username, display_name, user_type, membership_type, avatar_url
          ),
          addressee_profile:profiles!friendships_addressee_id_fkey(
            user_id, username, display_name, user_type, membership_type, avatar_url
          )
        `)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const accepted = data?.filter(f => f.status === 'accepted') || [];
      const pending = data?.filter(f => f.status === 'pending') || [];

      setFriends(accepted);
      setPendingRequests(pending);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch friendships",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim() || !user?.id) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, user_type, membership_type, avatar_url')
        .neq('user_id', user.id)
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (targetUserId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: targetUserId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Friend request sent!",
      });

      // Remove from search results
      setSearchResults(prev => prev.filter(p => p.user_id !== targetUserId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      });
    }
  };

  const respondToRequest = async (friendshipId: string, action: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: action })
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Success",
        description: action === 'accepted' ? "Friend request accepted!" : "Friend request declined",
      });

      fetchFriendships();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to respond to friend request",
        variant: "destructive",
      });
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Friend removed",
      });

      fetchFriendships();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove friend",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFriendships();
  }, [user?.id]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchUsers(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const getFriendProfile = (friendship: Friendship) => {
    return friendship.requester_id === user?.id 
      ? friendship.addressee_profile 
      : friendship.requester_profile;
  };

  const isExistingConnection = (userId: string) => {
    return [...friends, ...pendingRequests].some(f => 
      f.requester_id === userId || f.addressee_id === userId
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
              <Users className="w-8 h-8 text-primary" />
              <span>Friends & Network</span>
            </h1>
            <p className="text-muted-foreground">
              Connect with other creators and artists in the community
            </p>
          </div>

          <Tabs defaultValue="friends" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="friends" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Friends ({friends.length})</span>
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Requests ({pendingRequests.length})</span>
              </TabsTrigger>
              <TabsTrigger value="discover" className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span>Discover</span>
              </TabsTrigger>
            </TabsList>

            {/* Friends List */}
            <TabsContent value="friends">
              <div className="space-y-4">
                {friends.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No friends yet</h3>
                      <p className="text-muted-foreground">
                        Start connecting with other creators and artists!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friends.map((friendship) => {
                      const profile = getFriendProfile(friendship);
                      if (!profile) return null;

                      return (
                        <Card key={friendship.id}>
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={profile.avatar_url} />
                                <AvatarFallback>
                                  {profile.display_name?.slice(0, 2).toUpperCase() || 
                                   profile.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="font-medium">{profile.display_name || profile.username}</h3>
                                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {profile.user_type}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {profile.membership_type}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline">
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => removeFriend(friendship.id)}
                                >
                                  <UserX className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Pending Requests */}
            <TabsContent value="requests">
              <div className="space-y-4">
                {pendingRequests.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No pending requests</h3>
                      <p className="text-muted-foreground">
                        Friend requests will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => {
                      const profile = request.requester_id === user?.id 
                        ? request.addressee_profile 
                        : request.requester_profile;
                      
                      if (!profile) return null;

                      const isIncoming = request.addressee_id === user?.id;

                      return (
                        <Card key={request.id}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src={profile.avatar_url} />
                                  <AvatarFallback>
                                    {profile.display_name?.slice(0, 2).toUpperCase() || 
                                     profile.username.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-medium">{profile.display_name || profile.username}</h3>
                                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {profile.user_type}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {isIncoming ? 'Wants to connect' : 'Request sent'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              {isIncoming ? (
                                <div className="flex items-center space-x-2">
                                  <Button 
                                    size="sm"
                                    onClick={() => respondToRequest(request.id, 'accepted')}
                                  >
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Accept
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => respondToRequest(request.id, 'rejected')}
                                  >
                                    <UserX className="w-4 h-4 mr-2" />
                                    Decline
                                  </Button>
                                </div>
                              ) : (
                                <Badge variant="secondary">Pending</Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Discover Users */}
            <TabsContent value="discover">
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search users by username or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-4">
                  {isSearching ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-muted rounded-full"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                                <div className="h-3 bg-muted rounded w-1/4"></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : searchResults.length === 0 && searchTerm ? (
                    <Card className="text-center py-12">
                      <CardContent>
                        <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No users found</h3>
                        <p className="text-muted-foreground">
                          Try searching with different keywords
                        </p>
                      </CardContent>
                    </Card>
                  ) : searchResults.length === 0 ? (
                    <Card className="text-center py-12">
                      <CardContent>
                        <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Discover New Connections</h3>
                        <p className="text-muted-foreground">
                          Search for other creators and artists to connect with
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {searchResults.map((profile) => (
                        <Card key={profile.user_id}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src={profile.avatar_url} />
                                  <AvatarFallback>
                                    {profile.display_name?.slice(0, 2).toUpperCase() || 
                                     profile.username.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-medium">{profile.display_name || profile.username}</h3>
                                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {profile.user_type}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {profile.membership_type}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              {!isExistingConnection(profile.user_id) && (
                                <Button 
                                  size="sm"
                                  onClick={() => sendFriendRequest(profile.user_id)}
                                >
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  Connect
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Friends;