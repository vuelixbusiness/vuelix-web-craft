import { useState } from "react";
import { Send, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Campaign {
  id: string;
  title: string;
  artist_id: string;
}

interface CommunicationSectionProps {
  campaign: Campaign;
}

// Mock data for demonstration
const mockMessages = [
  {
    id: "1",
    sender: "artist",
    content: "Welcome to the campaign! Looking forward to seeing your creative content. If you have any questions, feel free to ask here.",
    timestamp: "2024-01-15T10:00:00Z",
    senderName: "Artist Name"
  },
  {
    id: "2", 
    sender: "user",
    content: "Thanks! I'm excited to participate. Quick question about the hashtags - should I include them in the caption or can they be in the comments?",
    timestamp: "2024-01-15T14:30:00Z",
    senderName: "You"
  },
  {
    id: "3",
    sender: "artist", 
    content: "Great question! Please include the hashtags directly in your caption for better visibility. Looking forward to your submission!",
    timestamp: "2024-01-15T15:45:00Z",
    senderName: "Artist Name"
  }
];

export function CommunicationSection({ campaign }: CommunicationSectionProps) {
  const [newMessage, setNewMessage] = useState("");
  const [messages] = useState(mockMessages);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // TODO: Implement actual message sending
    console.log("Sending message:", newMessage);
    setNewMessage("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Communication</h2>
        <p className="text-muted-foreground">
          Direct chat with the artist for this campaign.
        </p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Campaign Chat
            <Badge variant="secondary" className="ml-auto">
              Artist Available
            </Badge>
          </CardTitle>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {message.senderName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className={`flex-1 max-w-[70%] ${message.sender === 'user' ? 'text-right' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{message.senderName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className={`p-3 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[80px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              onClick={handleSendMessage}
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