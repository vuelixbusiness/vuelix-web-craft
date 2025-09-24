import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, Play, Pause, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  song_title: string;
  song_url?: string;
}

interface MediaAsset {
  id: string;
  url: string;
  type: string;
  created_at: string;
}

interface AudioAssetsSectionProps {
  campaign: Campaign;
  audioAssets: MediaAsset[];
  isLoading: boolean;
}

const AudioAssetsSection = ({ campaign, audioAssets, isLoading }: AudioAssetsSectionProps) => {
  const { toast } = useToast();
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [downloadingAssets, setDownloadingAssets] = useState<Set<string>>(new Set());
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const handlePlayPause = (audioId: string, url: string) => {
    // Stop any currently playing audio
    Object.entries(audioRefs.current).forEach(([id, audio]) => {
      if (id !== audioId && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    if (!audioRefs.current[audioId]) {
      audioRefs.current[audioId] = new Audio(url);
      audioRefs.current[audioId].addEventListener('ended', () => {
        setPlayingAudio(null);
      });
    }

    const audio = audioRefs.current[audioId];

    if (playingAudio === audioId) {
      audio.pause();
      audio.currentTime = 0;
      setPlayingAudio(null);
    } else {
      audio.play();
      setPlayingAudio(audioId);
    }
  };

  const handleDownload = async (url: string, assetId: string, filename?: string) => {
    setDownloadingAssets(prev => new Set(prev).add(assetId));
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || `audio-${assetId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Download Started",
        description: "Your audio file is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading the audio file.",
        variant: "destructive",
      });
    } finally {
      setDownloadingAssets(prev => {
        const updated = new Set(prev);
        updated.delete(assetId);
        return updated;
      });
    }
  };

  const allAudioAssets = [
    ...(campaign.song_url ? [{
      id: 'main-song',
      url: campaign.song_url,
      type: 'audio',
      created_at: '',
      isMainTrack: true,
      title: campaign.song_title
    }] : []),
    ...audioAssets
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Music className="w-5 h-5 text-primary" />
            <span>Audio Assets</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (allAudioAssets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Music className="w-5 h-5 text-primary" />
            <span>Audio Assets</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No audio assets available for this campaign.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Music className="w-5 h-5 text-primary" />
          <span>Audio Assets</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allAudioAssets.map((asset) => (
            <div
              key={asset.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">
                      {'title' in asset ? asset.title : 'Audio Asset'}
                    </h4>
                    {'isMainTrack' in asset && asset.isMainTrack && (
                      <Badge variant="default" className="text-xs">
                        Main Track
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Audio File • {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePlayPause(asset.id, asset.url)}
                  className="h-9 w-9 p-0"
                >
                  {playingAudio === asset.id ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(
                    asset.url, 
                    asset.id, 
                    'title' in asset ? `${asset.title}.mp3` : undefined
                  )}
                  disabled={downloadingAssets.has(asset.id)}
                  className="h-9 w-9 p-0"
                >
                  {downloadingAssets.has(asset.id) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioAssetsSection;