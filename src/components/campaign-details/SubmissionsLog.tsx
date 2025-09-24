import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Heart, ExternalLink, Download, Search, Filter } from 'lucide-react';

interface Submission {
  id: string;
  creator_id: string;
  video_url: string;
  platform: string;
  current_views: number;
  current_likes: number;
  initial_views: number;
  initial_likes: number;
  status: string;
  payout_amount: number;
  payout_claimed: boolean;
  created_at: string;
  last_tracked_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface SubmissionsLogProps {
  submissions: Submission[];
}

const SubmissionsLog = ({ submissions }: SubmissionsLogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      case 'live':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getEngagementGrowth = (current: number, initial: number) => {
    if (initial === 0) return current;
    return current - initial;
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = !searchTerm || 
      submission.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || submission.platform === platformFilter;
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const uniquePlatforms = Array.from(new Set(submissions.map(s => s.platform)));
  const uniqueStatuses = Array.from(new Set(submissions.map(s => s.status)));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Complete Submissions Log</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {uniqueStatuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {uniquePlatforms.map(platform => (
                <SelectItem key={platform} value={platform}>{platform}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ExternalLink className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No submissions found</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creator</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Payout</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => {
                  const viewsGrowth = getEngagementGrowth(submission.current_views, submission.initial_views);
                  const likesGrowth = getEngagementGrowth(submission.current_likes, submission.initial_likes);
                  
                  return (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={submission.profiles?.avatar_url || ''} />
                            <AvatarFallback>
                              {submission.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {submission.profiles?.display_name || submission.profiles?.username}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              @{submission.profiles?.username}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-sm">
                        {formatDate(submission.created_at)}
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline">{submission.platform}</Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {submission.current_views.toLocaleString()}
                          </span>
                          {viewsGrowth > 0 && (
                            <span className="text-xs text-green-600">
                              (+{viewsGrowth.toLocaleString()})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {submission.current_likes.toLocaleString()}
                          </span>
                          {likesGrowth > 0 && (
                            <span className="text-xs text-green-600">
                              (+{likesGrowth.toLocaleString()})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="font-medium text-primary">
                            {formatCurrency(submission.payout_amount)}
                          </p>
                          {submission.payout_claimed && (
                            <p className="text-xs text-muted-foreground">Claimed</p>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(submission.last_tracked_at)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(submission.video_url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubmissionsLog;