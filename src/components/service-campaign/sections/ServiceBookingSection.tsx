import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Euro, Send } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  artist_id: string;
  starting_rate?: number;
  payout_rate: number;
}

interface ServiceBookingSectionProps {
  campaign: Campaign;
}

export function ServiceBookingSection({ campaign }: ServiceBookingSectionProps) {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRequest = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to request this service",
        variant: "destructive",
      });
      return;
    }

    if (!requirements.trim()) {
      toast({
        title: "Requirements Needed",
        description: "Please describe what you need",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a service request using campaign_participations
      const { error } = await supabase
        .from('campaign_participations')
        .insert({
          campaign_id: campaign.id,
          creator_id: user.id,
          status: 'pending',
          video_url: requirements, // Temporarily storing requirements here
          platform: 'service_request'
        });

      if (error) throw error;

      // Get user profile for activity
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('user_id', user.id)
        .single();

      // Create campaign activity
      await supabase
        .from('campaign_activities')
        .insert({
          campaign_id: campaign.id,
          user_id: user.id,
          activity_type: 'service_requested',
          title: 'New Service Request',
          message: `@${profile?.username || 'unknown'} requested this service`,
          priority: 'high',
          metadata: {
            requester_id: user.id,
            requirements: requirements
          }
        });

      toast({
        title: "Request Submitted!",
        description: "The service provider will review your request and get back to you soon.",
      });

      setRequirements("");
    } catch (error) {
      console.error('Error submitting service request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-3xl font-bold mb-2">Request Service</h2>
        <p className="text-muted-foreground">
          Describe what you need and submit your service request
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Starting Rate</p>
              <div className="flex items-center gap-1 text-2xl font-bold">
                <Euro className="h-5 w-5" />
                {campaign.starting_rate || campaign.payout_rate}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Delivery</p>
              <p className="font-semibold">3-5 days</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Describe Your Requirements *</Label>
            <Textarea
              id="requirements"
              placeholder="Tell me what you're feeling and I'll create a vision..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="min-h-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              Be as detailed as possible about what you need. Include reference links, mood descriptions, or specific requirements.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">What happens next?</h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">1.</span>
                  Your request will be reviewed by the service provider
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">2.</span>
                  You'll receive a custom quote and timeline
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">3.</span>
                  Once accepted, work begins on your project
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">4.</span>
                  Receive your completed work and provide feedback
                </li>
              </ol>
            </div>
          </div>

          <Button 
            onClick={handleSubmitRequest} 
            disabled={isSubmitting || !requirements.trim()}
            size="lg"
            className="w-full gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Have Questions?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Feel free to message the service provider directly to discuss your project before submitting a request.
          </p>
          <Button variant="outline" className="gap-2">
            Send Message
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
