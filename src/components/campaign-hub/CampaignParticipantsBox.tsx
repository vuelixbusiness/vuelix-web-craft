import { Users, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UniqueParticipant {
  creator_id: string;
  join_date: string;
  submission_count: number;
  platforms: string[];
  primary_platform: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface CampaignParticipantsBoxProps {
  participants: UniqueParticipant[];
  onViewAll?: () => void;
}

export function CampaignParticipantsBox({ participants, onViewAll }: CampaignParticipantsBoxProps) {
  const displayedParticipants = participants.slice(0, 4);
  const remainingCount = Math.max(0, participants.length - 4);

  if (participants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Campaign Participants</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No participants yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Campaign Participants</span>
          </CardTitle>
          <Badge variant="outline">{participants.length} Total</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedParticipants.map((participant) => (
            <div key={participant.creator_id} className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={participant.profiles?.avatar_url || ''} />
                  <AvatarFallback>
                    {participant.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {participant.profiles?.display_name || participant.profiles?.username}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {participant.primary_platform}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {participant.submission_count} submission{participant.submission_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {remainingCount > 0 && onViewAll && (
            <Button
              variant="ghost"
              onClick={onViewAll}
              className="w-full justify-center mt-3 text-sm"
            >
              View {remainingCount} more participants
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}