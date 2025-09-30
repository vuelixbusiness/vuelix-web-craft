import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle,
  Users,
  Send,
  Music,
  Hash
} from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  artist_id: string;
  cover_art_url?: string;
  genre?: string;
  status: string;
  artist_profile?: {
    display_name: string;
    username: string;
    avatar_url?: string;
  };
}

interface Profile {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  membership_type: string;
}

interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  requester_profile?: Profile;
  addressee_profile?: Profile;
}

interface ChatRoom {
  id: string;
  name: string;
  room_type: string;
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
  };
}

const ArtistRelations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('campaigns');
  const [isLoading, setIsLoading] = useState(true);
  
  // Campaign chats state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  
  // Messages state
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Fetch campaigns user has access to
  const fetchCampaigns = async () => {
    if (!user?.id) return;

    try {
      // Fetch campaigns where user is a participant
      const { data: participations, error: partError } = await supabase
        .from('campaign_participations')
        .select('campaign_id')
        .eq('creator_id', user.id)
        .in('status', ['joined', 'approved', 'live', 'submitted']);

      if (partError) throw partError;

      const campaignIds = participations?.map(p => p.campaign_id) || [];

      // Also fetch campaigns where user is the artist
      const { data: artistCampaigns, error: artistError } = await supabase
        .from('campaigns')
        .select('id')
        .eq('artist_id', user.id);

      if (artistError) throw artistError;

      const allCampaignIds = [...campaignIds, ...(artistCampaigns?.map(c => c.id) || [])];

      if (allCampaignIds.length === 0) {
        setCampaigns([]);
        return;
      }

      // Fetch campaign details
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select(`
          id,
          title,
          song_title,
          artist_id,
          cover_art_url,
          genre,
          status
        `)
        .in('id', allCampaignIds);

      if (campaignError) throw campaignError;

      // Fetch artist profiles
      const artistIds = [...new Set(campaignData?.map(c => c.artist_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url')
        .in('user_id', artistIds);

      const campaignsWithProfiles = campaignData?.map(campaign => ({
        ...campaign,
        artist_profile: profiles?.find(p => p.user_id === campaign.artist_id)
      })) || [];

      setCampaigns(campaignsWithProfiles as Campaign[]);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  // Fetch friendships
  const fetchFriendships = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) throw error;

      const userIds = data?.flatMap(f => [f.requester_id, f.addressee_id]) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, membership_type')
        .in('user_id', userIds);

      const friendshipsWithProfiles = data?.map(friendship => ({
        ...friendship,
        requester_profile: profiles?.find(p => p.user_id === friendship.requester_id),
        addressee_profile: profiles?.find(p => p.user_id === friendship.addressee_id)
      })) || [];

      setFriends(friendshipsWithProfiles as Friendship[]);
    } catch (error) {
      console.error('Error fetching friendships:', error);
    }
  };

  // Fetch chat rooms
  const fetchChatRooms = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('room_type', 'direct_message');

      if (error) throw error;

      const roomsWithProfiles = await Promise.all(
        (data || []).map(async (room) => {
          const { data: members } = await supabase
            .from('chat_room_members')
            .select('user_id')
            .eq('room_id', room.id);

          const otherUserId = members?.find(m => m.user_id !== user.id)?.user_id;
          
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
      setIsLoading(false);
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

      const senderIds = [...new Set(data?.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', senderIds);

      const messagesWithSenders = data?.map(message => ({
        ...message,
        sender: profiles?.find(p => p.user_id === message.sender_id)
      })) || [];

      setMessages(messagesWithSenders as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

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

  // Start direct message
  const startDirectMessage = async (otherUserId: string) => {
    try {
      const existingRoom = chatRooms.find(room => room.other_user?.user_id === otherUserId);
      
      if (existingRoom) {
        setSelectedRoom(existingRoom);
        await fetchMessages(existingRoom.id);
        return;
      }

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

      const { error: membersError } = await supabase
        .from('chat_room_members')
        .insert([
          { room_id: roomData.id, user_id: user?.id },
          { room_id: roomData.id, user_id: otherUserId }
        ]);

      if (membersError) throw membersError;

      await fetchChatRooms();
      
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
    } catch (error) {
      console.error('Error starting direct message:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation.",
        variant: "destructive",
      });
    }
  };

  const getFriendProfile = (friendship: Friendship): Profile | undefined => {
    return friendship.requester_id === user?.id 
      ? friendship.addressee_profile 
      : friendship.requester_profile;
  };

  useEffect(() => {
    if (user?.id) {
      fetchCampaigns();
      fetchFriendships();
      fetchChatRooms();
    }
  }, [user?.id]);

  if (isLoading) {
    return <div className="space-y-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Social Hub</h2>
          <p className="text-muted-foreground">Campaign communications and personal messages</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="campaigns">
            <Hash className="w-4 h-4 mr-2" />
            Campaign Chats
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageCircle className="w-4 h-4 mr-2" />
            Messages
          </TabsTrigger>
        </TabsList>

        {/* Campaign Chats Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          {campaigns.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Campaign Chats</h3>
                <p className="text-muted-foreground">
                  Join campaigns to access their group chats and communicate with other participants.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-smooth cursor-pointer"
                  onClick={() => navigate(`/campaign/${campaign.id}/join#communication`)}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      {campaign.cover_art_url ? (
                        <img 
                          src={campaign.cover_art_url} 
                          alt={campaign.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <Music className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{campaign.song_title}</CardTitle>
                        <CardDescription className="truncate">
                          by {campaign.artist_profile?.display_name || 'Unknown Artist'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {campaign.genre && (
                      <Badge variant="outline">{campaign.genre}</Badge>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <Button className="w-full" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Open Chat
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Friends List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Friends</CardTitle>
                <CardDescription>Your direct messages</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {friends.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No friends yet</p>
                      <p className="text-xs">Add friends to start messaging!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {friends.map((friendship) => {
                        const profile = getFriendProfile(friendship);
                        return (
                          <div
                            key={friendship.id}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedRoom?.other_user?.user_id === profile?.user_id
                                ? 'bg-primary/10 border border-primary/20'
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => {
                              if (profile?.user_id) {
                                startDirectMessage(profile.user_id);
                              }
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={profile?.avatar_url} />
                                <AvatarFallback>
                                  {profile?.display_name?.slice(0, 2).toUpperCase() || 
                                   profile?.username?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {profile?.display_name || profile?.username}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  @{profile?.username}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-2">
              <CardHeader>
                {selectedRoom && selectedRoom.other_user ? (
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedRoom.other_user.avatar_url} />
                      <AvatarFallback>
                        {selectedRoom.other_user.display_name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {selectedRoom.other_user.display_name}
                      </CardTitle>
                      <CardDescription>@{selectedRoom.other_user.username}</CardDescription>
                    </div>
                  </div>
                ) : (
                  <div>
                    <CardTitle className="text-lg">Messages</CardTitle>
                    <CardDescription>Select a friend to start chatting</CardDescription>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {selectedRoom ? (
                  <div className="space-y-4">
                    <ScrollArea className="h-[400px] border rounded-lg p-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-sm">No messages yet</p>
                          <p className="text-xs">Start the conversation!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  message.sender_id === user?.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {new Date(message.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button onClick={sendMessage} size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-[460px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Select a friend to view your conversation</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArtistRelations;