import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { CreditCard, Mail } from 'lucide-react';

interface PaymentMethods {
  stripe_account_status: string;
  stripe_account_id: string | null;
  paypal_account_status: string;
  paypal_email: string | null;
}

const PaymentMethodsManager = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods | null>(null);
  const [loading, setLoading] = useState(true);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('stripe_account_status, stripe_account_id, paypal_account_status, paypal_email')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching payment methods:', error);
        return;
      }

      setPaymentMethods(data);
      setPaypalEmail(data.paypal_email || '');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectStripe = async () => {
    // In a real implementation, this would redirect to Stripe Connect
    // For now, we'll simulate the connection
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          stripe_account_status: 'connected',
          stripe_account_id: 'acct_' + Math.random().toString(36).substring(2, 15)
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stripe account connected successfully",
      });
      
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      toast({
        title: "Error",
        description: "Failed to connect Stripe account",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const updatePaypalEmail = async () => {
    if (!paypalEmail || !paypalEmail.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid PayPal email address",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          paypal_email: paypalEmail,
          paypal_account_status: 'connected'
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "PayPal account updated successfully",
      });
      
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error updating PayPal:', error);
      toast({
        title: "Error",
        description: "Failed to update PayPal account",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div>Loading payment methods...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Payment Methods</h2>
        <p className="text-muted-foreground">Connect your payment accounts to receive payouts</p>
      </div>

      {/* Stripe Connect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Stripe
          </CardTitle>
          <CardDescription>
            Connect your Stripe account to receive payments via bank transfer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={paymentMethods?.stripe_account_status === 'connected' ? 'default' : 'secondary'}>
                {paymentMethods?.stripe_account_status === 'connected' ? 'Connected' : 'Not Connected'}
              </Badge>
              {paymentMethods?.stripe_account_id && (
                <span className="text-sm text-muted-foreground">
                  ID: {paymentMethods.stripe_account_id}
                </span>
              )}
            </div>
            {paymentMethods?.stripe_account_status !== 'connected' && (
              <Button onClick={connectStripe} disabled={updating}>
                {updating ? 'Connecting...' : 'Connect Stripe'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PayPal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            PayPal
          </CardTitle>
          <CardDescription>
            Enter your PayPal email to receive payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={paymentMethods?.paypal_account_status === 'connected' ? 'default' : 'secondary'}>
                {paymentMethods?.paypal_account_status === 'connected' ? 'Connected' : 'Not Connected'}
              </Badge>
              {paymentMethods?.paypal_email && (
                <span className="text-sm text-muted-foreground">
                  {paymentMethods.paypal_email}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="paypal-email">PayPal Email</Label>
                <Input
                  id="paypal-email"
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="your-email@example.com"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={updatePaypalEmail} disabled={updating}>
                  {updating ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentMethodsManager;