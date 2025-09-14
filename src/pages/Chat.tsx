import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Send, Users, MessageCircle, UserPlus, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardNav from "@/components/DashboardNav";
import { useNavigate } from "react-router-dom";

interface ChatRoom {
  id: string;
  name: string | null;
  room_type: string;
  created_at: string;
  other_user?: {
    username: string;
    display_name: string;
    membership_type: string;
    avatar_url?: string;
  };
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: {
    username: string;
    display_name: string;
    membership_type: string;
    avatar_url?: string;
  };
}

interface Profile {
  user_id: string;
  username: string;
  display_name: string;
  user_type: string;
  membership_type: string;
  avatar_url?: string;
}

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [showUsersList, setShowUsersList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Fetch chat rooms
  useEffect(() => {
    if (!user) return;
    fetchChatRooms();
  }, [user]);

  // Fetch messages when room is selected
  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom);
      subscribeToMessages(selectedRoom);
    }
  }, [selectedRoom]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch all users for friend requests
  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const fetchChatRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_room_members')
        .select(`
          room_id,
          chat_rooms (
            id,
            name,
            room_type,
            created_at
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      const rooms: ChatRoom[] = [];
      for (const item of data || []) {
        if (!item.chat_rooms) continue;
        
        let roomData: ChatRoom = {
          id: item.chat_rooms.id,
          name: item.chat_rooms.name,
          room_type: item.chat_rooms.room_type,
          created_at: item.chat_rooms.created_at,
        };

        // For direct messages, get the other user's info
        if (item.chat_rooms.room_type === 'direct') {
          // Get other user's profile by finding the other member in this room
          const { data: members } = await supabase
            .from('chat_room_members')
            .select('user_id')
            .eq('room_id', item.chat_rooms.id)
            .neq('user_id', user?.id);

          if (members && members.length > 0) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('username, display_name, membership_type, avatar_url')
              .eq('user_id', members[0].user_id)
              .single();

            if (profile) {
              roomData.other_user = {
                username: profile.username,
                display_name: profile.display_name,
                membership_type: profile.membership_type,
                avatar_url: profile.avatar_url,
              };
            }
          }
        }

        rooms.push(roomData);
      }

      setChatRooms(rooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load chat rooms",
        variant: "destructive",
      });
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, created_at, sender_id')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = [];
      
      for (const msg of data || []) {
        // Get sender profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name, membership_type, avatar_url')
          .eq('user_id', msg.sender_id)
          .single();

        if (profile) {
          formattedMessages.push({
            id: msg.id,
            content: msg.content,
            created_at: msg.created_at,
            sender: {
              username: profile.username,
              display_name: profile.display_name,
              membership_type: profile.membership_type,
              avatar_url: profile.avatar_url,
            }
          });
        }
      }

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = (roomId: string) => {
    const subscription = supabase
      .channel(`messages:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`
      }, async (payload) => {
        // Fetch the sender profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name, membership_type, avatar_url')
          .eq('user_id', payload.new.sender_id)
          .single();

        if (profile) {
          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            sender: {
              username: profile.username,
              display_name: profile.display_name,
              membership_type: profile.membership_type,
              avatar_url: profile.avatar_url,
            }
          };
          setMessages(prev => [...prev, newMessage]);
        }
      })
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, user_type, membership_type, avatar_url')
        .neq('user_id', user?.id)
        .eq('user_type', user?.type); // Only show same type (creators with creators, artists with artists)

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: selectedRoom,
          sender_id: user.id,
          content: newMessage.trim(),
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const startDirectMessage = async (otherUserId: string) => {
    try {
      // Check if room already exists
      const { data: existingRoom } = await supabase
        .from('chat_room_members')
        .select('room_id, chat_rooms!inner(room_type)')
        .eq('user_id', user?.id)
        .eq('chat_rooms.room_type', 'direct');

      let roomId = null;

      // Check if we already have a direct room with this user
      if (existingRoom) {
        for (const room of existingRoom) {
          const { data: otherMember } = await supabase
            .from('chat_room_members')
            .select('user_id')
            .eq('room_id', room.room_id)
            .eq('user_id', otherUserId);

          if (otherMember && otherMember.length > 0) {
            roomId = room.room_id;
            break;
          }
        }
      }

      // Create new room if doesn't exist
      if (!roomId) {
        const { data: newRoom, error: roomError } = await supabase
          .from('chat_rooms')
          .insert({
            room_type: 'direct',
            created_by: user?.id,
          })
          .select()
          .single();

        if (roomError) throw roomError;
        roomId = newRoom.id;

        // Add both users to the room
        const { error: membersError } = await supabase
          .from('chat_room_members')
          .insert([
            { room_id: roomId, user_id: user?.id },
            { room_id: roomId, user_id: otherUserId },
          ]);

        if (membersError) throw membersError;
      }

      // Refresh chat rooms and select the new/existing room
      await fetchChatRooms();
      setSelectedRoom(roomId);
      setShowUsersList(false);

      toast({
        title: "Success",
        description: "Chat started!",
      });
    } catch (error) {
      console.error('Error starting direct message:', error);
      toast({
        title: "Error",
        description: "Failed to start chat",
        variant: "destructive",
      });
    }
  };

  const getMembershipColor = (membershipType: string) => {
    return membershipType === 'premium' ? 'text-yellow-400' : 'text-gray-400';
  };

  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.room_type === 'direct' && room.other_user) {
      return room.other_user.display_name || room.other_user.username;
    }
    return room.name || `${room.room_type} Chat`;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav dashboardType={user.type} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
          {/* Sidebar - Chat Rooms */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Chats</span>
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowUsersList(!showUsersList)}
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {showUsersList ? (
                  <ScrollArea className="h-[480px]">
                    <div className="p-4 space-y-2">
                      <h4 className="text-sm font-medium mb-2">Start a chat with:</h4>
                      {users.map((profile) => (
                        <div
                          key={profile.user_id}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                          onClick={() => startDirectMessage(profile.user_id)}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={profile.avatar_url} />
                            <AvatarFallback>
                              {profile.display_name?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${getMembershipColor(profile.membership_type)}`}>
                                @{profile.username}
                              </span>
                              {profile.membership_type === 'premium' && (
                                <Crown className="w-3 h-3 text-yellow-400" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {profile.display_name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <ScrollArea className="h-[480px]">
                    <div className="space-y-1">
                      {chatRooms.map((room) => (
                        <div
                          key={room.id}
                          className={`p-4 cursor-pointer hover:bg-muted transition-smooth ${
                            selectedRoom === room.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedRoom(room.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={room.other_user?.avatar_url} />
                              <AvatarFallback>
                                {room.room_type === 'direct' ? 
                                  room.other_user?.display_name?.slice(0, 2).toUpperCase() : '👥'
                                }
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium truncate">
                                  {getRoomDisplayName(room)}
                                </p>
                                {room.other_user?.membership_type === 'premium' && (
                                  <Crown className="w-3 h-3 text-yellow-400" />
                                )}
                              </div>
                              {room.room_type === 'direct' && room.other_user && (
                                <p className={`text-xs ${getMembershipColor(room.other_user.membership_type)}`}>
                                  @{room.other_user.username}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {room.room_type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              {selectedRoom ? (
                <>
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center space-x-2">
                      <MessageCircle className="w-5 h-5" />
                      <span>
                        {chatRooms.find(r => r.id === selectedRoom) && 
                         getRoomDisplayName(chatRooms.find(r => r.id === selectedRoom)!)
                        }
                      </span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col p-0">
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex items-start space-x-3 ${
                              message.sender.username === user.username ? 'flex-row-reverse space-x-reverse' : ''
                            }`}
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={message.sender.avatar_url} />
                              <AvatarFallback>
                                {message.sender.display_name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`flex-1 ${message.sender.username === user.username ? 'text-right' : ''}`}>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`text-sm font-medium ${getMembershipColor(message.sender.membership_type)}`}>
                                  @{message.sender.username}
                                </span>
                                {message.sender.membership_type === 'premium' && (
                                  <Crown className="w-3 h-3 text-yellow-400" />
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(message.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className={`p-3 rounded-lg max-w-xs ${
                                message.sender.username === user.username
                                  ? 'bg-primary text-primary-foreground ml-auto'
                                  : 'bg-muted'
                              }`}>
                                <p className="text-sm">{message.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                    
                    <Separator />
                    
                    <div className="p-4">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Select a chat</h3>
                    <p className="text-muted-foreground">Choose a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;