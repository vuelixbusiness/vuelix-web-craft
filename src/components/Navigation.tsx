import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { HelpCircle, Music, Video, BarChart3, Trophy, Star } from "lucide-react";
import vuelixLogo from "@/assets/vuelix-logo-v.png";

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

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // If we're on the home page with a hash (section), scroll to top
    if (location.pathname === '/' && location.hash) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else if (location.pathname !== '/') {
      // If we're on a foreign page, navigate to how-it-works section
      navigate('/#how-it-works');
    } else {
      // If we're on home page without hash, just scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a 
            href="/" 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-smooth"
          >
            <img src={vuelixLogo} alt="Vuelix" className="w-8 h-8" />
            <span className="text-xl font-bold">Vuelix</span>
          </a>
          
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="rounded-full px-4" asChild>
              <a 
                href="#how-it-works" 
                onClick={(e) => handleSmoothScroll(e, 'how-it-works')}
                className="flex items-center space-x-2"
              >
                <HelpCircle className="w-4 h-4" />
                <span>How It Works</span>
              </a>
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full px-4" asChild>
              <a 
                href="#for-artists" 
                onClick={(e) => handleSmoothScroll(e, 'for-artists')}
                className="flex items-center space-x-2"
              >
                <Music className="w-4 h-4" />
                <span>For Artists</span>
              </a>
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full px-4" asChild>
              <a 
                href="#for-creators" 
                onClick={(e) => handleSmoothScroll(e, 'for-creators')}
                className="flex items-center space-x-2"
              >
                <Video className="w-4 h-4" />
                <span>For Creators</span>
              </a>
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full px-4" asChild>
              <a href="/campaigns" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Campaigns</span>
              </a>
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full px-4" asChild>
              <a href="/leaderboard" className="flex items-center space-x-2">
                <Trophy className="w-4 h-4" />
                <span>Leaderboard</span>
              </a>
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full px-4" asChild>
              <a href="/vuelix-plus" className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>Vuelix+</span>
              </a>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="rounded-full" asChild>
              <a href="/login">Log In</a>
            </Button>
            <Button variant="default" size="sm" className="rounded-full" asChild>
              <a href="/signup">Join Now</a>
            </Button>
          </div>
        </div>
      </div>
    </nav>;
};
export default Navigation;