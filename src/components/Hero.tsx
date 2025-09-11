import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Abstract gradient background" 
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
              🚀 Now in beta
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            The Future of
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Digital</span>
            <br />
            Experience
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform your workflow with Vuelix's cutting-edge platform. 
            Build, scale, and innovate like never before.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button variant="hero" size="lg" className="w-full sm:w-auto">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline-hero" size="lg" className="w-full sm:w-auto">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              No credit card required
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              14-day free trial
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-primary rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-secondary rounded-full opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-20 w-8 h-8 bg-accent rounded-full opacity-40 animate-pulse delay-500"></div>
    </section>
  );
};

export default Hero;