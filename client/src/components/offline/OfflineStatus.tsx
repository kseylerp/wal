import { useState } from 'react';
import { Wifi, WifiOff, AlertCircle, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface OfflineStatusProps {
  isOnline: boolean;
  pendingSyncCount: number;
  lastSyncAttempt: string | null;
  onSyncClick: () => void;
  isSyncing?: boolean;
}

export function OfflineStatus({
  isOnline,
  pendingSyncCount,
  lastSyncAttempt,
  onSyncClick,
  isSyncing = false
}: OfflineStatusProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const formatLastSync = () => {
    if (!lastSyncAttempt) return 'Never';
    
    try {
      const date = new Date(lastSyncAttempt);
      return date.toLocaleString();
    } catch (error) {
      return 'Unknown';
    }
  };

  return (
    <div className="mb-4">
      <TooltipProvider>
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <div className="flex justify-between items-center">
            <Badge variant={isOnline ? "default" : "outline"} className={isOnline ? "bg-green-500 hover:bg-green-600" : "border-amber-500 text-amber-500"}>
              <div className="flex items-center gap-1.5">
                {isOnline ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
                <span>{isOnline ? "Online" : "Offline"}</span>
              </div>
            </Badge>
            
            {!isOnline && pendingSyncCount > 0 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                {pendingSyncCount} {pendingSyncCount === 1 ? 'trip' : 'trips'} to sync
              </Badge>
            )}
            
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                <span className="sr-only">Toggle details</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`${isOpen ? "rotate-180" : ""} transition-transform`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
            <Card className="mt-2">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Connection:</span>
                    <span className="font-medium flex items-center gap-1">
                      {isOnline ? (
                        <>
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">Connected</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          <span className="text-amber-600">Offline</span>
                        </>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last sync attempt:</span>
                    <span className="font-medium">{formatLastSync()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Pending syncs:</span>
                    <span className="font-medium">{pendingSyncCount}</span>
                  </div>
                  
                  <div className="pt-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={onSyncClick}
                          disabled={!isOnline || isSyncing || pendingSyncCount === 0}
                          variant="default"
                          size="sm"
                          className="w-full"
                        >
                          {isSyncing ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Syncing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Sync Now
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {!isOnline 
                          ? "You must be online to sync trips" 
                          : pendingSyncCount === 0 
                            ? "No trips to sync" 
                            : "Sync offline trips to your account"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </TooltipProvider>
    </div>
  );
}