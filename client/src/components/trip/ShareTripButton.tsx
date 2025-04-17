import { useState } from 'react';
import { Share, Copy, Check, X, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ShareTripButtonProps {
  tripId: number | string;
}

export function ShareTripButton({ tripId }: ShareTripButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareTrip = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', `/api/trips/${tripId}/share`);
      const data = await response.json();
      
      // Create full URL for sharing
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}${data.shareUrl}`;
      
      setShareableLink(shareUrl);
    } catch (err) {
      console.error('Error sharing trip:', err);
      setError('Failed to generate sharing link');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate sharing link. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      
      toast({
        title: 'Link copied',
        description: 'Sharing link copied to clipboard',
      });
      
      // Reset copied status after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const shareToSocial = (platform: 'facebook' | 'twitter' | 'linkedin') => {
    if (!shareableLink) return;
    
    let url = '';
    const text = 'Check out this amazing trip I found on Wally!';
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareableLink)}&text=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableLink)}`;
        break;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1.5"
          onClick={shareableLink ? undefined : shareTrip}
        >
          <Share className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Share Trip</h3>
            <X className="h-4 w-4 text-muted-foreground cursor-pointer" />
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#655590]" />
            </div>
          ) : error ? (
            <div className="text-sm text-red-500 py-2">{error}</div>
          ) : shareableLink ? (
            <>
              <div className="flex items-center">
                <input
                  type="text"
                  value={shareableLink}
                  readOnly
                  className="flex-1 p-2 text-sm border rounded-l-md focus:outline-none"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-l-none"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-4 pt-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full bg-[#1877F2] hover:bg-[#1877F2]/90 h-8 w-8"
                  onClick={() => shareToSocial('facebook')}
                >
                  <Facebook className="h-4 w-4 text-white" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 h-8 w-8"
                  onClick={() => shareToSocial('twitter')}
                >
                  <Twitter className="h-4 w-4 text-white" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full bg-[#0A66C2] hover:bg-[#0A66C2]/90 h-8 w-8"
                  onClick={() => shareToSocial('linkedin')}
                >
                  <Linkedin className="h-4 w-4 text-white" />
                </Button>
              </div>
            </>
          ) : (
            <div className="py-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Generate a link to share this trip with friends and family.
              </p>
              <Button onClick={shareTrip}>Generate Link</Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}