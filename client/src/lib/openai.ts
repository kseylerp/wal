import { Message, TripData } from '../types/chat';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

export async function sendChatMessage(messages: Message[], userMessage: string): Promise<{
  answer: string;
  thinking: string;
  tripData?: TripData[];
}> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        userMessage,
      }),
    });

    if (!response.ok) {
      throw new Error(`API response error: ${response.status}`);
    }

    const data = await response.json();
    return {
      answer: data.answer,
      thinking: data.thinking,
      tripData: data.tripData,
    };
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

export function formatThinking(thinking: string): string {
  // Format thinking content for display
  if (!thinking) return '';

  // Replace line breaks with HTML breaks for proper display
  return thinking.replace(/\n/g, '<br />');
}

export function parseTripsFromResponse(response: any): TripData[] | undefined {
  if (!response || !response.tripData) {
    return undefined;
  }
  
  try {
    const trips = response.tripData;
    
    // Ensure all trips have properly typed data
    const validatedTrips = trips.map((trip: any) => {
      // Transform from new schema to our application TripData format
      const transformedTrip: TripData = {
        id: trip.id || `trip-${Math.random().toString(36).substring(2, 9)}`,
        title: trip.title,
        description: trip.description,
        whyWeChoseThis: Array.isArray(trip.whyWeChoseThis) ? trip.whyWeChoseThis.join('. ') : trip.whyWeChoseThis,
        difficultyLevel: trip.intensity ? trip.intensity.charAt(0).toUpperCase() + trip.intensity.slice(1) : 'Moderate',
        priceEstimate: trip.price_range ? `$${trip.price_range.min} - $${trip.price_range.max}` : 'Varies',
        duration: trip.duration_days ? `${trip.duration_days} Days` : '3-5 Days',
        location: trip.region || '',
        suggestedGuides: trip.recommended_outfitters ? trip.recommended_outfitters.map((o: any) => o.name) : [],
        mapCenter: trip.map_center || [0, 0],
        
        // Convert key_locations to markers
        markers: trip.key_locations ? trip.key_locations.map((loc: any) => ({
          name: loc.name,
          coordinates: loc.coordinates
        })) : [],
        
        // Create journey data from activities
        journey: {
          segments: [],
          totalDistance: 0,
          totalDuration: 0,
          bounds: trip.bounds || [[-74, 40], [-73, 41]]
        },
        
        // Convert new itinerary format to our app format
        itinerary: trip.itinerary ? trip.itinerary.map((day: any) => {
          return {
            day: day.day,
            title: day.title,
            description: day.description,
            activities: day.activities.map((a: any) => a.title || a)
          };
        }) : []
      };
      
      // Build journey segments from activities
      if (trip.itinerary) {
        let journeySegments: any[] = [];
        
        trip.itinerary.forEach((day: any) => {
          if (day.activities && Array.isArray(day.activities)) {
            day.activities.forEach((activity: any) => {
              if (activity.route_geometry && activity.route_details) {
                journeySegments.push({
                  mode: activity.type === 'hiking' ? 'walking' :
                        activity.type === 'biking' ? 'cycling' :
                        activity.type === 'rafting' ? 'driving' : 'walking',
                  from: activity.start_location,
                  to: activity.end_location,
                  distance: activity.route_details.distance_miles * 1609.34, // convert miles to meters
                  duration: activity.duration_hours * 3600, // convert hours to seconds
                  geometry: activity.route_geometry,
                  terrain: activity.route_details.terrain
                });
              }
            });
          }
        });
        
        if (journeySegments.length > 0) {
          transformedTrip.journey.segments = journeySegments;
          
          // Calculate totals
          transformedTrip.journey.totalDistance = journeySegments.reduce((sum, segment) => sum + segment.distance, 0);
          transformedTrip.journey.totalDuration = journeySegments.reduce((sum, segment) => sum + segment.duration, 0);
        }
      }
      
      // Log the trip data for debugging
      console.log('Processed trip data:', {
        title: transformedTrip.title,
        location: transformedTrip.location,
        markers: transformedTrip.markers ? transformedTrip.markers.length : 0,
        segments: transformedTrip.journey ? transformedTrip.journey.segments.length : 0
      });
      
      return transformedTrip;
    });
    
    return validatedTrips;
  } catch (error) {
    console.error('Error parsing trip data:', error);
    return undefined;
  }
}
