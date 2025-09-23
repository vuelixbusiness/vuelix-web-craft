import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  AlertTriangle,
  Users,
  DollarSign,
  Calendar,
  Save,
  X
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  genre: string;
  budget: number;
  payout_rate: number;
  max_payout?: number;
  vip_max_payout?: number;
  status: string;
  end_date?: string;
  created_at: string;
  instructions?: string;
  platforms: string[];
  campaign_type: string;
  cover_art_url?: string;
}

interface Participation {
  id: string;
  creator_id: string;
  status: string;
  video_url: string;
  platform: string;
  current_views: number;
  current_likes: number;
  payout_amount: number;
  created_at: string;
}

export default function CampaignManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    song_title: "",
    budget: "",
    payout_rate: "",
    max_payout: "",
    vip_max_payout: "",
    instructions: "",
    end_date: ""
  });

  useEffect(() => {
    if (id) {
      fetchCampaignData();
    }
  }, [id]);

  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      
      // Fetch campaign details
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (campaignError) throw campaignError;
      setCampaign(campaignData);
      
      // Initialize edit form with campaign data
      setEditForm({
        title: campaignData.title || "",
        song_title: campaignData.song_title || "",
        budget: campaignData.budget?.toString() || "",
        payout_rate: campaignData.payout_rate?.toString() || "",
        max_payout: campaignData.max_payout?.toString() || "",
        vip_max_payout: campaignData.vip_max_payout?.toString() || "",
        instructions: campaignData.instructions || "",
        end_date: campaignData.end_date ? new Date(campaignData.end_date).toISOString().split('T')[0] : ""
      });

      // Fetch participations
      const { data: participationData, error: participationError } = await supabase
        .from('campaign_participations')
        .select('*')
        .eq('campaign_id', id);

      if (participationError) throw participationError;
      setParticipations(participationData || []);

    } catch (error) {
      console.error('Error fetching campaign data:', error);
      toast({
        title: "Error",
        description: "Failed to load campaign data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCampaignStatus = async (newStatus: string) => {
    if (!campaign) return;
    
    try {
      setActionLoading(true);
      
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', campaign.id);

      if (error) throw error;

      setCampaign({ ...campaign, status: newStatus });
      
      toast({
        title: "Success",
        description: `Campaign ${newStatus === 'active' ? 'resumed' : newStatus} successfully`,
      });
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast({
        title: "Error",
        description: "Failed to update campaign status",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const updateCampaign = async () => {
    if (!campaign) return;
    
    try {
      setActionLoading(true);
      
      const updatedData = {
        title: editForm.title,
        song_title: editForm.song_title,
        budget: parseFloat(editForm.budget),
        payout_rate: parseFloat(editForm.payout_rate),
        max_payout: editForm.max_payout ? parseFloat(editForm.max_payout) : null,
        vip_max_payout: editForm.vip_max_payout ? parseFloat(editForm.vip_max_payout) : null,
        instructions: editForm.instructions,
        end_date: editForm.end_date ? new Date(editForm.end_date).toISOString() : null
      };

      const { error } = await supabase
        .from('campaigns')
        .update(updatedData)
        .eq('id', campaign.id);

      if (error) throw error;

      setCampaign({ ...campaign, ...updatedData });
      setEditModalOpen(false);
      
      toast({
        title: "Success",
        description: "Campaign updated successfully",
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast({
        title: "Error",
        description: "Failed to update campaign",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default" as const, label: "Active" },
      paused: { variant: "secondary" as const, label: "Paused" },
      terminated: { variant: "destructive" as const, label: "Terminated" },
      completed: { variant: "outline" as const, label: "Completed" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Campaign not found</h2>
        <Button onClick={() => navigate('/artist-dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const activeParticipations = participations.filter(p => p.status === 'active').length;
  const totalPayout = participations.reduce((sum, p) => sum + (p.payout_amount || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/artist-dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{campaign.title}</h1>
          <p className="text-muted-foreground">Campaign Management</p>
        </div>
      </div>

      {/* Campaign Status & Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                Campaign Status
                {getStatusBadge(campaign.status)}
              </CardTitle>
              <CardDescription>
                Manage your campaign status and settings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {campaign.status === 'active' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={actionLoading}>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Campaign
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Pause Campaign</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will pause the campaign and prevent new creators from joining. 
                      Existing participants can still submit content. You can resume the campaign later.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => updateCampaignStatus('paused')}>
                      Pause Campaign
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {campaign.status === 'paused' && (
              <Button 
                onClick={() => updateCampaignStatus('active')}
                disabled={actionLoading}
              >
                <Play className="w-4 h-4 mr-2" />
                Resume Campaign
              </Button>
            )}

            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Campaign</DialogTitle>
                  <DialogDescription>
                    Update your campaign details and settings.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Campaign Title</Label>
                      <Input
                        id="title"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        placeholder="Enter campaign title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="song_title">Song Title</Label>
                      <Input
                        id="song_title"
                        value={editForm.song_title}
                        onChange={(e) => setEditForm({ ...editForm, song_title: e.target.value })}
                        placeholder="Enter song title"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget ($)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={editForm.budget}
                        onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payout_rate">Payout Rate ($ per 1k views)</Label>
                      <Input
                        id="payout_rate"
                        type="number"
                        value={editForm.payout_rate}
                        onChange={(e) => setEditForm({ ...editForm, payout_rate: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_payout">Max Payout ($)</Label>
                      <Input
                        id="max_payout"
                        type="number"
                        value={editForm.max_payout}
                        onChange={(e) => setEditForm({ ...editForm, max_payout: e.target.value })}
                        placeholder="Optional"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vip_max_payout">VIP Max Payout ($)</Label>
                      <Input
                        id="vip_max_payout"
                        type="number"
                        value={editForm.vip_max_payout}
                        onChange={(e) => setEditForm({ ...editForm, vip_max_payout: e.target.value })}
                        placeholder="Optional"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={editForm.end_date}
                      onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={editForm.instructions}
                      onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
                      placeholder="Provide detailed instructions for creators..."
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={updateCampaign} disabled={actionLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {campaign.status !== 'terminated' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={actionLoading}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Terminate Campaign
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      Terminate Campaign
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      <strong>Warning:</strong> This action cannot be undone. Terminating the campaign will:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Stop all new participations immediately</li>
                        <li>Process final payouts for existing participants</li>
                        <li>Mark the campaign as permanently closed</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => updateCampaignStatus('terminated')}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Terminate Campaign
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{activeParticipations}</p>
                <p className="text-sm text-muted-foreground">Active Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">${totalPayout.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Payouts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">${campaign.budget}</p>
                <p className="text-sm text-muted-foreground">Total Budget</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Song Title</label>
              <p className="font-medium">{campaign.song_title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Genre</label>
              <p className="font-medium">{campaign.genre}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Payout Rate</label>
              <p className="font-medium">${campaign.payout_rate} per 1k views</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Max Payout</label>
              <p className="font-medium">${campaign.max_payout || 'Unlimited'}</p>
            </div>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium text-muted-foreground">Platforms</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {campaign.platforms.map((platform) => (
                <Badge key={platform} variant="secondary">
                  {platform}
                </Badge>
              ))}
            </div>
          </div>

          {campaign.instructions && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Instructions</label>
                <p className="mt-1 text-sm">{campaign.instructions}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Participants Management */}
      {participations.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Participants ({participations.length})</CardTitle>
            <CardDescription>
              Manage campaign participants and track their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {participations.map((participation) => (
                <div 
                  key={participation.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{participation.platform}</Badge>
                      <Badge variant={participation.status === 'active' ? 'default' : 'secondary'}>
                        {participation.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {participation.current_views} views • {participation.current_likes} likes
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${participation.payout_amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Earned</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}