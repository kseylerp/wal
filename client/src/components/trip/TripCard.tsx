import { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, DollarSign, TrendingUp, Edit, Trash, ChevronDown, ChevronUp, Info, Map, Navigation, Mountain, Clock, AlertTriangle, Droplet, Cloud, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ShareTripButton } from './ShareTripButton';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import JourneyMap from './JourneyMap';
import { cn } from '@/lib/utils';
import { ActivityTimelineView } from '@/components/activity/ActivityTimelineView';

// Define interfaces
interface RouteDetails {
  distance_miles: number;
  elevation_gain_ft: number;
  elevation_loss_ft: number;
  high_point_ft: number;
  terrain: string;
  route_type: string;
}

interface Activity {
  title: string;
  type: string;
  difficulty: string;
  duration_hours: number;
  start_location: string;
  end_location: string;
  highlights: string[];
  hazards: string[];
  route_details: RouteDetails;
  route_geometry?: {
    type: string;
    coordinates: [number, number][];
  };
}

interface TripCardProps {
  id: number | string;
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
  onModifyRequest?: (id: string) => void;
  // Additional properties
  themes?: string[];
  bestSeasons?: string[];
  recommendedMonths?: string[];
  weather?: string;
  historical?: string;
  intensity?: string;
  whyWeChoseThis?: string;
  recommendedOutfitters?: any[];
  notes?: string[];
  warnings?: string[];
  activities?: Activity[];
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
}

// ActivityDetails Component
interface ActivityDetailsProps {
  activity: Activity;
  onScrollToMap?: () => void;
}

const ActivityDetails = ({ activity, onScrollToMap }: ActivityDetailsProps) => {
  return (
    <div className="text-xs">
      {/* Basic Details - these match the preview data */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 p-3 bg-white rounded border border-gray-200">
        <div>
          <span className="text-gray-500 font-medium">Type:</span> {activity.type}
        </div>
        <div>
          <span className="text-gray-500 font-medium">Difficulty:</span> {activity.difficulty}
        </div>
        <div>
          <span className="text-gray-500 font-medium">Duration:</span> {activity.duration_hours} hours
        </div>
      </div>
      
      {/* Start/End Locations */}
      <div className="bg-white p-3 rounded border border-gray-200 mb-3">
        <h5 className="font-medium mb-2 flex items-center">
          <MapPin className="h-3.5 w-3.5 mr-1.5 text-[#655590]" />
          Locations
        </h5>
        <div className="flex items-center mb-2">
          <Navigation className="h-3.5 w-3.5 mr-1.5 text-green-600" />
          <span className="font-medium">Start:</span> <span className="ml-1">{activity.start_location}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="h-3.5 w-3.5 mr-1.5 text-red-600" />
          <span className="font-medium">End:</span> <span className="ml-1">{activity.end_location}</span>
        </div>
      </div>
      
      {/* Route Details */}
      {activity.route_details && (
        <div className="bg-white p-3 rounded border border-gray-200 mb-3">
          <h5 className="font-medium mb-2 flex items-center">
            <Map className="h-3.5 w-3.5 mr-1.5 text-[#655590]" />
            Route Details
          </h5>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <span className="text-gray-500 font-medium">Distance:</span> {activity.route_details.distance_miles} miles
            </div>
            <div>
              <span className="text-gray-500 font-medium">Terrain:</span> {activity.route_details.terrain}
            </div>
            <div>
              <span className="text-gray-500 font-medium">Elevation gain:</span> {activity.route_details.elevation_gain_ft} ft
            </div>
            <div>
              <span className="text-gray-500 font-medium">Elevation loss:</span> {activity.route_details.elevation_loss_ft} ft
            </div>
            <div>
              <span className="text-gray-500 font-medium">High point:</span> {activity.route_details.high_point_ft} ft
            </div>
            <div>
              <span className="text-gray-500 font-medium">Route type:</span> {activity.route_details.route_type}
            </div>
          </div>
        </div>
      )}
      
      {/* Highlights */}
      {activity.highlights && activity.highlights.length > 0 && (
        <div className="bg-white p-3 rounded border border-gray-200 mb-3">
          <h5 className="font-medium mb-2 flex items-center">
            <Mountain className="h-3.5 w-3.5 mr-1.5 text-green-700" />
            Highlights
          </h5>
          <ul className="list-disc pl-4 space-y-1">
            {activity.highlights.map((highlight, idx) => (
              <li key={idx}>{highlight}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Hazards */}
      {activity.hazards && activity.hazards.length > 0 && (
        <div className="bg-white p-3 rounded border border-gray-200 mb-3">
          <h5 className="font-medium mb-2 flex items-center text-red-700">
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-red-700" />
            Hazards
          </h5>
          <ul className="list-disc pl-4 space-y-1 text-red-700">
            {activity.hazards.map((hazard, idx) => (
              <li key={idx}>{hazard}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Route geometry info */}
      {activity.route_geometry && (
        <div className="bg-white p-3 rounded border border-gray-200">
          <h5 className="font-medium mb-2 flex items-center">
            <Map className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
            Route Information
          </h5>
          <p className="text-xs text-gray-600">
            This route has detailed geometry data that is displayed on the map.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full text-xs"
            onClick={onScrollToMap}
          >
            View on Map
          </Button>
        </div>
      )}
    </div>
  );
};

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
  onEdit,
  themes,
  bestSeasons,
  recommendedMonths,
  weather,
  historical,
  intensity,
  whyWeChoseThis,
  recommendedOutfitters,
  notes = [],
  warnings = [],
  activities = [],
  priceRange
}: TripCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | undefined>(undefined);
  const [showWeather, setShowWeather] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Format price range from object to string
  const formatPriceRange = () => {
    if (!priceRange) return priceEstimate; // Use existing value if no priceRange object
    
    const min = priceRange.min;
    const max = priceRange.max;
    const currency = priceRange.currency || 'USD';
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };
  
  const toggleMapExpand = () => {
    setIsMapExpanded(!isMapExpanded);
  };
  
  const handleActivityClick = (activity: string) => {
    setSelectedActivity(activity === selectedActivity ? undefined : activity);
  };
  
  // Determine grid columns for tabs based on available content
  const getTabsGridColumns = () => {
    let count = 0;
    if (whyWeChoseThis && typeof whyWeChoseThis === 'string') count++;
    if (recommendedOutfitters && recommendedOutfitters.length > 0) count++;
    if ((notes && notes.length > 0) || (warnings && warnings.length > 0)) count++;
    
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    return 'grid-cols-3';
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      // Convert string id to number if needed
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      await apiRequest('DELETE', `/api/trips/${numericId}`);
      
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
  
  // Get coordinates for a specific activity if available
  const getActivityGeometry = (activity: Activity): { geometry: any, type: string } | null => {
    if (activity?.route_geometry) {
      return { 
        geometry: activity.route_geometry,
        type: activity.type
      };
    }
    return null;
  };
  
  // Create a ref for the sticky map container
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Create a state for the current activity details
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
  
  // Function to scroll to the map
  const scrollToMap = () => {
    if (mapContainerRef.current) {
      mapContainerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Find activity data when selectedActivity changes
  useEffect(() => {
    if (selectedActivity && activities && activities.length > 0) {
      const found = activities.find(activity => 
        activity.title.toLowerCase() === selectedActivity.toLowerCase() ||
        selectedActivity.toLowerCase().includes(activity.title.toLowerCase())
      );
      
      setActiveActivity(found || null);
    } else {
      setActiveActivity(null);
    }
  }, [selectedActivity, activities]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Map Section - Now sticky on desktop */}
        <div className="col-span-1 lg:col-span-5">
          <div 
            ref={mapContainerRef}
            className={`${isMapExpanded ? 'h-[400px]' : 'h-[250px]'} lg:h-[400px] lg:sticky lg:top-0 relative transition-all duration-300`}
          >
            {mapCenter && journey && (
              <JourneyMap
                mapId={`map-${id}`}
                center={mapCenter}
                markers={journey.markers || []}
                journey={journey}
                isExpanded={isMapExpanded}
                toggleExpand={toggleMapExpand}
                focusedActivity={selectedActivity}
                highlightedActivity={undefined}
                isThumbnail={false}
                showWeather={showWeather}
              />
            )}
          </div>
          
          {/* Display active activity details below map */}
          {activeActivity && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <h4 className="font-medium text-sm mb-2">{activeActivity.title} Details</h4>
              <ActivityDetails activity={activeActivity} onScrollToMap={scrollToMap} />
            </div>
          )}
        </div>
        
        {/* Trip Info Section */}
        <div className="col-span-1 lg:col-span-7 p-5 overflow-y-auto lg:max-h-[700px]">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 mb-3">Added on {formattedDate}</p>
            </div>
            <div className="flex space-x-1">
              <ShareTripButton tripId={typeof id === 'string' ? parseInt(id) || 0 : id} />
              
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(typeof id === 'string' ? parseInt(id) : id)}
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
          
          {/* Trip Description */}
          <p className="text-gray-600 text-sm mt-3 mb-4">
            {description ? 
              (description.length > 150 ? `${description.substring(0, 150)}...` : description) : 
              "No description available"}
          </p>
          
          {/* Trip Themes */}
          {themes && themes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {themes.map((theme, index) => (
                <Badge key={index} variant="outline" className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                  {theme}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Trip Details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <span>{difficultyLevel} difficulty</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span>{formatPriceRange()}</span>
            </div>
          </div>
          
          {/* Additional Info */}
          {(whyWeChoseThis || (recommendedOutfitters && recommendedOutfitters.length > 0) || (notes && notes.length > 0) || (warnings && warnings.length > 0)) && (
            <div className="mb-4">
              <Tabs defaultValue="why">
                <TabsList className={cn("mb-2", getTabsGridColumns())}>
                  {whyWeChoseThis && (
                    <TabsTrigger value="why">About this Trip</TabsTrigger>
                  )}
                  {recommendedOutfitters && recommendedOutfitters.length > 0 && (
                    <TabsTrigger value="outfitters">Outfitters</TabsTrigger>
                  )}
                  {(notes.length > 0 || warnings.length > 0) && (
                    <TabsTrigger value="notes">Notes & Warnings</TabsTrigger>
                  )}
                </TabsList>
                
                {whyWeChoseThis && (
                  <TabsContent value="why" className="text-sm text-gray-700">
                    <p>{whyWeChoseThis}</p>
                  </TabsContent>
                )}
                
                {recommendedOutfitters && recommendedOutfitters.length > 0 && (
                  <TabsContent value="outfitters">
                    <div className="space-y-3">
                      {recommendedOutfitters.map((outfitter, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-md text-sm">
                          <h5 className="font-medium mb-1">{outfitter.name}</h5>
                          <p className="text-xs text-gray-600 mb-2">{outfitter.description}</p>
                          {outfitter.website && (
                            <a 
                              href={outfitter.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                            >
                              <Info className="h-3 w-3" />
                              Visit website
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                )}
                
                {(notes.length > 0 || warnings.length > 0) && (
                  <TabsContent value="notes">
                    {notes.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium mb-2">Important Notes</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          {notes.map((note, idx) => (
                            <li key={idx} className="text-xs">{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {warnings.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2 text-amber-700">Warnings</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          {warnings.map((warning, idx) => (
                            <li key={idx} className="text-xs text-amber-700">{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
          
          {/* Itinerary Section (Default Open) */}
          <div className="border-t pt-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-gray-700">Itinerary</h4>
              <span className="text-xs text-gray-500">{itinerary?.length || 0} days</span>
            </div>
            
            {/* Activity Timeline - Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left Column: Activity Timeline */}
              <div className="md:col-span-1">
                <h5 className="font-medium text-sm mb-3">Activity Timeline</h5>
                {activities && activities.length > 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                    <ActivityTimelineView activities={activities} />
                  </div>
                ) : itinerary && itinerary.length > 0 ? (
                  <div className="space-y-4">
                    {itinerary.map((day, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <h5 className="font-medium text-sm">Day {day.day}: {day.title || ''}</h5>
                        <p className="text-xs text-gray-600 mt-1 mb-2">{day.description || ''}</p>
                        
                        {/* Activities List */}
                        {day.activities && day.activities.length > 0 && (
                          <div className="mt-2">
                            <h6 className="text-xs font-medium text-gray-500 mb-1.5">Activities:</h6>
                            <div className="space-y-2">
                              {day.activities.map((activityName: string, actIndex: number) => {
                                // Try to find the matching activity in the activities array
                                const activity = activities && activities.find(a => 
                                  a.title.toLowerCase() === activityName.toLowerCase() ||
                                  activityName.toLowerCase().includes(a.title.toLowerCase())
                                );
                                
                                return (
                                  <div 
                                    key={actIndex}
                                    className={cn(
                                      "p-2 rounded-md border cursor-pointer transition-all",
                                      selectedActivity === activityName 
                                        ? "border-[#655590] bg-[#655590]/5" 
                                        : "border-gray-200"
                                    )}
                                    onClick={() => handleActivityClick(activityName)}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h6 className="text-sm font-medium">{activityName}</h6>
                                        {activity && (
                                          <div className="flex flex-wrap gap-2 mt-1">
                                            <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">
                                              {activity.type}
                                            </span>
                                            <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">
                                              {activity.difficulty}
                                            </span>
                                            <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">
                                              {activity.duration_hours}h
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-[#655590]">
                                        {selectedActivity === activityName ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Accommodation if available */}
                        {day.accommodations && (
                          <div className="mt-3 pt-2 border-t border-dashed border-gray-200">
                            <div className="flex items-center gap-1">
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Accommodations:</span> {day.accommodations}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 italic py-4">
                    No itinerary information available
                  </div>
                )}
              </div>
              
              {/* Right Column: Activity Details */}
              <div className="md:col-span-2">
                <h5 className="font-medium text-sm mb-3">Activity Details</h5>
                {activeActivity ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-base">{activeActivity.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                            {activeActivity.type}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                            {activeActivity.difficulty}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                            {activeActivity.duration_hours}h
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          if (!isMapExpanded) toggleMapExpand();
                          scrollToMap();
                        }}
                      >
                        <Map className="h-3.5 w-3.5 mr-1.5" />
                        View on Map
                      </Button>
                    </div>
                    
                    {/* Location Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center bg-gray-50 p-2 rounded">
                        <Navigation className="h-4 w-4 mr-2 text-green-600" />
                        <div>
                          <div className="text-xs text-gray-500">Starting Point</div>
                          <div className="text-sm">{activeActivity.start_location}</div>
                        </div>
                      </div>
                      <div className="flex items-center bg-gray-50 p-2 rounded">
                        <MapPin className="h-4 w-4 mr-2 text-red-600" />
                        <div>
                          <div className="text-xs text-gray-500">Ending Point</div>
                          <div className="text-sm">{activeActivity.end_location}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Route Details */}
                    {activeActivity.route_details && (
                      <div className="bg-gray-50 p-3 rounded mb-4">
                        <h6 className="text-xs font-medium mb-2">Route Information</h6>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                          <div>
                            <span className="text-xs text-gray-500 block">Distance</span>
                            <span>{activeActivity.route_details.distance_miles} miles</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Elevation Gain</span>
                            <span>{activeActivity.route_details.elevation_gain_ft} ft</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Route Type</span>
                            <span>{activeActivity.route_details.route_type}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">High Point</span>
                            <span>{activeActivity.route_details.high_point_ft} ft</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Terrain</span>
                            <span>{activeActivity.route_details.terrain}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Highlights & Hazards in tabs */}
                    <Tabs defaultValue="highlights">
                      <TabsList className="mb-2">
                        <TabsTrigger value="highlights">Highlights</TabsTrigger>
                        <TabsTrigger value="hazards">Hazards</TabsTrigger>
                      </TabsList>
                      <TabsContent value="highlights">
                        {activeActivity.highlights && activeActivity.highlights.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {activeActivity.highlights.map((highlight, idx) => (
                              <li key={idx} className="text-sm">{highlight}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No highlights listed</p>
                        )}
                      </TabsContent>
                      <TabsContent value="hazards">
                        {activeActivity.hazards && activeActivity.hazards.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-1 text-amber-700">
                            {activeActivity.hazards.map((hazard, idx) => (
                              <li key={idx} className="text-sm">{hazard}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No hazards listed</p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <Map className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Select an Activity</h5>
                    <p className="text-xs text-gray-500">
                      Choose an activity from the timeline to view detailed information and route maps
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between">
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                      onClick={toggleMapExpand}
                    >
                      {isMapExpanded ? 'Hide Map' : 'Expand Map'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle map view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={showWeather ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "text-xs",
                        showWeather && "bg-blue-500 hover:bg-blue-600"
                      )}
                      onClick={() => setShowWeather(!showWeather)}
                    >
                      <Cloud className="h-4 w-4 mr-1" />
                      Weather
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle weather overlay</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <Button 
              size="sm" 
              className="bg-[#655590] hover:bg-[#655590]/90 text-xs"
              onClick={() => onEdit && onEdit(typeof id === 'string' ? parseInt(id) : id)}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}