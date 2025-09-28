import { useState, useEffect } from "react";
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
import { Wallet as WalletIcon, TrendingUp, Download, Plus, CreditCard, Clock, Send, AlertCircle } from "lucide-react";

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
    if (!user?.id || isSubmittingPayout) return;

    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!payoutMethod) {
      toast({
        title: "Error",
        description: "Please select a payout method",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingPayout(true);

    try {
      const { data, error } = await supabase
        .from('payout_requests')
        .insert({
          user_id: user.id,
          amount: amount,
          method: payoutMethod,
          status: 'requested'
        })
        .select()
        .single();

      if (error) throw error;

      setPayoutRequests(prev => [data, ...prev]);
      setPayoutAmount("");
      setPayoutMethod("");
      setShowPayoutForm(false);
      
      toast({
        title: "Success",
        description: "Payout request submitted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit payout request",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const availableBalance = wallet?.balance || 0;
  const pendingEarnings = payoutRequests
    .filter(req => req.status === 'requested')
    .reduce((sum, req) => sum + req.amount, 0);
  const totalEarned = transactions
    .filter(t => t.type === 'reward')
    .reduce((sum, t) => sum + t.amount, 0);

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Button 
                className="h-12 bg-gradient-primary hover:opacity-90 transition-smooth"
                onClick={() => setShowPayoutForm(true)}
                disabled={availableBalance <= 0}
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
              <Button variant="outline" className="h-12">
                <CreditCard className="w-4 h-4 mr-2" />
                Payment History
              </Button>
              <Button variant="outline" className="h-12">
                <TrendingUp className="w-4 h-4 mr-2" />
                Earnings Report
              </Button>
            </div>

            {/* Payout Request Form */}
            {showPayoutForm && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Request Payout</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePayoutRequest} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          max={availableBalance}
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="method">Payment Method</Label>
                        <Select value={payoutMethod} onValueChange={setPayoutMethod} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="crypto">Cryptocurrency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Button type="submit" disabled={isSubmittingPayout}>
                        {isSubmittingPayout ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Request
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowPayoutForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Payout Requests */}
            {payoutRequests.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Recent Payout Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payoutRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                            <Download className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{formatCurrency(request.amount)} via {request.method}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Transaction History */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <WalletIcon className="w-5 h-5 text-primary" />
                <span>Transaction History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <WalletIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start participating in campaigns to earn and see your transactions here.
                  </p>
                  <Button asChild>
                    <a href="/campaigns">Browse Campaigns</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.type} - {formatCurrency(transaction.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-500">+{formatCurrency(transaction.amount)}</p>
                        <Badge variant="secondary" className="text-xs">{transaction.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="mt-6 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <span>Payment Methods</span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/payment-methods">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Method
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No payment methods added yet. Add a payment method to receive your earnings.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/payment-methods">Add Payment Method</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Wallet;