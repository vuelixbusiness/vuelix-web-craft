import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import AuthenticatedRoute from '@/components/AuthenticatedRoute';

export default function CampaignNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    track_url: '',
    bounty_cents: '',
    budget_cents: '',
    start_at: '',
    end_at: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadCover = async (): Promise<string | null> => {
    if (!coverFile || !user) return null;

    const fileExt = coverFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('campaign-covers')
      .upload(filePath, coverFile);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('campaign-covers')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    // Validation
    if (!formData.title || !formData.description || !formData.bounty_cents || !formData.budget_cents || !formData.start_at || !formData.end_at) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const bounty = parseInt(formData.bounty_cents);
    const budget = parseInt(formData.budget_cents);

    if (isNaN(bounty) || bounty < 0) {
      toast({
        title: 'Invalid bounty',
        description: 'Bounty must be a valid number',
        variant: 'destructive'
      });
      return;
    }

    if (isNaN(budget) || budget < 0) {
      toast({
        title: 'Invalid budget',
        description: 'Budget must be a valid number',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);

      const coverUrl = await uploadCover();

      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          owner_id: user.id,
          artist_id: user.id,
          title: formData.title,
          description: formData.description,
          track_url: formData.track_url || null,
          song_url: formData.track_url || null,
          cover_url: coverUrl,
          cover_art_url: coverUrl,
          bounty_cents: bounty,
          budget_cents: budget,
          budget: budget / 100,
          start_at: new Date(formData.start_at).toISOString(),
          end_at: new Date(formData.end_at).toISOString(),
          end_date: new Date(formData.end_at).toISOString(),
          status: 'live',
          campaign_type: 'bounty',
          song_title: formData.title,
          genre: 'various',
          platforms: ['youtube']
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Campaign created successfully'
      });

      navigate(`/campaign/${data.id}`);
    } catch (error: any) {
      toast({
        title: 'Error creating campaign',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthenticatedRoute>
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Button variant="outline" onClick={() => navigate('/campaigns')} className="mb-6">
            ← Back to Campaigns
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
              <CardDescription>
                Set up your music campaign and start connecting with creators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Campaign Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter campaign title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your campaign..."
                    rows={5}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cover">Cover Image</Label>
                  <div className="space-y-4">
                    {coverPreview && (
                      <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                        <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <Button type="button" variant="outline" asChild>
                        <label htmlFor="cover-upload" className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Cover
                          <input
                            id="cover-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </Button>
                      {coverFile && <span className="text-sm text-muted-foreground">{coverFile.name}</span>}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="track_url">Track URL</Label>
                  <Input
                    id="track_url"
                    type="url"
                    value={formData.track_url}
                    onChange={(e) => setFormData({ ...formData, track_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bounty">Bounty (cents) *</Label>
                    <Input
                      id="bounty"
                      type="number"
                      min="0"
                      value={formData.bounty_cents}
                      onChange={(e) => setFormData({ ...formData, bounty_cents: e.target.value })}
                      placeholder="1000"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.bounty_cents ? `$${(parseInt(formData.bounty_cents) / 100).toFixed(2)}` : '$0.00'}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="budget">Budget (cents) *</Label>
                    <Input
                      id="budget"
                      type="number"
                      min="0"
                      value={formData.budget_cents}
                      onChange={(e) => setFormData({ ...formData, budget_cents: e.target.value })}
                      placeholder="10000"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.budget_cents ? `$${(parseInt(formData.budget_cents) / 100).toFixed(2)}` : '$0.00'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_at">Start Date *</Label>
                    <Input
                      id="start_at"
                      type="datetime-local"
                      value={formData.start_at}
                      onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_at">End Date *</Label>
                    <Input
                      id="end_at"
                      type="datetime-local"
                      value={formData.end_at}
                      onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Campaign...
                    </>
                  ) : (
                    'Create Campaign'
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
