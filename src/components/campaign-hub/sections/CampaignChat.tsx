import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Send, MessageCircle, Users, Pin, Search, Hash, User, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ClickableUsername } from "@/components/ui/clickable-username";

interface Campaign {
  id: string;
  title: string;
  artist_id: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_profile?: {
    display_name: string;
    username: string;
    avatar_url?: string;
    user_type: string;
  };
  is_pinned?: boolean;
}

interface ChatParticipant {
  user_id: string;
  profile: {
    display_name: string;
    username: string;
    avatar_url?: string;
    user_type: string;
  };
}

interface CampaignChatProps {
  campaign: Campaign;
  onMessageSent?: () => void;
}

export function CampaignChat({ campaign, onMessageSent }: CampaignChatProps) {
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("group");
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [groupRoomId, setGroupRoomId] = useState<string | null>(null);
  const [dmRoomId, setDmRoomId] = useState<string | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();

  // Allow chat to work from any authenticated context - focus on permissions, not routes
  const canInitializeChat = !authLoading && user;

  useEffect(() => {
    if (canInitializeChat) {
      setAuthError(null);
      initializeChatRooms();
    } else if (!authLoading && !user) {
      setAuthError("Authentication required to access campaign chat.");
      setLoading(false);
    }
  }, [canInitializeChat, campaign.id, authLoading, user]);

  useEffect(() => {
    const newActiveRoomId = activeTab === "group" ? groupRoomId : dmRoomId;
    setActiveRoomId(newActiveRoomId);
    if (newActiveRoomId) {
      loadMessages(newActiveRoomId);
    } else {
      setMessages([]);
    }
  }, [groupRoomId, dmRoomId, activeTab]);

  const initializeChatRooms = async () => {
    try {
      setLoading(true);
      
      // Double-check auth state before proceeding
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser || authUser.id !== user?.id) {
        console.error('Auth validation failed:', { authError, authUser: !!authUser, expectedUserId: user?.id });
        setAuthError("Authentication state mismatch. Please refresh the page.");
        setLoading(false);
        return;
      }

      // Check if group chat room exists for this campaign
      let { data: groupRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('name', `campaign_${campaign.id}_group`)
        .eq('room_type', 'campaign_group')
        .maybeSingle();

      if (!groupRoom) {

        // Create group chat room - use authenticated user as creator, RLS will handle access
        const { data: newGroupRoom, error: roomError } = await supabase
          .from('chat_rooms')
          .insert({
            name: `campaign_${campaign.id}_group`,
            room_type: 'campaign_group',
            created_by: authUser.id
          })
          .select('id')
          .single();
        
        if (roomError) {
          console.error('Error creating group room:', roomError);
          
          toast({
            title: "Access Error",
            description: `Failed to create group chat. ${roomError.code === '42501' ? 'You may not have permission to access this campaign.' : roomError.message}`,
            variant: "destructive"
          });
          return;
        }
        
        groupRoom = newGroupRoom;
      }

      if (groupRoom?.id) {
        setGroupRoomId(groupRoom.id);
        
        // Sync campaign participants with group chat members using our new function
        const { error: syncError } = await supabase.rpc('sync_campaign_chat_members', {
          _campaign_id: campaign.id,
          _room_id: groupRoom.id
        });

        if (syncError) {
          console.error('Error syncing chat members:', syncError);
          toast({
            title: "Warning",
            description: "Could not sync all participants to group chat",
            variant: "destructive"
          });
        } else {
          console.log('Successfully synced chat members for group room');
        }
      }

      // Check if DM room exists between current user and artist
      if (authUser.id !== campaign.artist_id) {
        let { data: dmRoom } = await supabase
          .from('chat_rooms')
          .select('id')
          .eq('name', `campaign_${campaign.id}_dm_${authUser.id}_${campaign.artist_id}`)
          .eq('room_type', 'campaign_dm')
          .maybeSingle();

        if (!dmRoom) {
          // Create DM room
          const dmRoomName = `campaign_${campaign.id}_dm_${authUser.id}_${campaign.artist_id}`;
          const { data: newDmRoom, error: dmError } = await supabase
            .from('chat_rooms')
            .insert({
              name: dmRoomName,
              room_type: 'campaign_dm',
              created_by: authUser.id
            })
            .select('id')
            .single();

          if (dmError) {
            console.error('Error creating DM room:', dmError);
            
            toast({
              title: "Access Error", 
              description: `Failed to create direct message room. ${dmError.code === '42501' ? 'You may not have permission to access this campaign.' : dmError.message}`,
              variant: "destructive"
            });
            return;
          }

          dmRoom = newDmRoom;

          // Add both users to the DM room
          if (dmRoom?.id) {
            const { error: memberError } = await supabase.from('chat_room_members').insert([
              { room_id: dmRoom.id, user_id: authUser.id },
              { room_id: dmRoom.id, user_id: campaign.artist_id }
            ]);

            if (memberError) {
              console.error('Error adding DM room members:', memberError);
            } else {
              console.log('Successfully added members to DM room');
            }
          }
        }

        setDmRoomId(dmRoom?.id || null);
      }

      loadParticipants();
    } catch (error) {
      console.error('Error initializing chat rooms:', error);
      toast({
        title: "Error",
        description: "Failed to initialize chat",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const { data: messagesData } = await supabase
        .from('messages')
        .select('id, content, created_at, sender_id')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (messagesData) {
        // Get unique sender IDs
        const senderIds = [...new Set(messagesData.map(m => m.sender_id))];
        
        // Fetch sender profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, username, avatar_url, user_type')
          .in('user_id', senderIds);

        // Map profiles to messages
        const messagesWithProfiles = messagesData.map(message => ({
          ...message,
          sender_profile: profiles?.find(p => p.user_id === message.sender_id)
        }));

        setMessages(messagesWithProfiles as Message[]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadParticipants = async () => {
    try {
      const { data: participantsData } = await supabase
        .from('campaign_participations')
        .select('creator_id')
        .eq('campaign_id', campaign.id);

      // Get all user IDs (participants + artist)
      const userIds = [
        ...(participantsData || []).map(p => p.creator_id),
        campaign.artist_id
      ];

      // Fetch all profiles at once
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url, user_type')
        .in('user_id', userIds);

      // Map profiles to participants
      const allParticipants = userIds
        .map(userId => ({
          user_id: userId,
          profile: profiles?.find(p => p.user_id === userId)
        }))
        .filter(p => p.profile) as ChatParticipant[];

      setParticipants(allParticipants);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeRoomId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('messages').insert({
        room_id: activeRoomId,
        sender_id: user.id,
        content: newMessage.trim(),
        message_type: 'text'
      });

      setNewMessage("");
      // Reload messages to show the new one
      loadMessages(activeRoomId);
      // Trigger section update callback
      onMessageSent?.();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isArtist = (userId: string) => userId === campaign.artist_id;

  // Show authentication error or loading states
  if (authError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <div>
            <h3 className="font-medium text-destructive">Chat Access Error</h3>
            <p className="text-sm text-muted-foreground">{authError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Campaign Chat</h2>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Campaign Chat – {campaign.title}</h2>
        <p className="text-muted-foreground">
          Connect with the artist and other creators in this campaign.
        </p>
      </div>

      {/* Participants Preview */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4" />
          <span className="font-medium">Participants ({participants.length})</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {participants.slice(0, 8).map((participant) => (
            <div key={participant.user_id} className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={participant.profile?.avatar_url} />
                <AvatarFallback className="text-xs">
                  {participant.profile?.display_name?.charAt(0) || participant.profile?.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {isArtist(participant.user_id) && (
                <Badge variant="secondary" className="text-xs">Artist</Badge>
              )}
            </div>
          ))}
          {participants.length > 8 && (
            <span className="text-sm text-muted-foreground">+{participants.length - 8} more</span>
          )}
        </div>
      </Card>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList>
                <TabsTrigger value="group" className="gap-2">
                  <Hash className="h-4 w-4" />
                  Group Chat
                </TabsTrigger>
                <TabsTrigger value="dm" className="gap-2">
                  <User className="h-4 w-4" />
                  Message Artist
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-48"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <div 
                key={message.id}
                className={`flex gap-3 ${message.sender_id === campaign.artist_id ? 'artist-message' : ''}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.sender_profile?.avatar_url} />
                  <AvatarFallback>
                    {message.sender_profile?.display_name?.charAt(0) || 
                     message.sender_profile?.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 max-w-[80%]">
                  <div className="flex items-center gap-2 mb-1">
                    <ClickableUsername
                      username={message.sender_profile?.username || ''}
                      displayName={message.sender_profile?.display_name}
                      showAt={false}
                      className="text-sm font-medium"
                    />
                    {isArtist(message.sender_id) && (
                      <Badge variant="default" className="text-xs">Artist</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                    {message.is_pinned && (
                      <Pin className="h-3 w-3 text-primary" />
                    )}
                  </div>
                  
                  <div className={`p-3 rounded-lg ${
                    isArtist(message.sender_id)
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder={activeTab === "group" ? "Message the group..." : "Message the artist..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button 
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </Card>
    </div>
  );
}