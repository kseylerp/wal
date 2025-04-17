import { CloudOff, CloudSync, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type SyncStatus = 'pending' | 'synced' | 'failed';

interface OfflineTripBadgeProps {
  syncStatus: SyncStatus;
  className?: string;
}

export function OfflineTripBadge({ syncStatus, className = '' }: OfflineTripBadgeProps) {
  let badgeContent;
  let tooltipContent;

  switch (syncStatus) {
    case 'pending':
      badgeContent = (
        <>
          <CloudOff className="h-3 w-3 mr-1" />
          <span>Offline</span>
        </>
      );
      tooltipContent = "This trip is stored offline and will be synchronized when you're online";
      break;
    case 'synced':
      badgeContent = (
        <>
          <Check className="h-3 w-3 mr-1" />
          <span>Synced</span>
        </>
      );
      tooltipContent = "This trip has been synchronized with your account";
      break;
    case 'failed':
      badgeContent = (
        <>
          <CloudSync className="h-3 w-3 mr-1" />
          <span>Sync Failed</span>
        </>
      );
      tooltipContent = "Failed to synchronize this trip. Will try again when you're online";
      break;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={syncStatus === 'synced' ? 'default' : 'outline'}
            className={`
              flex items-center gap-1 text-xs
              ${syncStatus === 'pending' ? 'border-amber-500 text-amber-500' : ''}
              ${syncStatus === 'failed' ? 'border-red-500 text-red-500' : ''}
              ${syncStatus === 'synced' ? 'bg-green-500 hover:bg-green-600' : ''}
              ${className}
            `}
          >
            {badgeContent}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}