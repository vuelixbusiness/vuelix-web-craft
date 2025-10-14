import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  media_url: string;
  thumbnail_url: string | null;
  featured: boolean;
  created_at: string;
}

interface PortfolioGalleryDialogProps {
  items: PortfolioItem[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}

export const PortfolioGalleryDialog = ({ items, initialIndex, open, onClose }: PortfolioGalleryDialogProps) => {
  const isVideo = (url: string) => {
    return url.match(/\.(mp4|mov|webm)$/i);
  };

  const isPDF = (url: string) => {
    return url.match(/\.pdf$/i);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-50"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <Carousel className="w-full h-full" opts={{ startIndex: initialIndex }}>
          <CarouselContent>
            {items.map((item) => (
              <CarouselItem key={item.id}>
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="relative w-full flex-1 flex items-center justify-center">
                    {isVideo(item.media_url) ? (
                      <video
                        src={item.media_url}
                        controls
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    ) : isPDF(item.media_url) ? (
                      <iframe
                        src={item.media_url}
                        className="w-full h-full rounded-lg"
                        title={item.title}
                      />
                    ) : (
                      <img
                        src={item.media_url}
                        alt={item.title}
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    )}
                    {item.featured && (
                      <Badge className="absolute top-2 right-2">Featured</Badge>
                    )}
                  </div>
                  <div className="text-center space-y-2 px-6 pb-4">
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </DialogContent>
    </Dialog>
  );
};
