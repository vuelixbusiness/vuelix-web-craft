import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, Play, Pause, Download, Eye, Image, FileVideo, Loader2, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  song_url?: string;
  cover_art_url?: string;
}

interface MediaAsset {
  id: string;
  url: string;
  type: string;
  created_at: string;
}

interface CampaignMediaAssetsPanelProps {
  campaign: Campaign;
  mediaAssets: MediaAsset[];
  isLoading: boolean;
}

export function CampaignMediaAssetsPanel({ campaign, mediaAssets, isLoading }: CampaignMediaAssetsPanelProps) {
  const { toast } = useToast();
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [downloadingAssets, setDownloadingAssets] = useState<Set<string>>(new Set());
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const visualAssets = mediaAssets.filter(asset => 
    asset.type === 'image' || asset.type === 'video' || asset.type === 'graphics'
  );
  
  const audioAssets = mediaAssets.filter(asset => 
    asset.type === 'audio' || asset.type === 'music'
  );

  // Combine campaign cover art with other visual assets
  const allVisualAssets = [
    ...(campaign.cover_art_url ? [{
      id: 'cover-art',
      url: campaign.cover_art_url,
      type: 'image',
      created_at: '',
      isMainAsset: true
    }] : []),
    ...visualAssets.slice(0, 5) // Limit to show max 6 total (including cover art)
  ];

  // Combine campaign song with other audio assets
  const allAudioAssets = [
    ...(campaign.song_url ? [{
      id: 'main-song',
      url: campaign.song_url,
      type: 'audio',
      created_at: '',
      isMainTrack: true,
      title: campaign.song_title
    }] : []),
    ...audioAssets.slice(0, 2) // Limit to show max 3 total
  ];

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
      link.download = filename || `asset-${assetId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Download Started",
        description: "Your asset is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading the asset.",
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

  const handlePreview = (url: string) => {
    window.open(url, '_blank');
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image':
      case 'graphics':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <FileVideo className="w-4 h-4" />;
      default:
        return <Image className="w-4 h-4" />;
    }
  };

  const totalAssets = mediaAssets.length + (campaign.cover_art_url ? 1 : 0) + (campaign.song_url ? 1 : 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            <span>Media Assets</span>
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

  if (totalAssets === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            <span>Media Assets</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No media assets available for this campaign.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            <span>Media Assets</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {totalAssets} {totalAssets === 1 ? 'asset' : 'assets'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Assets Preview */}
        {allVisualAssets.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
              <Image className="w-4 h-4 mr-2" />
              Visual Assets
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {allVisualAssets.map((asset, index) => (
                <div
                  key={asset.id}
                  className="relative group border rounded-lg overflow-hidden bg-secondary/10 hover:bg-secondary/20 transition-colors aspect-square"
                >
                  {asset.type === 'image' || asset.type === 'graphics' ? (
                    <div className="relative w-full h-full">
                      <img
                        src={asset.url}
                        alt="Campaign asset"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      {'isMainAsset' in asset && asset.isMainAsset && (
                        <Badge className="absolute top-1 left-1 text-xs" variant="secondary">
                          Cover
                        </Badge>
                      )}
                      {index === allVisualAssets.length - 1 && visualAssets.length > 5 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            +{visualAssets.length - 4} more
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-secondary/20 flex flex-col items-center justify-center">
                      {getAssetIcon(asset.type)}
                      <span className="text-xs mt-1">Video</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handlePreview(asset.url)}
                        className="h-6 w-6 p-0"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownload(asset.url, asset.id)}
                        disabled={downloadingAssets.has(asset.id)}
                        className="h-6 w-6 p-0"
                      >
                        {downloadingAssets.has(asset.id) ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Download className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audio Assets Preview */}
        {allAudioAssets.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
              <Music className="w-4 h-4 mr-2" />
              Audio Assets
            </h4>
            <div className="space-y-2">
              {allAudioAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Music className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {'title' in asset ? asset.title : 'Audio Track'}
                        </span>
                        {'isMainTrack' in asset && asset.isMainTrack && (
                          <Badge variant="default" className="text-xs">
                            Main
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePlayPause(asset.id, asset.url)}
                      className="h-7 w-7 p-0"
                    >
                      {playingAudio === asset.id ? (
                        <Pause className="w-3 h-3" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(
                        asset.url, 
                        asset.id, 
                        'title' in asset ? `${asset.title}.mp3` : undefined
                      )}
                      disabled={downloadingAssets.has(asset.id)}
                      className="h-7 w-7 p-0"
                    >
                      {downloadingAssets.has(asset.id) ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}