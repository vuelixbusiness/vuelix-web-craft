import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UploadContentParams {
  file: File;
  contentType: 'video' | 'image' | 'audio' | 'document' | 'portfolio';
  title: string;
  description?: string;
  featured?: boolean;
}

export const useContentUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const getMaxFileSize = (contentType: string) => {
    switch (contentType) {
      case 'portfolio':
        return 100 * 1024 * 1024; // 100MB for portfolio (videos need more)
      case 'image':
        return 10 * 1024 * 1024; // 10MB
      case 'video':
      case 'audio':
        return 50 * 1024 * 1024; // 50MB
      case 'document':
        return 10 * 1024 * 1024; // 10MB
      default:
        return 5 * 1024 * 1024;
    }
  };

  const getAllowedTypes = (contentType: string) => {
    switch (contentType) {
      case 'image':
      case 'portfolio':
        return [
          'image/jpeg',
          'image/jpg', 
          'image/png', 
          'image/webp', 
          'image/gif',
          'image/heic',
          'image/heif',
          'video/mp4',
          'video/quicktime', // MOV files
          'video/webm',
          'application/pdf'
        ];
      case 'video':
        return ['video/mp4', 'video/webm', 'video/quicktime'];
      case 'audio':
        return ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg'];
      case 'document':
        return ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      default:
        return [];
    }
  };

  const uploadContent = async ({ file, contentType, title, description, featured = false }: UploadContentParams) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to upload content",
        variant: "destructive",
      });
      return null;
    }

    const allowedTypes = getAllowedTypes(contentType);
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: `Invalid file type for ${contentType}`,
        variant: "destructive",
      });
      return null;
    }

    const maxSize = getMaxFileSize(contentType);
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: `File size must be less than ${maxSize / (1024 * 1024)}MB`,
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-media')
        .getPublicUrl(fileName);

      const { data, error: insertError } = await supabase
        .from('user_content_showcase')
        .insert({
          user_id: user.id,
          content_type: contentType,
          media_url: publicUrl,
          title,
          description,
          featured,
          thumbnail_url: contentType === 'image' ? publicUrl : null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Content uploaded successfully",
      });

      return data;
    } catch (error) {
      console.error('Error uploading content:', error);
      toast({
        title: "Error",
        description: "Failed to upload content. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadContent,
    isUploading
  };
};
