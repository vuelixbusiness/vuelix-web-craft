import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Shield, 
  CheckCircle,
  ArrowLeft,
  Plus,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fees: string;
  processingTime: string;
  supported: boolean;
  recommended?: boolean;
}

const PaymentMethods = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<'membership' | 'payout' | null>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Secure payment processing with instant transfers',
      icon: CreditCard,
      fees: '2.9% + $0.30',
      processingTime: 'Instant',
      supported: true,
      recommended: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Worldwide payment platform with buyer protection',
      icon: Smartphone,
      fees: '3.49% + $0.49',
      processingTime: '1-3 business days',
      supported: true
    },
    {
      id: 'card',
      name: 'Credit / Debit Card',
      description: 'Direct card payments via secure processing',
      icon: Building2,
      fees: '2.9% + $0.30',
      processingTime: 'Instant',
      supported: true
    }
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleSetupMethod = () => {
    if (!selectedMethod) return;
    
    const method = paymentMethods.find(m => m.id === selectedMethod);
    
    toast({
      title: "Payment Method Setup",
      description: `Setting up ${method?.name} for ${purpose === 'membership' ? 'membership payments' : 'payout requests'}...`,
    });

    // Here you would integrate with the actual payment provider
    // For now, we'll just show a success message
    setTimeout(() => {
      toast({
        title: "Setup Complete",
        description: `${method?.name} has been configured successfully!`,
      });
      
      // Navigate back to wallet or previous page
      navigate('/wallet');
    }, 2000);
  };

  const handlePurposeSelect = (selectedPurpose: 'membership' | 'payout') => {
    setPurpose(selectedPurpose);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Payment Methods</h1>
            <p className="text-muted-foreground">
              Choose your preferred payment method for memberships and payouts
            </p>
          </div>
        </div>

        {/* Purpose Selection */}
        {!purpose && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">What would you like to set up?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handlePurposeSelect('membership')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>Membership Payments</span>
                  </CardTitle>
                  <CardDescription>
                    Set up payment methods to upgrade your membership and access premium features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">For subscriptions & upgrades</span>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handlePurposeSelect('payout')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-green-500" />
                    <span>Payout Methods</span>
                  </CardTitle>
                  <CardDescription>
                    Configure how you'd like to receive payments from your campaigns and earnings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">For receiving payments</span>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Payment Methods Selection */}
        {purpose && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {purpose === 'membership' ? 'Membership Payment Methods' : 'Payout Methods'}
                </h2>
                <p className="text-muted-foreground">
                  {purpose === 'membership' 
                    ? 'Choose how you want to pay for your membership'
                    : 'Choose how you want to receive your earnings'
                  }
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPurpose(null)}
              >
                Change Purpose
              </Button>
            </div>

            <div className="grid gap-4 mb-8">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                const isSelected = selectedMethod === method.id;
                
                return (
                  <Card 
                    key={method.id}
                    className={`cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : method.supported 
                          ? 'hover:border-primary/50' 
                          : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => method.supported && handleMethodSelect(method.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <CardTitle className="text-lg">{method.name}</CardTitle>
                              {method.recommended && (
                                <Badge variant="secondary" className="text-xs">
                                  Recommended
                                </Badge>
                              )}
                              {!method.supported && (
                                <Badge variant="outline" className="text-xs">
                                  Coming Soon
                                </Badge>
                              )}
                            </div>
                            <CardDescription>{method.description}</CardDescription>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardHeader>
                    
                    {method.supported && (
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Fees:</span>
                            <p className="font-medium">{method.fees}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Processing:</span>
                            <p className="font-medium">{method.processingTime}</p>
                          </div>
                        </div>
                        
                        {purpose === 'payout' && method.id === 'stripe' && (
                          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center space-x-2 text-sm">
                              <Shield className="h-4 w-4 text-green-500" />
                              <span>Direct bank transfers available</span>
                            </div>
                          </div>
                        )}
                        
                        {purpose === 'membership' && method.id === 'paypal' && (
                          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center space-x-2 text-sm">
                              <Shield className="h-4 w-4 text-blue-500" />
                              <span>Buyer protection included</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>

            <Separator className="my-6" />

            {/* Security Notice */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-medium">Secure & Encrypted</h3>
                  <p className="text-sm text-muted-foreground">
                    All payment information is encrypted and processed securely. We never store your 
                    sensitive payment details on our servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleSetupMethod}
                disabled={!selectedMethod}
                className="flex-1 max-w-xs"
              >
                {selectedMethod 
                  ? `Set up ${paymentMethods.find(m => m.id === selectedMethod)?.name}`
                  : 'Select a payment method'
                }
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/wallet')}
              >
                Cancel
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-sm text-muted-foreground">
              <p>
                <strong>Note:</strong> You can change your payment method at any time from your wallet settings. 
                {purpose === 'payout' && ' Payout methods require verification before first use.'}
              </p>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PaymentMethods;