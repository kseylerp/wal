import { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getQueryFn } from '@/lib/queryClient';
import { Trip } from '@shared/schema';
import JourneyMap from '@/components/trip/JourneyMap';
import ItineraryList from '@/components/trip/ItineraryList';

// Define interfaces for type safety
interface JourneyData {
  markers: Array<{
    name: string;
    coordinates: [number, number];
  }>;
  segments: any[];
  totalDistance: number;
  totalDuration: number;
  bounds: [[number, number], [number, number]];
}

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  accommodations?: string;
}

// Extended Trip type with proper typing for journey data and itinerary
interface SharedTrip extends Trip {
  mapCenter: [number, number];
  journeyData: JourneyData;
  itinerary: ItineraryDay[];
}

export default function SharedTripPage() {
  const [, params] = useRoute('/trips/shared/:shareableId');
  const [, navigate] = useLocation();
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  
  const { 
    data: trip, 
    isLoading, 
    error 
  } = useQuery<SharedTrip>({
    queryKey: [`/api/trips/shared/${params?.shareableId}`],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: Boolean(params?.shareableId),
  });

  // Function to toggle map expansion
  const toggleMapExpand = () => {
    setIsMapExpanded(!isMapExpanded);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fcf8f5]">
      {/* Header */}
      <header className="bg-[#655590] text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center">
            <span className="text-[#FB8C9A] mr-1">Wally</span> Trip Sharing
          </h1>
          <Button 
            variant="outline" 
            className="text-white border-white hover:bg-white/20 hover:text-white"
            onClick={() => navigate('/')}
          >
            Plan Your Own Trip
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto p-4 md:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#655590]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-300 rounded-lg p-6 text-center">
            <h2 className="text-xl text-red-700 font-medium mb-2">Error Loading Trip</h2>
            <p className="text-red-600">
              We couldn't load the shared trip. It may have been removed or the sharing link is invalid.
            </p>
            <Button 
              variant="default" 
              className="mt-4 bg-[#655590] hover:bg-[#655590]/90"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </div>
        ) : !trip ? (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-6 text-center">
            <h2 className="text-xl text-amber-700 font-medium mb-2">Trip Not Found</h2>
            <p className="text-amber-600">
              The shared trip you're looking for doesn't exist or is no longer available.
            </p>
            <Button 
              variant="default" 
              className="mt-4 bg-[#655590] hover:bg-[#655590]/90"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Trip header */}
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold mb-2">{trip.title}</h1>
              <p className="text-gray-600 mb-4">{trip.description}</p>
              
              <div className="flex flex-wrap gap-3 mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1 text-[#655590]" />
                  {trip.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1 text-[#655590]" />
                  {trip.duration}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4 mr-1 text-[#655590]" />
                  {trip.difficultyLevel} difficulty
                </div>
              </div>
            </div>
            
            {/* Journey Map */}
            <div className={`relative ${isMapExpanded ? 'h-[600px]' : 'h-[300px]'} transition-all duration-300`}>
              {trip.mapCenter && trip.journeyData && (
                <JourneyMap
                  mapId={`map-${trip.id}`}
                  center={trip.mapCenter as [number, number]}
                  markers={trip.journeyData.markers || []}
                  journey={trip.journeyData}
                  isExpanded={isMapExpanded}
                  toggleExpand={toggleMapExpand}
                />
              )}
            </div>
            
            {/* Itinerary */}
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Trip Itinerary</h2>
              {trip.itinerary && (
                <ItineraryList
                  itinerary={trip.itinerary}
                  suggestedGuides={[]}
                  journey={trip.journeyData}
                />
              )}
            </div>
            
            {/* Call to action */}
            <div className="bg-gray-50 p-6 border-t">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Ready to plan your own adventure?</h3>
                <p className="text-gray-600 mb-4">
                  Create your own personalized trip with <span className="text-[#FB8C9A] font-medium">Wally</span>, powered by local guides.
                </p>
                <Button
                  className="bg-[#655590] hover:bg-[#655590]/90"
                  onClick={() => navigate('/')}
                >
                  Start Planning
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Wally • AI-Powered Travel Planning</p>
        </div>
      </footer>
    </div>
  );
}