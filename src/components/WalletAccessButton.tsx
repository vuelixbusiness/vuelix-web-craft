import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const WalletAccessButton = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleWalletAccess = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access your wallet",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    navigate('/wallet');
  };

  return (
    <Button 
      onClick={handleWalletAccess}
      className="bg-gradient-primary hover:opacity-90 transition-smooth"
    >
      <Wallet className="w-4 h-4 mr-2" />
      {user ? 'View Wallet' : 'Login to Access Wallet'}
    </Button>
  );
};

export default WalletAccessButton;