import { Card } from "@/components/ui/card";
import { Zap, Shield, Globe, Sparkles, BarChart3, Users } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Experience blazing fast performance with our optimized infrastructure that scales with your needs."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade security with end-to-end encryption, ensuring your data is always protected."
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Deploy anywhere in the world with our global CDN and multi-region infrastructure."
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "Leverage artificial intelligence to automate workflows and gain intelligent insights."
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Get deep insights with comprehensive analytics and real-time performance monitoring."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work seamlessly with your team using our collaborative tools and shared workspaces."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-gradient-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Features for
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Modern Teams</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to build, deploy, and scale your applications with confidence.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-8 hover:shadow-elegant transition-smooth hover:scale-105 bg-card border-0 shadow-soft"
            >
              <div className="mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;