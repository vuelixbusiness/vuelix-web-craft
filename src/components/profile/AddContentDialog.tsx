import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useContentUpload } from '@/hooks/useContentUpload';
import { Loader2, Upload } from 'lucide-react';

interface AddContentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddContentDialog = ({ open, onClose, onSuccess }: AddContentDialogProps) => {
  const { uploadContent, isUploading } = useContentUpload();
  const [file, setFile] = useState<File | null>(null);
  const [contentType, setContentType] = useState<'video' | 'image' | 'audio' | 'document'>('image');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title) {
      return;
    }

    const result = await uploadContent({
      file,
      contentType,
      title,
      description,
      featured,
    });

    if (result) {
      setFile(null);
      setTitle('');
      setDescription('');
      setFeatured(false);
      onSuccess();
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Content</DialogTitle>
          <DialogDescription>
            Upload new content to showcase on your profile
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contentType">Content Type</Label>
            <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Document</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept={
                  contentType === 'image' ? 'image/*' :
                  contentType === 'video' ? 'video/*' :
                  contentType === 'audio' ? 'audio/*' :
                  '.pdf,.doc,.docx'
                }
                className="cursor-pointer"
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter content title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter content description"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="featured" className="cursor-pointer">
              Feature this content
            </Label>
            <Switch
              id="featured"
              checked={featured}
              onCheckedChange={setFeatured}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file || !title || isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload Content
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
