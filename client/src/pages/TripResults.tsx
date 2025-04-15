import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TripResponse, Trip } from '@/types/trip-schema';
import MapTest from './MapTest';

const TripResults: React.FC = () => {
  const [tripPlans, setTripPlans] = useState<TripResponse | null>(null);
  const [selectedTripIndex, setSelectedTripIndex] = useState(0);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Load trip plans from localStorage (would be from your state management or API in a real app)
    const storedTrips = localStorage.getItem('tripPlans');

    if (storedTrips) {
      try {
        const parsedTrips = JSON.parse(storedTrips) as TripResponse;
        setTripPlans(parsedTrips);
      } catch (error) {
        console.error('Error parsing stored trips:', error);
        toast({
          title: "Error",
          description: "There was a problem loading your trip plans.",
          variant: "destructive"
        });
        setLocation('/trip-planner');
      }
    } else {
      // No trips found, redirect back to planner
      toast({
        title: "No Trips Found",
        description: "Please create a trip plan first.",
        variant: "destructive"
      });
      setLocation('/trip-planner');
    }
  }, [setLocation, toast]);

  // Helper function to format season names
  const formatSeasons = (seasons: string[]) => {
    return seasons.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ');
  };

  // If there are no trips yet, show loading state
  if (!tripPlans || !tripPlans.trips || tripPlans.trips.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-medium">Loading your trip plans...</h2>
      </div>
    );
  }

  const selectedTrip = tripPlans.trips[selectedTripIndex];

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Trip Plans</h1>
          <p className="text-gray-600">
            Here are your personalized trip plans. Select a plan to view details.
          </p>
        </div>
        <Button onClick={() => setLocation('/trip-planner')} variant="outline">
          Create New Plan
        </Button>
      </div>

      {/* Trip selection tabs */}
      {tripPlans.trips.length > 1 && (
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
          {tripPlans.trips.map((trip, index) => (
            <Button
              key={trip.id}
              variant={index === selectedTripIndex ? "default" : "outline"}
              onClick={() => setSelectedTripIndex(index)}
              className="whitespace-nowrap"
            >
              {trip.title}
            </Button>
          ))}
        </div>
      )}

      {/* Selected trip overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{selectedTrip.title}</CardTitle>
                  <p className="text-gray-600 mt-1">{selectedTrip.description}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {selectedTrip.intensity.charAt(0).toUpperCase() + selectedTrip.intensity.slice(1)} Intensity
                  </Badge>
                  <Badge variant="outline" className="bg-orange-100 text-orange-700">
                    {selectedTrip.duration_days} Days
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <h4 className="text-xs uppercase text-gray-500 font-medium">Price Range</h4>
                  <p className="font-medium">${selectedTrip.price_range.min}-{selectedTrip.price_range.max}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase text-gray-500 font-medium">Best Season</h4>
                  <p className="font-medium">{formatSeasons(selectedTrip.best_seasons)}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase text-gray-500 font-medium">Region</h4>
                  <p className="font-medium">{selectedTrip.region}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase text-gray-500 font-medium">Activities</h4>
                  <p className="font-medium">{selectedTrip.themes.slice(0, 2).join(', ')}{selectedTrip.themes.length > 2 ? '...' : ''}</p>
                </div>
              </div>
              
              <h3 className="font-medium mb-2">Why We Chose This For You</h3>
              <ul className="space-y-1 mb-4">
                {selectedTrip.whyWeChoseThis.map((reason, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2 text-primary mt-1">•</span>
                    <span className="text-gray-700">{reason}</span>
                  </li>
                ))}
              </ul>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Current Weather</h3>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">
                      Source: {selectedTrip.weather.current_forecast.source}
                    </div>
                    <div className="space-y-2">
                      {selectedTrip.weather.current_forecast.daily.slice(0, 2).map((day, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{new Date(day.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</div>
                            <div className="text-xs">{day.conditions}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{day.high_f}°F / {day.low_f}°F</div>
                            <div className="text-xs">{day.precipitation_chance}% precip</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Historical Weather</h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-gray-500">Average High</div>
                        <div className="font-medium">{selectedTrip.weather.historical.avg_high_f}°F</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Average Low</div>
                        <div className="font-medium">{selectedTrip.weather.historical.avg_low_f}°F</div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs text-gray-500">Typical Conditions</div>
                      <div className="text-sm">{selectedTrip.weather.historical.typical_conditions.join(', ')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recommended Outfitters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedTrip.recommended_outfitters.map((outfitter, i) => (
                  <div key={i} className="border-b pb-3 last:border-0 last:pb-0">
                    <div className="font-medium">{outfitter.name}</div>
                    <div className="text-sm text-gray-600 mb-1">
                      {outfitter.specialty} - {outfitter.location}
                    </div>
                    <div className="text-xs text-blue-600 hover:underline mb-1">
                      <a href={outfitter.website} target="_blank" rel="noopener noreferrer">
                        {outfitter.website.replace('https://', '')}
                      </a>
                    </div>
                    <div className="text-xs text-gray-500">{outfitter.phone}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Important Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Notes</h4>
                    <ul className="space-y-1">
                      {selectedTrip.notes.map((note, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <span className="mr-2 text-primary mt-1">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-red-600 mb-1">Warnings</h4>
                    <ul className="space-y-1">
                      {selectedTrip.warnings.map((warning, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <span className="mr-2 text-red-600 mt-1">⚠</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main content area - map and itinerary */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-6">Interactive Trip Map</h2>
        <div className="bg-gray-100 p-4 mb-4 rounded-lg">
          <p className="text-sm text-gray-700">
            Click on any activity in the itinerary below to see its route on the map. The map shows all key locations
            for your trip, including cities, trailheads, campsites, and points of interest.
          </p>
        </div>
        
        {/* This would be replaced with the actual map component passing the selected trip data */}
        <div className="h-[500px] mb-8 bg-gray-100 border rounded-lg">
          {/* In a production app, we would pass the selectedTrip data to the MapTest component */}
          <MapTest />
        </div>
      </div>
      
      {/* Itinerary section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Day-by-Day Itinerary</h2>
        <div className="space-y-6">
          {selectedTrip.itinerary.map((day) => (
            <Card key={day.day} className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Day {day.day}: {day.title}</CardTitle>
                  <Badge variant="outline">
                    {day.lodging.type.charAt(0).toUpperCase() + day.lodging.type.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-700">{day.description}</p>
                
                <h3 className="font-medium mb-2">Activities</h3>
                <div className="space-y-4">
                  {day.activities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="border rounded p-3 cursor-pointer hover:bg-gray-50"
                      // In a real implementation, this would display the route on the map
                      onClick={() => console.log('Display route for activity:', activity.id)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{activity.title}</h4>
                        <Badge variant="outline">
                          {activity.difficulty.charAt(0).toUpperCase() + activity.difficulty.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                        <div>
                          <div className="text-xs text-gray-500">Distance</div>
                          <div>{activity.route_details.distance_miles} miles</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Elevation Gain</div>
                          <div>{activity.route_details.elevation_gain_ft.toLocaleString()} ft</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Duration</div>
                          <div>{activity.duration_hours} hrs</div>
                        </div>
                      </div>
                      
                      {activity.highlights.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-green-600 font-medium mb-1">HIGHLIGHTS</div>
                          <div className="flex flex-wrap gap-1">
                            {activity.highlights.map((h, i) => (
                              <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">{h}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {activity.hazards.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-red-600 font-medium mb-1">HAZARDS</div>
                          <div className="flex flex-wrap gap-1">
                            {activity.hazards.map((h, i) => (
                              <span key={i} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">{h}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <h3 className="font-medium mt-4 mb-2">Lodging</h3>
                <div className="border rounded p-3">
                  <div className="flex items-start">
                    <div className="bg-pink-100 p-1 rounded mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">{day.lodging.name}</div>
                      <div className="text-sm text-gray-600">{day.lodging.location}</div>
                      <div className="text-xs text-gray-500 mt-1">{day.lodging.notes}</div>
                      {day.lodging.booking_link && (
                        <a 
                          href={day.lodging.booking_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                        >
                          View booking information
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TripResults;