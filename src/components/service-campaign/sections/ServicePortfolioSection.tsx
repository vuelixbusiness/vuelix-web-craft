import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MediaAssetsSection from "@/components/MediaAssetsSection";
import AudioAssetsSection from "@/components/AudioAssetsSection";

interface Campaign {
  id: string;
  title: string;
  song_title: string;
}

interface MediaAsset {
  id: string;
  url: string;
  type: string;
  created_at: string;
}

interface ServicePortfolioSectionProps {
  campaign: Campaign;
  mediaAssets: MediaAsset[];
}

export function ServicePortfolioSection({ campaign, mediaAssets }: ServicePortfolioSectionProps) {
  const videoAssets = mediaAssets.filter(asset => asset.type === 'video');
  const audioAssets = mediaAssets.filter(asset => asset.type === 'audio');
  const imageAssets = mediaAssets.filter(asset => asset.type === 'image');

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold mb-2">Portfolio</h2>
        <p className="text-muted-foreground">
          Explore examples of previous work and samples
        </p>
      </div>

      {videoAssets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Video Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <MediaAssetsSection 
              campaign={campaign} 
              mediaAssets={videoAssets} 
              isLoading={false} 
            />
          </CardContent>
        </Card>
      )}

      {audioAssets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Audio Samples</CardTitle>
          </CardHeader>
          <CardContent>
            <AudioAssetsSection 
              campaign={campaign} 
              audioAssets={audioAssets} 
              isLoading={false} 
            />
          </CardContent>
        </Card>
      )}

      {imageAssets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Image Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {imageAssets.map((asset) => (
                <div key={asset.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={asset.url} 
                    alt="Portfolio item"
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {videoAssets.length === 0 && audioAssets.length === 0 && imageAssets.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No portfolio items available yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
