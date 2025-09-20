import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet as WalletIcon, TrendingUp, Download, Plus, CreditCard, Clock } from "lucide-react";

const Wallet = () => {
  const { user } = useAuth();

  const transactions = [
    // Mock data - replace with actual transaction data
  ];

  const balanceCards = [
    {
      title: 'Available Balance',
      amount: '$0.00',
      description: 'Ready to withdraw',
      icon: WalletIcon,
      color: 'text-green-500',
    },
    {
      title: 'Pending Earnings',
      amount: '$0.00',
      description: 'Processing payments',
      icon: Clock,
      color: 'text-yellow-500',
    },
    {
      title: 'Total Earned',
      amount: '$0.00',
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
            <Button className="h-12 bg-gradient-primary hover:opacity-90 transition-smooth">
              <Download className="w-4 h-4 mr-2" />
              Withdraw Funds
            </Button>
            <Button variant="outline" className="h-12">
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
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
                  {transactions.map((transaction: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-500">+${transaction.amount}</p>
                        <Badge variant="secondary" className="text-xs">Completed</Badge>
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
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Method
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No payment methods added yet. Add a payment method to receive your earnings.
                </p>
                <Button variant="outline">Add Payment Method</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Wallet;