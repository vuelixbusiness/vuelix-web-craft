import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageCircle, User } from 'lucide-react';

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

interface ParticipantsListProps {
  participants: UniqueParticipant[];
}

const ParticipantsList = ({ participants }: ParticipantsListProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Campaign Participants</CardTitle>
          <div className="flex gap-2 text-sm">
            <Badge variant="outline">{participants.length} Total</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {participants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No participants yet</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creator</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.creator_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={participant.profiles?.avatar_url || ''} />
                          <AvatarFallback>
                            {participant.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {participant.profiles?.display_name || participant.profiles?.username}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            @{participant.profiles?.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(participant.join_date)}</TableCell>
                    <TableCell>
                      {participant.platforms.length === 1 ? (
                        <Badge variant="outline">{participant.primary_platform}</Badge>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline">{participant.primary_platform}</Badge>
                          <Badge variant="secondary" className="text-xs">
                            +{participant.platforms.length - 1}
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {participant.submission_count} submission{participant.submission_count !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ParticipantsList;