import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageCircle, 
  Users, 
  UserPlus, 
  Search, 
  Send, 
  MoreVertical,
  Hash,
  AtSign,
  Menu,
  X,
  Check,
  UserX
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface ChatRoom {
  id: string;
  name: string;
  room_type: string;
  created_at: string;
  other_user?: Profile;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  room_id: string;
  created_at: string;
  sender?: {
    username: string;
    display_name: string;
    avatar_url?: string;
    membership_type: string;
  };
}

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // States
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch initial data
  useEffect(() => {
    if (user) {
      fetchFriendships();
      fetchChatRooms();
    }
  }, [user]);

  // Fetch friendships
  const fetchFriendships = async () => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`requester_id.eq.${user?.id},addressee_id.eq.${user?.id}`);

      if (error) throw error;

      // Fetch profiles separately to avoid relation issues
      const userIds = data?.flatMap(f => [f.requester_id, f.addressee_id]) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, user_type, membership_type, avatar_url')
        .in('user_id', userIds);

      // Map profiles to friendships
      const friendshipsWithProfiles = data?.map(friendship => ({
        ...friendship,
        requester_profile: profiles?.find(p => p.user_id === friendship.requester_id),
        addressee_profile: profiles?.find(p => p.user_id === friendship.addressee_id)
      })) || [];

      const acceptedFriends = friendshipsWithProfiles.filter(f => f.status === 'accepted');
      const pending = friendshipsWithProfiles.filter(f => f.status === 'pending');

      setFriends(acceptedFriends as Friendship[]);
      setPendingRequests(pending as Friendship[]);
    } catch (error) {
      console.error('Error fetching friendships:', error);
    }
  };

  // Fetch chat rooms
  const fetchChatRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('room_type', 'direct_message');

      if (error) throw error;

      // For each DM room, get the other user's profile
      const roomsWithProfiles = await Promise.all(
        (data || []).map(async (room) => {
          const { data: members } = await supabase
            .from('chat_room_members')
            .select('user_id')
            .eq('room_id', room.id);

          const otherUserId = members?.find(m => m.user_id !== user?.id)?.user_id;
          
          if (otherUserId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('user_id, username, display_name, avatar_url, membership_type')
              .eq('user_id', otherUserId)
              .single();

            return {
              ...room,
              other_user: profile as Profile
            };
          }

          return room;
        })
      );

      setChatRooms(roomsWithProfiles);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected room
  const fetchMessages = useCallback(async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch sender profiles separately
      const senderIds = [...new Set(data?.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, membership_type')
        .in('user_id', senderIds);

      // Map profiles to messages
      const messagesWithSenders = data?.map(message => ({
        ...message,
        sender: profiles?.find(p => p.user_id === message.sender_id)
      })) || [];

      setMessages(messagesWithSenders as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  // Search users
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, user_type, membership_type, avatar_url')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .neq('user_id', user?.id)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Send friend request
  const sendFriendRequest = async (targetUserId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user?.id,
          addressee_id: targetUserId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Friend request sent",
        description: "Your friend request has been sent successfully.",
      });

      // Remove from search results
      setSearchResults(prev => prev.filter(u => u.user_id !== targetUserId));
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request.",
        variant: "destructive",
      });
    }
  };

  // Respond to friend request
  const respondToRequest = async (friendshipId: string, action: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: action })
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: action === 'accepted' ? "Friend request accepted" : "Friend request declined",
        description: `You have ${action} the friend request.`,
      });

      await fetchFriendships();
    } catch (error) {
      console.error('Error responding to friend request:', error);
    }
  };

  // Start direct message
  const startDirectMessage = async (otherUserId: string) => {
    try {
      // Check if DM room already exists
      const existingRoom = chatRooms.find(room => room.other_user?.user_id === otherUserId);
      
      if (existingRoom) {
        setSelectedRoom(existingRoom);
        await fetchMessages(existingRoom.id);
        setIsSidebarOpen(false);
        return;
      }

      // Create new DM room
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name: `dm_${user?.id}_${otherUserId}`,
          room_type: 'direct_message',
          created_by: user?.id
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add both users as members
      const { error: membersError } = await supabase
        .from('chat_room_members')
        .insert([
          { room_id: roomData.id, user_id: user?.id },
          { room_id: roomData.id, user_id: otherUserId }
        ]);

      if (membersError) throw membersError;

      // Refresh chat rooms
      await fetchChatRooms();
      
      // Select the new room - find the other user's profile
      const friendship = friends.find(f => 
        f.requester_id === otherUserId || f.addressee_id === otherUserId
      );
      
      const otherUserProfile = friendship?.requester_id === otherUserId 
        ? friendship.requester_profile 
        : friendship?.addressee_profile;

      const newRoom = {
        ...roomData,
        other_user: otherUserProfile
      };
      
      setSelectedRoom(newRoom as ChatRoom);
      setIsSidebarOpen(false);
    } catch (error) {
      console.error('Error starting direct message:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation.",
        variant: "destructive",
      });
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage,
          sender_id: user?.id,
          room_id: selectedRoom.id,
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage('');
      await fetchMessages(selectedRoom.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Helper functions
  const getFriendProfile = (friendship: Friendship): Profile | undefined => {
    return friendship.requester_id === user?.id 
      ? friendship.addressee_profile 
      : friendship.requester_profile;
  };

  const isExistingConnection = (userId: string): boolean => {
    return friends.some(f => 
      f.requester_id === userId || f.addressee_id === userId
    ) || pendingRequests.some(f => 
      f.requester_id === userId || f.addressee_id === userId
    );
  };

  const getMembershipColor = (membershipType: string) => {
    return membershipType === 'premium' ? 'text-yellow-400' : 'text-gray-400';
  };

  // Mobile sidebar
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs defaultValue="conversations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conversations">
              <MessageCircle className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">DMs</span>
            </TabsTrigger>
            <TabsTrigger value="friends">
              <Users className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Friends</span>
            </TabsTrigger>
            <TabsTrigger value="discover">
              <UserPlus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Add</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="mt-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {chatRooms.map((room) => (
                <div
                  key={room.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedRoom?.id === room.id 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => {
                    setSelectedRoom(room);
                    fetchMessages(room.id);
                    setIsSidebarOpen(false);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={room.other_user?.avatar_url} />
                      <AvatarFallback>
                        {room.other_user?.display_name?.slice(0, 2).toUpperCase() || 
                         room.other_user?.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {room.other_user?.display_name || room.other_user?.username}
                      </p>
                      <p className={`text-xs ${getMembershipColor(room.other_user?.membership_type || 'regular')}`}>
                        @{room.other_user?.username}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {chatRooms.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start chatting with your friends!</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="friends" className="mt-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {pendingRequests.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Pending Requests</h3>
                  {pendingRequests.map((request) => {
                    const profile = getFriendProfile(request);
                    const isIncoming = request.addressee_id === user?.id;
                    
                    return (
                      <div key={request.id} className="p-3 rounded-lg border mb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={profile?.avatar_url} />
                              <AvatarFallback>
                                {profile?.display_name?.slice(0, 2).toUpperCase() || 
                                 profile?.username?.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {profile?.display_name || profile?.username}
                              </p>
                              <p className={`text-xs ${getMembershipColor(profile?.membership_type || 'regular')}`}>
                                @{profile?.username}
                              </p>
                            </div>
                          </div>
                          {isIncoming && (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => respondToRequest(request.id, 'accepted')}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => respondToRequest(request.id, 'rejected')}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <Separator className="my-4" />
                </div>
              )}
              
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Friends ({friends.length})
              </h3>
              {friends.map((friendship) => {
                const profile = getFriendProfile(friendship);
                return (
                  <div
                    key={friendship.id}
                    className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => startDirectMessage(profile?.user_id || '')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile?.avatar_url} />
                          <AvatarFallback>
                            {profile?.display_name?.slice(0, 2).toUpperCase() || 
                             profile?.username?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {profile?.display_name || profile?.username}
                          </p>
                          <p className={`text-xs ${getMembershipColor(profile?.membership_type || 'regular')}`}>
                            @{profile?.username}
                          </p>
                        </div>
                      </div>
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
              
              {friends.length === 0 && pendingRequests.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No friends yet</p>
                  <p className="text-sm">Add some friends to start chatting!</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="discover" className="mt-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>
              
              <ScrollArea className="h-[calc(100vh-300px)]">
                {searchResults.map((profile) => (
                  <div key={profile.user_id} className="p-3 rounded-lg border mb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile.avatar_url} />
                          <AvatarFallback>
                            {profile.display_name?.slice(0, 2).toUpperCase() || 
                             profile.username?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {profile.display_name || profile.username}
                          </p>
                          <p className={`text-xs ${getMembershipColor(profile.membership_type)}`}>
                            @{profile.username}
                          </p>
                        </div>
                      </div>
                      
                      {!isExistingConnection(profile.user_id) && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => sendFriendRequest(profile.user_id)}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {searchTerm && searchResults.length === 0 && !isSearching && (
                  <div className="text-center text-muted-foreground py-8">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No users found</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-120px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-80 border-r bg-card">
          <SidebarContent />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="left" className="w-80 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-card flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setIsSidebarOpen(true)}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                  
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedRoom.other_user?.avatar_url} />
                    <AvatarFallback>
                      {selectedRoom.other_user?.display_name?.slice(0, 2).toUpperCase() || 
                       selectedRoom.other_user?.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold">
                      {selectedRoom.other_user?.display_name || selectedRoom.other_user?.username}
                    </h3>
                    <p className={`text-xs ${getMembershipColor(selectedRoom.other_user?.membership_type || 'regular')}`}>
                      @{selectedRoom.other_user?.username}
                    </p>
                  </div>
                </div>
                
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${message.sender_id === user?.id ? 'order-1' : 'order-2'}`}>
                        {message.sender_id !== user?.id && (
                          <div className="flex items-center space-x-2 mb-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={message.sender?.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {message.sender?.display_name?.slice(0, 2).toUpperCase() || 
                                 message.sender?.username?.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className={`text-xs font-medium ${getMembershipColor(message.sender?.membership_type || 'regular')}`}>
                              {message.sender?.display_name || message.sender?.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                        
                        <div
                          className={`p-3 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          {message.sender_id === user?.id && (
                            <span className="text-xs opacity-70 block mt-1">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-card">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden mb-4"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
                
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Welcome to Messages</h3>
                <p className="text-sm mb-4">Select a conversation to start chatting</p>
                
                <Button 
                  variant="outline" 
                  className="md:hidden"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4 mr-2" />
                  Open Menu
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;