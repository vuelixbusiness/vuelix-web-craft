import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
const Navigation = () => {
  return <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg"></div>
            <span className="text-xl font-bold text-foreground">Vuelix Clips</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-smooth">
              How It Works
            </a>
            <a href="#how-it-works-artists" className="text-muted-foreground hover:text-foreground transition-smooth">
              For Artists
            </a>
            <a href="#for-creators" className="text-muted-foreground hover:text-foreground transition-smooth">For Creators</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-smooth">
              Pricing
            </a>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button variant="hero" size="sm">
              Join Now
            </Button>
          </div>
        </div>
      </div>
    </nav>;
};
export default Navigation;