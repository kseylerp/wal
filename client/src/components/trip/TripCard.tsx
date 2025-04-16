import { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, DollarSign, TrendingUp, Edit, Trash, ChevronDown, ChevronUp, Info, Map, Navigation, Mountain, Clock, AlertTriangle, Droplet, Cloud } from 'lucide-react';
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
  activities = []
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
  
  const toggleMapExpand = () => {
    setIsMapExpanded(!isMapExpanded);
  };
  
  const handleActivityClick = (activity: string) => {
    setSelectedActivity(activity === selectedActivity ? undefined : activity);
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
          
          {/* Trip Description */}
          <p className="text-gray-600 text-sm mt-3 mb-4">
            {description.length > 150 ? `${description.substring(0, 150)}...` : description}
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm mt-4 mb-5">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Location</span>
              <div className="flex items-center text-gray-700 font-medium mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1 text-[#655590]" />
                {location}
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Duration</span>
              <div className="flex items-center text-gray-700 font-medium mt-1">
                <Calendar className="h-3.5 w-3.5 mr-1 text-[#655590]" />
                {duration}
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Difficulty</span>
              <div className="flex items-center text-gray-700 font-medium mt-1">
                <TrendingUp className="h-3.5 w-3.5 mr-1 text-[#655590]" />
                {difficultyLevel}
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Price</span>
              <div className="flex items-center text-gray-700 font-medium mt-1">
                <DollarSign className="h-3.5 w-3.5 mr-1 text-[#655590]" />
                {priceEstimate}
              </div>
            </div>
            
            {/* Additional Trip Information */}
            {bestSeasons && bestSeasons.length > 0 && (
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Best Seasons</span>
                <div className="text-gray-700 font-medium mt-1">
                  {bestSeasons.join(', ')}
                </div>
              </div>
            )}
            
            {recommendedMonths && recommendedMonths.length > 0 && (
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Recommended Months</span>
                <div className="text-gray-700 font-medium mt-1">
                  {recommendedMonths.join(', ')}
                </div>
              </div>
            )}
            
            {intensity && (
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Intensity</span>
                <div className="text-gray-700 font-medium mt-1">
                  {intensity}
                </div>
              </div>
            )}
          </div>
          
          {/* Weather & Historical */}
          {(weather || historical) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {weather && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <h4 className="text-sm font-medium text-blue-700 mb-1">Weather Conditions</h4>
                  <p className="text-xs text-blue-800">{weather}</p>
                </div>
              )}
              
              {historical && (
                <div className="bg-amber-50 p-3 rounded-md">
                  <h4 className="text-sm font-medium text-amber-700 mb-1">Historical Notes</h4>
                  <p className="text-xs text-amber-800">{historical}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Trip Details Tabs - combined tabs for trip details sections */}
          {(whyWeChoseThis || (recommendedOutfitters && recommendedOutfitters.length > 0) || 
           (notes && notes.length > 0) || (warnings && warnings.length > 0)) && (
            <div className="mb-4 border border-gray-200 rounded-md overflow-hidden">
              <Tabs defaultValue="why" className="w-full">
                <div className="border-b border-gray-200">
                  <TabsList className="h-10 w-full bg-gray-50 rounded-none grid grid-cols-3">
                    {whyWeChoseThis && (
                      <TabsTrigger 
                        value="why" 
                        className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#655590] rounded-none text-xs"
                      >
                        Why We Chose This
                      </TabsTrigger>
                    )}
                    {recommendedOutfitters && recommendedOutfitters.length > 0 && (
                      <TabsTrigger 
                        value="outfitters" 
                        className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#655590] rounded-none text-xs"
                      >
                        Outfitters
                      </TabsTrigger>
                    )}
                    {((notes && notes.length > 0) || (warnings && warnings.length > 0)) && (
                      <TabsTrigger 
                        value="notes" 
                        className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#655590] rounded-none text-xs"
                      >
                        Notes & Warnings
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>
                
                {whyWeChoseThis && (
                  <TabsContent value="why" className="p-4">
                    <div className="text-sm text-gray-600">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Why We Chose This Trip</h4>
                      <p>{whyWeChoseThis}</p>
                    </div>
                  </TabsContent>
                )}
                
                {recommendedOutfitters && recommendedOutfitters.length > 0 && (
                  <TabsContent value="outfitters" className="p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Recommended Outfitters</h4>
                    <div className="space-y-3">
                      {recommendedOutfitters.map((outfitter, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-md">
                          <h5 className="font-medium text-sm">{outfitter.name}</h5>
                          <p className="text-xs text-gray-500">{outfitter.specialty}</p>
                          <p className="text-xs text-gray-600 mt-1">{outfitter.location}</p>
                          {outfitter.website && (
                            <a 
                              href={outfitter.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                            >
                              Visit Website
                            </a>
                          )}
                          {outfitter.description && (
                            <p className="text-xs text-gray-600 mt-1">{outfitter.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                )}
                
                {((notes && notes.length > 0) || (warnings && warnings.length > 0)) && (
                  <TabsContent value="notes" className="p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Important Information</h4>
                    
                    {notes && notes.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium text-sm mb-2">Notes:</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          {notes.map((note, index) => (
                            <li key={index} className="text-xs text-gray-600">{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {warnings && warnings.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2 text-red-600">Warnings:</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          {warnings.map((warning, index) => (
                            <li key={index} className="text-xs text-red-600">{warning}</li>
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
            
            <div className="space-y-4">
              {itinerary && itinerary.map((day, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <h5 className="font-medium text-sm">Day {day.day}: {day.title}</h5>
                  <p className="text-xs text-gray-600 mt-1 mb-2">{day.description}</p>
                  
                  {/* Activities List */}
                  {day.activities && day.activities.length > 0 && (
                    <div className="mt-2">
                      <h6 className="text-xs font-medium text-gray-500 mb-1.5">Activities:</h6>
                      <div className="space-y-2">
                        {day.activities.map((activityName: string, actIndex: number) => {
                          // Try to find the matching activity in the activities array
                          const activity = activities.find(a => 
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
                              
                              {/* Activity Details (expanded view) */}
                              {selectedActivity === activityName && activity && (
                                <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                    <div>
                                      <span className="text-gray-500">Start:</span> {activity.start_location}
                                    </div>
                                    <div>
                                      <span className="text-gray-500">End:</span> {activity.end_location}
                                    </div>
                                  </div>
                                  
                                  {/* Route Details */}
                                  {activity.route_details && (
                                    <div className="bg-white p-2 rounded border border-gray-100 mt-2 mb-2">
                                      <h6 className="text-xs font-medium mb-1">Route Details:</h6>
                                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                        <div>
                                          <span className="text-gray-500">Distance:</span> {activity.route_details.distance_miles} miles
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Elev. Gain:</span> {activity.route_details.elevation_gain_ft} ft
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Elev. Loss:</span> {activity.route_details.elevation_loss_ft} ft
                                        </div>
                                        <div>
                                          <span className="text-gray-500">High Point:</span> {activity.route_details.high_point_ft} ft
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Terrain:</span> {activity.route_details.terrain}
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Type:</span> {activity.route_details.route_type}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Highlights */}
                                  {activity.highlights && activity.highlights.length > 0 && (
                                    <div className="mb-2">
                                      <h6 className="text-xs font-medium mb-1">Highlights:</h6>
                                      <ul className="list-disc pl-4 text-xs space-y-0.5">
                                        {activity.highlights.map((highlight, i) => (
                                          <li key={i}>{highlight}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {/* Hazards */}
                                  {activity.hazards && activity.hazards.length > 0 && (
                                    <div>
                                      <h6 className="text-xs font-medium mb-1 text-amber-700">Hazards:</h6>
                                      <ul className="list-disc pl-4 text-xs space-y-0.5 text-amber-700">
                                        {activity.hazards.map((hazard, i) => (
                                          <li key={i}>{hazard}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {/* View on Map Button */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 w-full text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isMapExpanded) toggleMapExpand();
                                      scrollToMap(); // Scroll to the map section
                                    }}
                                  >
                                    View Route on Map
                                  </Button>
                                </div>
                              )}
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
              onClick={() => onEdit && onEdit(id)}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}