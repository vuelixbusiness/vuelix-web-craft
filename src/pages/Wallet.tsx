import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Wallet as WalletIcon, TrendingUp, Download, Plus, CreditCard, Clock, Send, AlertCircle, X } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  campaign_id?: string;
}

interface WalletData {
  id: string;
  balance: number;
  currency: string;
  updated_at: string;
}

interface PayoutRequest {
  id: string;
  amount: number;
  method: string;
  status: string;
  created_at: string;
}

const Wallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Available balance calculation - use demo data for testing if no real wallet
  const availableBalance = wallet?.balance || 250.75; // Demo balance for testing
  const pendingEarnings = payoutRequests
    .filter(req => req.status === 'requested')
    .reduce((sum, req) => sum + req.amount, 0);
  const totalEarned = transactions
    .filter(t => t.type === 'reward')
    .reduce((sum, t) => sum + t.amount, 0);

  const fetchData = async () => {
    if (!user?.id) return;

    try {
      // Fetch wallet data
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (walletError) {
        console.error('Wallet fetch error:', walletError);
      } else if (walletData) {
        setWallet(walletData);
      }

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (transactionsError) {
        console.error('Transactions fetch error:', transactionsError);
      } else {
        setTransactions(transactionsData || []);
      }

      // Fetch payout requests
      const { data: payoutData, error: payoutError } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (payoutError) {
        console.error('Payout requests fetch error:', payoutError);
      } else {
        setPayoutRequests(payoutData || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch wallet data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayoutRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to request a payout",
        variant: "destructive",
      });
      return;
    }

    // Validate payout amount
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payout amount",
        variant: "destructive",
      });
      return;
    }

    if (amount < 5) {
      toast({
        title: "Minimum Amount Required",
        description: "Minimum payout amount is $5.00",
        variant: "destructive",
      });
      return;
    }

    if (amount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Payout amount exceeds available balance",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if user has a profile first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id, stripe_account_status, paypal_account_status')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        toast({
          title: "Profile Required",
          description: "Please complete your profile setup first",
          variant: "destructive",
        });
        return;
      }

      // Check if payment method is connected
      if (payoutMethod === 'stripe' && profile.stripe_account_status !== 'connected') {
        toast({
          title: "Payment Method Required",
          description: "Please connect your Stripe account first in Payment Methods",
          variant: "destructive",
        });
        return;
      }

      if (payoutMethod === 'paypal' && profile.paypal_account_status !== 'connected') {
        toast({
          title: "Payment Method Required", 
          description: "Please connect your PayPal account first in Payment Methods",
          variant: "destructive",
        });
        return;
      }

      // Ensure user has a wallet
      let { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (walletError && walletError.code === 'PGRST116') {
        // Wallet doesn't exist, create one
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({
            user_id: user.id,
            balance: 100.00, // Initial balance for testing
            currency: 'USD'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating wallet:', createError);
          toast({
            title: "Error",
            description: "Failed to create wallet. Please try again.",
            variant: "destructive",
          });
          return;
        }
        wallet = newWallet;
      } else if (walletError) {
        console.error('Error fetching wallet:', walletError);
        toast({
          title: "Error",
          description: "Failed to access wallet information",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('payout_requests')
        .insert({
          user_id: user.id,
          amount: amount,
          method: payoutMethod,
          status: 'requested'
        });

      if (error) {
        console.error('Error creating payout request:', error);
        toast({
          title: "Error",
          description: `Failed to create payout request: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Payout request submitted successfully",
      });

      setPayoutAmount('');
      setPayoutMethod('stripe');
      setShowPayoutForm(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error submitting payout request:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  // Demo transaction data for UI preview
  const demoTransactions: Transaction[] = [
    { id: '1', type: 'reward', amount: 125.50, status: 'completed', created_at: '2024-01-15T10:30:00Z', campaign_id: 'camp1' },
    { id: '2', type: 'membership', amount: 19.99, status: 'completed', created_at: '2024-01-14T14:22:00Z' },
    { id: '3', type: 'payout', amount: 500.00, status: 'completed', created_at: '2024-01-13T09:15:00Z' },
    { id: '4', type: 'reward', amount: 89.25, status: 'completed', created_at: '2024-01-12T16:45:00Z', campaign_id: 'camp2' },
    { id: '5', type: 'payment', amount: 25.00, status: 'completed', created_at: '2024-01-11T11:30:00Z' },
    { id: '6', type: 'reward', amount: 203.75, status: 'completed', created_at: '2024-01-10T13:20:00Z', campaign_id: 'camp3' },
    { id: '7', type: 'fee', amount: 5.99, status: 'completed', created_at: '2024-01-09T08:45:00Z' },
    { id: '8', type: 'bonus', amount: 50.00, status: 'completed', created_at: '2024-01-08T17:10:00Z' },
    { id: '9', type: 'withdrawal', amount: 100.00, status: 'pending', created_at: '2024-01-07T12:00:00Z' },
    { id: '10', type: 'reward', amount: 78.50, status: 'completed', created_at: '2024-01-06T15:30:00Z', campaign_id: 'camp4' },
    { id: '11', type: 'membership', amount: 19.99, status: 'completed', created_at: '2024-01-05T10:15:00Z' },
    { id: '12', type: 'refund', amount: 35.00, status: 'completed', created_at: '2024-01-04T14:45:00Z' },
    { id: '13', type: 'reward', amount: 156.80, status: 'completed', created_at: '2024-01-03T11:20:00Z', campaign_id: 'camp5' },
    { id: '14', type: 'payment', amount: 42.50, status: 'failed', created_at: '2024-01-02T09:30:00Z' },
    { id: '15', type: 'reward', amount: 92.00, status: 'completed', created_at: '2024-01-01T16:00:00Z', campaign_id: 'camp6' },
  ];

  // Use demo transactions for UI preview, fallback to real transactions
  const displayTransactions = transactions.length > 0 ? transactions : demoTransactions;

  // Determine if transaction is a credit (money in) or debit (money out)
  const getTransactionType = (transactionType: string) => {
    const creditTypes = ['reward', 'payout', 'refund', 'bonus'];
    const debitTypes = ['payment', 'membership', 'withdrawal', 'fee'];
    
    if (creditTypes.includes(transactionType.toLowerCase())) {
      return 'credit';
    } else if (debitTypes.includes(transactionType.toLowerCase())) {
      return 'debit';
    }
    // Default to credit for unknown types (can be adjusted based on business logic)
    return 'credit';
  };

  const getTransactionDisplay = (transaction: Transaction) => {
    const type = getTransactionType(transaction.type);
    const isCredit = type === 'credit';
    
    return {
      isCredit,
      sign: isCredit ? '+' : '-',
      color: isCredit ? 'text-green-500' : 'text-red-500',
      amount: Math.abs(transaction.amount) // Always show absolute value, sign is handled separately
    };
  };

  const balanceCards = [
    {
      title: 'Available Balance',
      amount: formatCurrency(availableBalance),
      description: 'Ready to withdraw',
      icon: WalletIcon,
      color: 'text-green-500',
    },
    {
      title: 'Pending Earnings',
      amount: formatCurrency(pendingEarnings),
      description: 'Processing payments',
      icon: Clock,
      color: 'text-yellow-500',
    },
    {
      title: 'Total Earned',
      amount: formatCurrency(totalEarned),
      description: 'All-time earnings',
      icon: TrendingUp,
      color: 'text-blue-500',
    },
  ];

  if (!user) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Wallet</h1>
              <p className="text-muted-foreground">Please log in to access your wallet</p>
            </div>
            <Card className="p-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground mb-4">
                You need to be logged in to access your wallet and manage your earnings.
              </p>
              <Button asChild>
                <Link to="/login">Log In</Link>
              </Button>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Wallet</h1>
            <p className="text-muted-foreground">
              Manage your earnings and transactions
            </p>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {balanceCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <Card key={index} className="shadow-soft hover:shadow-elegant transition-smooth">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </CardTitle>
                    <IconComponent className={`w-5 h-5 ${card.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1">{card.amount}</div>
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Button 
              className="h-12 bg-gradient-primary hover:opacity-90 transition-smooth"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (!user) {
                  toast({
                    title: "Authentication Required",
                    description: "Please log in to request a payout",
                    variant: "destructive",
                  });
                  return;
                }
                
                if (availableBalance <= 0) {
                  toast({
                    title: "Insufficient Balance",
                    description: "You need a positive balance to request a payout",
                    variant: "destructive",
                  });
                  return;
                }
                
                setShowPayoutForm(true);
                
                // Scroll to form
                setTimeout(() => {
                  const formElement = document.querySelector('[data-payout-form]');
                  if (formElement) {
                    formElement.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'start' 
                    });
                  }
                }, 200);
              }}
              disabled={!user || availableBalance <= 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Request Payout
            </Button>
            <Button variant="outline" className="h-12" asChild>
              <Link to="/payment-methods">
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Link>
            </Button>
          </div>

          {/* Payout Request Form */}
          {showPayoutForm && (
            <Card 
              data-payout-form="true"
              className="mb-8 border-2 border-primary/20 shadow-glow animate-in slide-in-from-top-4 duration-300"
            >
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-primary" />
                    Request Payout
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPayoutForm(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Request a withdrawal from your available balance of {formatCurrency(availableBalance)}
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handlePayoutRequest} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-sm font-medium">
                        Amount to withdraw
                      </Label>
                      <div className="relative">
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={availableBalance}
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          placeholder="0.00"
                          className="pl-8"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Maximum: {formatCurrency(availableBalance)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="method" className="text-sm font-medium">
                        Payout method
                      </Label>
                      <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stripe">Stripe</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPayoutForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmittingPayout}
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      {isSubmittingPayout ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Request
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Recent Payout Requests */}
          {payoutRequests.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Recent Payout Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payoutRequests.slice(0, 5).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Download className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{formatCurrency(request.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.method} • {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          request.status === 'completed'
                            ? 'default'
                            : request.status === 'requested'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayTransactions.map((transaction) => {
                  const display = getTransactionDisplay(transaction);
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <CreditCard className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{transaction.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${display.color}`}>
                          {display.sign}{formatCurrency(display.amount)}
                        </p>
                        <Badge
                          variant={
                            transaction.status === 'completed'
                              ? 'default'
                              : transaction.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your payment methods for receiving payouts
              </p>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <Link to="/payment-methods">
                  <Plus className="w-4 h-4 mr-2" />
                  Manage Payment Methods
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Wallet;