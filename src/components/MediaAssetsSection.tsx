import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Image, FileVideo, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  title: string;
  cover_art_url?: string;
}

interface MediaAsset {
  id: string;
  url: string;
  type: string;
  created_at: string;
}

interface MediaAssetsSectionProps {
  campaign: Campaign;
  mediaAssets: MediaAsset[];
  isLoading: boolean;
}

const MediaAssetsSection = ({ campaign, mediaAssets, isLoading }: MediaAssetsSectionProps) => {
  const { toast } = useToast();
  const [downloadingAssets, setDownloadingAssets] = useState<Set<string>>(new Set());

  const visualAssets = mediaAssets.filter(asset => 
    asset.type === 'image' || asset.type === 'video' || asset.type === 'graphics'
  );

  const handleDownload = async (url: string, assetId: string) => {
    setDownloadingAssets(prev => new Set(prev).add(assetId));
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `asset-${assetId}`;
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

  const allAssets = [
    ...(campaign.cover_art_url ? [{
      id: 'cover-art',
      url: campaign.cover_art_url,
      type: 'image',
      created_at: '',
      isMainAsset: true
    }] : []),
    ...visualAssets
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Image className="w-5 h-5 text-primary" />
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

  if (allAssets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Image className="w-5 h-5 text-primary" />
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
        <CardTitle className="flex items-center space-x-2">
          <Image className="w-5 h-5 text-primary" />
          <span>Media Assets</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allAssets.map((asset) => (
            <div
              key={asset.id}
              className="relative group border rounded-lg overflow-hidden bg-secondary/10 hover:bg-secondary/20 transition-colors"
            >
              {asset.type === 'image' || asset.type === 'graphics' ? (
                <div className="aspect-video relative">
                  <img
                    src={asset.url}
                    alt="Campaign asset"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  {'isMainAsset' in asset && asset.isMainAsset && (
                    <Badge className="absolute top-2 left-2" variant="secondary">
                      Cover Art
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-secondary/20 flex items-center justify-center">
                  {getAssetIcon(asset.type)}
                  <span className="ml-2 text-sm">Video Asset</span>
                </div>
              )}
              
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePreview(asset.url)}
                      className="h-7 w-7 p-0"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(asset.url, asset.id)}
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
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaAssetsSection;