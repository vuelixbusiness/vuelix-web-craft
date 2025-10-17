import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClickableUsername } from "@/components/ui/clickable-username";
import { Star, Clock, Euro, MapPin } from "lucide-react";
import { FaTiktok, FaInstagram, FaYoutube, FaTwitter } from "react-icons/fa";
import MediaAssetsSection from "@/components/MediaAssetsSection";
import AudioAssetsSection from "@/components/AudioAssetsSection";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Campaign {
  id: string;
  title: string;
  song_title: string;
  artist_id: string;
  payout_rate: number;
  starting_rate?: number;
  platforms: string[];
  instructions?: string;
  genre?: string;
  cover_art_url?: string;
}

interface MediaAsset {
  id: string;
  url: string;
  type: string;
  created_at: string;
}

interface ServiceOverviewSectionProps {
  campaign: Campaign;
  mediaAssets: MediaAsset[];
}

interface ArtistProfile {
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
}

const platformIcons = {
  tiktok: FaTiktok,
  instagram: FaInstagram,
  youtube: FaYoutube,
  twitter: FaTwitter,
};

export function ServiceOverviewSection({ campaign, mediaAssets }: ServiceOverviewSectionProps) {
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);

  useEffect(() => {
    const fetchArtistProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url, bio, location')
        .eq('user_id', campaign.artist_id)
        .single();
      
      if (data) {
        setArtistProfile(data);
      }
    };

    fetchArtistProfile();
  }, [campaign.artist_id]);

  const videoAssets = mediaAssets.filter(asset => asset.type === 'video');
  const audioAssets = mediaAssets.filter(asset => asset.type === 'audio');

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Service Provider Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={artistProfile?.avatar_url} />
              <AvatarFallback>
                {artistProfile?.display_name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {artistProfile && (
                  <ClickableUsername
                    username={artistProfile.username}
                    displayName={artistProfile.display_name}
                    className="text-2xl font-bold"
                  />
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-medium">4.9</span>
                  <span>(12 reviews)</span>
                </div>
                {artistProfile?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{artistProfile.location}</span>
                  </div>
                )}
              </div>

              {artistProfile?.bio && (
                <p className="text-muted-foreground mb-4">{artistProfile.bio}</p>
              )}

              <div className="flex gap-2">
                <Button size="lg" className="gap-2">
                  Request Service
                </Button>
                <Button size="lg" variant="outline">
                  Message
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Details */}
      <Card>
        <CardHeader>
          <CardTitle>{campaign.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {campaign.cover_art_url && (
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
              <img 
                src={campaign.cover_art_url} 
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Starting Rate</p>
              <div className="flex items-center gap-1 text-2xl font-bold">
                <Euro className="h-5 w-5" />
                {campaign.starting_rate || campaign.payout_rate}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Genre</p>
              <Badge variant="secondary">{campaign.genre || "Custom"}</Badge>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Delivery Time</p>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>3-5 days</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Platforms</p>
              <div className="flex gap-2">
                {campaign.platforms.map((platform) => {
                  const Icon = platformIcons[platform.toLowerCase() as keyof typeof platformIcons];
                  return Icon ? (
                    <Icon key={platform} className="h-5 w-5 text-muted-foreground" />
                  ) : null;
                })}
              </div>
            </div>
          </div>

          {campaign.instructions && (
            <div>
              <h3 className="font-semibold mb-2">Service Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {campaign.instructions}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Assets */}
      {videoAssets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Example Work</CardTitle>
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
    </div>
  );
}
