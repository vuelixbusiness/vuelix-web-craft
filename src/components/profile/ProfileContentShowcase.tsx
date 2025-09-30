import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Image as ImageIcon, Music, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ContentItem {
  id: string;
  content_type: string;
  media_url: string;
  title: string;
  description: string;
  thumbnail_url: string;
  featured: boolean;
  created_at: string;
}

interface ProfileContentShowcaseProps {
  userId: string;
  featured?: boolean;
}

export function ProfileContentShowcase({ userId, featured = false }: ProfileContentShowcaseProps) {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, [userId, featured]);

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('user_content_showcase')
        .select('*')
        .eq('user_id', userId)
        .order('display_order', { ascending: true });

      if (featured) {
        query = query.eq('featured', true).limit(6);
      }

      const { data, error } = await query;

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content showcase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'image': return ImageIcon;
      case 'audio': return Music;
      default: return FileText;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (content.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Showcase</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No content showcased yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {featured ? 'Featured Content' : 'Content Showcase'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.map((item) => {
            const Icon = getContentIcon(item.content_type);
            return (
              <div
                key={item.id}
                className="group relative rounded-lg overflow-hidden border border-border hover:shadow-soft transition-smooth cursor-pointer"
              >
                {item.thumbnail_url || item.media_url ? (
                  <div className="relative aspect-video">
                    <img
                      src={item.thumbnail_url || item.media_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center">
                      <Icon className="w-12 h-12 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-primary/10 flex items-center justify-center">
                    <Icon className="w-12 h-12 text-primary/50" />
                  </div>
                )}
                <div className="p-3">
                  <h4 className="font-medium mb-1 truncate">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {item.description}
                    </p>
                  )}
                  <Badge variant="secondary" className="text-xs capitalize">
                    {item.content_type}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
