import { ExternalLink, LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CampaignReferencesBoxProps {
  referenceLinks?: string;
}

export function CampaignReferencesBox({ referenceLinks }: CampaignReferencesBoxProps) {
  // Parse reference links (assuming they're newline-separated URLs)
  const links = referenceLinks ? referenceLinks.split('\n').filter(link => link.trim()) : [];

  const isValidUrl = (url: string) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const formatUrl = (url: string) => {
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const getDisplayUrl = (url: string) => {
    try {
      const urlObj = new URL(formatUrl(url));
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  if (links.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LinkIcon className="h-5 w-5" />
            <span>Reference Links</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <LinkIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No reference links provided</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <LinkIcon className="h-5 w-5" />
          <span>Reference Links</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {links.map((link, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {getDisplayUrl(link)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {link}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(formatUrl(link), '_blank', 'noopener,noreferrer')}
                disabled={!isValidUrl(link)}
                className="flex-shrink-0 ml-2"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}