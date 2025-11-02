import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import AuthenticatedRoute from '@/components/AuthenticatedRoute';

export default function CampaignEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    description: '',
    bounty_cents: '',
    budget_cents: '',
    start_at: '',
    end_at: '',
    status: 'live'
  });

  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data.owner_id !== user?.id && data.artist_id !== user?.id) {
        toast({
          title: 'Unauthorized',
          description: 'You can only edit your own campaigns',
          variant: 'destructive'
        });
        navigate(`/campaign/${id}`);
        return;
      }

      setFormData({
        description: data.description || '',
        bounty_cents: data.bounty_cents?.toString() || '',
        budget_cents: data.budget_cents?.toString() || '',
        start_at: data.start_at ? new Date(data.start_at).toISOString().slice(0, 16) : '',
        end_at: (data as any).end_at ? new Date((data as any).end_at).toISOString().slice(0, 16) : (data.end_date ? new Date(data.end_date).toISOString().slice(0, 16) : ''),
        status: data.status || 'live'
      });
    } catch (error: any) {
      toast({
        title: 'Error loading campaign',
        description: error.message,
        variant: 'destructive'
      });
      navigate('/campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bounty = parseInt(formData.bounty_cents);
    const budget = parseInt(formData.budget_cents);

    if (isNaN(bounty) || bounty < 0 || isNaN(budget) || budget < 0) {
      toast({
        title: 'Invalid values',
        description: 'Bounty and budget must be valid numbers',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('campaigns')
        .update({
          description: formData.description,
          bounty_cents: bounty,
          budget_cents: budget,
          budget: budget / 100,
          start_at: new Date(formData.start_at).toISOString(),
          end_at: new Date(formData.end_at).toISOString(),
          end_date: new Date(formData.end_at).toISOString(),
          status: formData.status
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Campaign updated successfully'
      });

      navigate(`/campaign/${id}`);
    } catch (error: any) {
      toast({
        title: 'Error updating campaign',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AuthenticatedRoute>
        <DashboardLayout>
          <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      </AuthenticatedRoute>
    );
  }

  return (
    <AuthenticatedRoute>
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Button variant="outline" onClick={() => navigate(`/campaign/${id}`)} className="mb-6">
            ← Back to Campaign
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Edit Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bounty">Bounty (cents)</Label>
                    <Input
                      id="bounty"
                      type="number"
                      min="0"
                      value={formData.bounty_cents}
                      onChange={(e) => setFormData({ ...formData, bounty_cents: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.bounty_cents ? `$${(parseInt(formData.bounty_cents) / 100).toFixed(2)}` : '$0.00'}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="budget">Budget (cents)</Label>
                    <Input
                      id="budget"
                      type="number"
                      min="0"
                      value={formData.budget_cents}
                      onChange={(e) => setFormData({ ...formData, budget_cents: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.budget_cents ? `$${(parseInt(formData.budget_cents) / 100).toFixed(2)}` : '$0.00'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_at">Start Date</Label>
                    <Input
                      id="start_at"
                      type="datetime-local"
                      value={formData.start_at}
                      onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_at">End Date</Label>
                    <Input
                      id="end_at"
                      type="datetime-local"
                      value={formData.end_at}
                      onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="ended">Ended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Campaign'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthenticatedRoute>
  );
}
