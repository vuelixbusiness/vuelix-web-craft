import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { useLocation, useNavigate } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    // If we're not on the home page, navigate there first
    if (location.pathname !== '/') {
      navigate(`/#${targetId}`);
      return;
    }
    
    // If we're on the home page, smooth scroll to the section
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const offsetTop = targetElement.offsetTop - 80; // Account for fixed nav height
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg"></div>
            <span className="text-xl font-bold text-foreground">Vuelix Clips</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <a 
              href="#how-it-works" 
              onClick={(e) => handleSmoothScroll(e, 'how-it-works')}
              className="px-4 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-smooth font-medium"
            >
              How It Works
            </a>
            <a 
              href="#for-artists" 
              onClick={(e) => handleSmoothScroll(e, 'for-artists')}
              className="px-4 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-smooth font-medium"
            >
              For Artists
            </a>
            <a 
              href="#for-creators" 
              onClick={(e) => handleSmoothScroll(e, 'for-creators')}
              className="px-4 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-smooth font-medium"
            >
              For Creators
            </a>
            <a href="/vuelix-plus" className="px-4 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-smooth font-medium">Vuelix+</a>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <a href="/login">Log In</a>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <a href="/signup">Join Now</a>
            </Button>
          </div>
        </div>
      </div>
    </nav>;
};
export default Navigation;