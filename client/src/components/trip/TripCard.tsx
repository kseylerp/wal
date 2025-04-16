import { useState } from 'react';
import { MapPin, Calendar, DollarSign, TrendingUp, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { ShareTripButton } from './ShareTripButton';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import JourneyMap from './JourneyMap';
import { useIsMobile } from '@/hooks/use-mobile';

interface TripCardProps {
  id: number;
  title: string;
  description: string;
  location: string;
  duration: string;
  difficultyLevel: string;
  priceEstimate: string;
  mapCenter: [number, number];
  journey: any;
  itinerary: any[];
  createdAt: string;
  onEdit?: (id: number) => void;
}

export default function TripCard({ 
  id,
  title, 
  description, 
  location, 
  duration, 
  difficultyLevel,
  priceEstimate,
  mapCenter,
  journey,
  itinerary,
  createdAt,
  onEdit
}: TripCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const toggleMapExpand = () => {
    setIsMapExpanded(!isMapExpanded);
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      await apiRequest('DELETE', `/api/trips/${id}`);
      
      // Invalidate trips cache to trigger refresh
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      
      toast({
        title: 'Trip deleted',
        description: 'Your trip has been deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete trip. Please try again.',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      {/* Map Preview */}
      <div className={`relative w-full ${isMapExpanded ? 'h-[500px]' : 'h-[200px] sm:h-[250px]'} transition-all duration-300`}>
        {mapCenter && journey && (
          <JourneyMap
            mapId={`map-${id}`}
            center={mapCenter}
            markers={journey.markers || []}
            journey={journey}
            isExpanded={isMapExpanded}
            toggleExpand={toggleMapExpand}
            isThumbnail={!isMapExpanded}
          />
        )}
      </div>
      
      {/* Trip Info */}
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 mb-3">Added on {formattedDate}</p>
          </div>
          <div className="flex space-x-1">
            <ShareTripButton tripId={id} />
            
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(id)}
                className="flex items-center gap-1.5"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
            
            <AlertDialog 
              open={deleteDialogOpen} 
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                >
                  <Trash className="h-4 w-4" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this trip plan. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete} 
                    className="bg-red-500 hover:bg-red-600"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mt-3 mb-4">
          {description.length > 150 ? `${description.substring(0, 150)}...` : description}
        </p>
        
        <div className="flex flex-wrap gap-2 sm:gap-4 text-sm mt-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1 text-[#655590]" />
            {location}
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-1 text-[#655590]" />
            {duration}
          </div>
          <div className="flex items-center text-gray-600">
            <TrendingUp className="h-4 w-4 mr-1 text-[#655590]" />
            {difficultyLevel}
          </div>
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-4 w-4 mr-1 text-[#655590]" />
            {priceEstimate}
          </div>
        </div>
        
        <div className="mt-5 pt-4 border-t flex justify-between">
          <div>
            <div className="text-xs text-gray-500">Itinerary</div>
            <div className="text-sm font-medium">{itinerary?.length || 0} days planned</div>
          </div>
          
          <Button 
            size="sm" 
            className="bg-[#655590] hover:bg-[#655590]/90"
            onClick={() => onEdit && onEdit(id)}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}