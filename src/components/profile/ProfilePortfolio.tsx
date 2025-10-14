import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { PortfolioGalleryDialog } from './PortfolioGalleryDialog';

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  media_url: string;
  thumbnail_url: string | null;
  featured: boolean;
  created_at: string;
}

interface ProfilePortfolioProps {
  userId: string;
}

export const ProfilePortfolio = ({ userId }: ProfilePortfolioProps) => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    fetchPortfolio();
  }, [userId]);

  const fetchPortfolio = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_content_showcase')
        .select('*')
        .eq('user_id', userId)
        .eq('content_type', 'portfolio')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolio(data || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = () => <FileText className="h-5 w-5" />;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (portfolio.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No portfolio items yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolio.map((item, index) => (
          <Card 
            key={item.id} 
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              setSelectedIndex(index);
              setGalleryOpen(true);
            }}
          >
            <div className="aspect-video bg-muted relative">
              {item.thumbnail_url ? (
                <img 
                  src={item.thumbnail_url} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              {item.featured && (
                <Badge className="absolute top-2 right-2">Featured</Badge>
              )}
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {getIcon()}
                {item.title}
              </CardTitle>
            </CardHeader>
            {item.description && (
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {item.description}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
      
      <PortfolioGalleryDialog
        items={portfolio}
        initialIndex={selectedIndex}
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />
    </>
  );
};
