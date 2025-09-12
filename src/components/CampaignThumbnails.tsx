import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Eye, DollarSign } from "lucide-react";

const campaigns = [
  {
    id: 1,
    artist: "Nova Beats",
    track: "Electric Dreams",
    genre: "Electronic",
    budget: "$2,500",
    rate: "$12",
    views: "850K",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
  },
  {
    id: 2,
    artist: "Luna Rose",
    track: "Midnight Vibes",
    genre: "Pop",
    budget: "$1,800",
    rate: "$8",
    views: "1.2M",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop",
  },
  {
    id: 3,
    artist: "Echo Squad",
    track: "Neon Nights",
    genre: "Hip-Hop",
    budget: "$3,200",
    rate: "$15",
    views: "640K",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
  },
  {
    id: 4,
    artist: "Crystal Wave",
    track: "Ocean Flow",
    genre: "Ambient",
    budget: "$1,400",
    rate: "$6",
    views: "920K",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
  },
  {
    id: 5,
    artist: "Blaze Fire",
    track: "Heat Wave",
    genre: "Rock",
    budget: "$2,900",
    rate: "$18",
    views: "780K",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
  },
];

export const CampaignThumbnails = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-background via-muted/20 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 gradient-text">
            Live Campaigns
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover trending campaigns from top artists. Join now and start earning from your content.
          </p>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {campaigns.map((campaign) => (
              <CarouselItem key={campaign.id} className="pl-2 md:pl-4 basis-1/1 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-2 bg-card/50 backdrop-blur-sm border-border/50">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={campaign.image}
                      alt={campaign.track}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                        {campaign.genre}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg mb-1">{campaign.track}</h3>
                      <p className="text-white/80 text-sm">by {campaign.artist}</p>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary-foreground ml-1" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-primary">{campaign.rate}/1K views</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">{campaign.views}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="font-medium">{campaign.budget}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.random() * 40 + 30}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Campaign progress</p>
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};