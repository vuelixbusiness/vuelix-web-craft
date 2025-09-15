import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { CheckCircle, Star, Crown } from "lucide-react";

const VuelixPlus = () => {
  const features = {
    gold: [
      "Everything in Free AND:",
      "5% higher payout rate across all campaigns",
      "Earn up to $99.99 per video (vs $49.99 free)",
      "Priority customer support",
      "Advanced analytics dashboard",
      "Early access to new features",
    ],
    platinum: [
      "Everything in Gold AND:",
      "15% higher payout rate across all campaigns", 
      "Unlimited earnings per video",
      "Dedicated account manager",
      "Custom campaign opportunities",
      "Premium brand partnerships",
      "Advanced analytics + insights",
      "Priority review process",
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 px-4 py-2 bg-gradient-primary text-primary-foreground">
            Premium Membership
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            Vuelix+
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Unlock higher payouts and unlimited earning potential with our premium membership tiers
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-32 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Gold Tier */}
            <Card className="relative border-2 border-primary/20 shadow-elegant hover:shadow-xl transition-smooth flex flex-col">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-primary text-primary-foreground px-4 py-2 flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Popular
                </Badge>
              </div>
              
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Star className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl font-bold">Vuelix Gold</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Perfect for growing creators
                </CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">$19</span>
                  <span className="text-muted-foreground">.99/month</span>
                </div>
              </CardHeader>
              
              <CardContent className="flex flex-col flex-1 space-y-4">
                <div className="space-y-3 flex-1">
                  {features.gold.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full mt-6 bg-gradient-primary hover:opacity-90 transition-smooth">
                  Upgrade to Gold
                </Button>
              </CardContent>
            </Card>

            {/* Platinum Tier */}
            <Card className="relative border-2 border-accent shadow-soft hover:shadow-elegant transition-smooth flex flex-col">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-accent text-accent-foreground px-4 py-2 flex items-center gap-1">
                  <Crown className="w-4 h-4" />
                  Premium
                </Badge>
              </div>
              
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-accent-foreground" />
                </div>
                <CardTitle className="text-2xl font-bold">Vuelix Platinum</CardTitle>
                <CardDescription className="text-muted-foreground">
                  For serious content creators
                </CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">$39</span>
                  <span className="text-muted-foreground">.99/month</span>
                </div>
              </CardHeader>
              
              <CardContent className="flex flex-col flex-1 space-y-4">
                <div className="space-y-3 flex-1">
                  {features.platinum.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent-foreground flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full mt-6 bg-accent text-accent-foreground hover:opacity-90 transition-smooth">
                  Upgrade to Platinum
                </Button>
              </CardContent>
            </Card>
            
          </div>
          
          {/* Comparison Table */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Compare Plans</h2>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-medium">Feature</th>
                        <th className="text-center p-4 font-medium">Free</th>
                        <th className="text-center p-4 font-medium">Gold</th>
                        <th className="text-center p-4 font-medium">Platinum</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="p-4">Max earnings per video</td>
                        <td className="text-center p-4 text-muted-foreground">$49.99</td>
                        <td className="text-center p-4">$99.99</td>
                        <td className="text-center p-4">Unlimited</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-4">Payout rate bonus</td>
                        <td className="text-center p-4 text-muted-foreground">0%</td>
                        <td className="text-center p-4">+5%</td>
                        <td className="text-center p-4">+15%</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-4">Priority support</td>
                        <td className="text-center p-4 text-muted-foreground">-</td>
                        <td className="text-center p-4">✓</td>
                        <td className="text-center p-4">✓</td>
                      </tr>
                      <tr>
                        <td className="p-4">Dedicated account manager</td>
                        <td className="text-center p-4 text-muted-foreground">-</td>
                        <td className="text-center p-4 text-muted-foreground">-</td>
                        <td className="text-center p-4">✓</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VuelixPlus;