import { useState, useRef, useEffect } from 'react';
import { UserRole, RoleConfig } from '@/config/roleConfig';
import CreatorCampaignList from '../CreatorCampaignList';
import ArtistYourCampaigns from '../creator-dashboard/ArtistYourCampaigns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CampaignManagerHubProps {
  role: UserRole;
  roleConfig: RoleConfig;
}

export const CampaignManagerHub = ({ role, roleConfig }: CampaignManagerHubProps) => {
  const [showJoinedCampaigns, setShowJoinedCampaigns] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { canManage } = roleConfig.campaignActions;

  // Audio control
  const handleToggleAudio = (id: string, songUrl: string) => {
    if (!audioRef.current) return;

    if (currentlyPlaying === id) {
      audioRef.current.pause();
      setCurrentlyPlaying(null);
    } else {
      if (currentlyPlaying) {
        audioRef.current.pause();
      }
      audioRef.current.src = songUrl;
      audioRef.current.play();
      setCurrentlyPlaying(id);
    }
  };

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Toggle Header - Show for ALL users */}
      <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
        <div className="flex flex-col">
          <Label htmlFor="campaign-view-toggle" className="text-base font-semibold">
            {showJoinedCampaigns ? 'Joined Campaigns' : 'My Campaigns'}
          </Label>
          <p className="text-sm text-muted-foreground">
            {showJoinedCampaigns 
              ? "View campaigns you've joined"
              : "View campaigns you've created"
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Label htmlFor="campaign-view-toggle" className="text-sm">
            Created
          </Label>
          <Switch
            id="campaign-view-toggle"
            checked={showJoinedCampaigns}
            onCheckedChange={setShowJoinedCampaigns}
          />
          <Label htmlFor="campaign-view-toggle" className="text-sm">
            Joined
          </Label>
        </div>
      </div>

      {/* Conditional Rendering Based on Toggle */}
      {showJoinedCampaigns ? (
        <CreatorCampaignList 
          currentlyPlaying={currentlyPlaying}
          onToggleAudio={handleToggleAudio}
        />
      ) : (
        <ArtistYourCampaigns />
      )}

      {/* Audio element for song previews */}
      <audio
        ref={audioRef}
        onEnded={() => setCurrentlyPlaying(null)}
        onError={() => setCurrentlyPlaying(null)}
      />
    </div>
  );
};

export default CampaignManagerHub;
