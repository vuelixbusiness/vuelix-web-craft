import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useContentUpload } from '@/hooks/useContentUpload';
import { Loader2, Upload } from 'lucide-react';

interface AddPortfolioDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddPortfolioDialog = ({ open, onClose, onSuccess }: AddPortfolioDialogProps) => {
  const { uploadContent, isUploading } = useContentUpload();
  const [file, setFile] = useState<File | null>(null);
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
      contentType: 'portfolio',
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
          <DialogTitle>Add Portfolio Item</DialogTitle>
          <DialogDescription>
            Upload work samples to showcase your skills and projects
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Project Image or File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf"
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
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter project title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project, technologies used, your role..."
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="featured" className="cursor-pointer">
              Feature this project
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
              Add to Portfolio
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
