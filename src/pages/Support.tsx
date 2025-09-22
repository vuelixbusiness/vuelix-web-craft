import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  HelpCircle, 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Search
} from "lucide-react";

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const Support = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });

  const statusColors = {
    open: 'bg-blue-500',
    in_progress: 'bg-yellow-500',
    resolved: 'bg-green-500',
    closed: 'bg-gray-500'
  };

  const statusIcons = {
    open: AlertCircle,
    in_progress: Clock,
    resolved: CheckCircle,
    closed: CheckCircle
  };

  const fetchTickets = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch support tickets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || isSubmitting) return;

    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;

      setTickets(prev => [data, ...prev]);
      setFormData({ subject: '', message: '', priority: 'medium' });
      setShowNewTicket(false);
      
      toast({
        title: "Success",
        description: "Support ticket submitted successfully. We'll get back to you soon!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to submit support ticket",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user?.id]);

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
                <HelpCircle className="w-8 h-8 text-primary" />
                <span>Support Center</span>
              </h1>
              <p className="text-muted-foreground">
                Get help with your campaigns, payments, and account
              </p>
            </div>
            <Button onClick={() => setShowNewTicket(!showNewTicket)}>
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </div>

          {/* New Ticket Form */}
          {showNewTicket && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Create New Support Ticket</CardTitle>
                <CardDescription>
                  Describe your issue and we'll help you resolve it
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Brief description of your issue"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={formData.priority} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Please provide as much detail as possible about your issue..."
                      rows={5}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Ticket
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowNewTicket(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Search and Filter */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Support Tickets List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredTickets.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchTerm ? 'No matching tickets found' : 'No support tickets yet'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm 
                      ? 'Try adjusting your search terms'
                      : 'Create your first support ticket if you need help'
                    }
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setShowNewTicket(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Ticket
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredTickets.map((ticket) => {
                const StatusIcon = statusIcons[ticket.status as keyof typeof statusIcons];
                
                return (
                  <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium">{ticket.subject}</h3>
                            <Badge 
                              variant="secondary" 
                              className="flex items-center space-x-1"
                            >
                              <StatusIcon className="w-3 h-3" />
                              <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {ticket.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Ticket #{ticket.id.slice(-8)}</span>
                            <span>•</span>
                            <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${statusColors[ticket.status as keyof typeof statusColors]}`}></div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* FAQ Section */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Common issues and their solutions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">How do I track my video views?</h4>
                  <p className="text-sm text-muted-foreground">
                    Go to your dashboard and use the "Update Views" button on your submitted videos to fetch the latest metrics.
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">When will I receive my payment?</h4>
                  <p className="text-sm text-muted-foreground">
                    Payments are processed weekly. You can request a payout from your wallet once your earnings reach the minimum threshold.
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">How do I submit a video for a campaign?</h4>
                  <p className="text-sm text-muted-foreground">
                    Browse available campaigns, click "Join Campaign", and follow the instructions to submit your video URL.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Support;