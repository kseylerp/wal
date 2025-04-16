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
      // Convert the new schema to the expected format in our app
      
      // Handle difficultyLevel conversion (from intensity)
      const difficultyLevelMap: { [key: string]: string } = {
        'low': 'Beginner',
        'moderate': 'Intermediate',
        'high': 'Advanced',
        'extreme': 'Expert'
      };
      
      // Create journey from the activities in the itinerary
      let journeySegments: any[] = [];
      let markers: any[] = [];
      
      // Add key locations as markers
      if (trip.key_locations && Array.isArray(trip.key_locations)) {
        markers = trip.key_locations.map((loc: any) => ({
          name: loc.name,
          coordinates: loc.coordinates
        }));
      }
      
      // Extract route geometry from activities to create journey segments
      if (trip.itinerary && Array.isArray(trip.itinerary)) {
        trip.itinerary.forEach((day: any) => {
          if (day.activities && Array.isArray(day.activities)) {
            day.activities.forEach((activity: any) => {
              // If the activity has route geometry, add it as a journey segment
              if (activity.route_geometry && activity.route_geometry.coordinates) {
                journeySegments.push({
                  mode: activity.type === 'hiking' ? 'walking' : 
                        activity.type === 'biking' ? 'cycling' : 
                        activity.type === 'driving' ? 'driving' : 'walking',
                  from: activity.start_location,
                  to: activity.end_location,
                  distance: activity.route_details?.distance_miles ? activity.route_details.distance_miles * 1609.34 : 0, // Convert miles to meters
                  duration: activity.duration_hours ? activity.duration_hours * 3600 : 0, // Convert hours to seconds
                  geometry: {
                    type: 'LineString' as const,
                    coordinates: activity.route_geometry.coordinates
                  }
                });
              }
            });
          }
        });
      }
      
      // Initialize with existing journey data if present, otherwise empty
      const journey = {
        segments: journeySegments,
        totalDistance: journeySegments.reduce((total, segment) => total + segment.distance, 0),
        totalDuration: journeySegments.reduce((total, segment) => total + segment.duration, 0),
        bounds: trip.bounds || [[0, 0], [0, 0]]
      };
      
      // Format the itinerary days
      const itinerary = trip.itinerary?.map((day: any) => {
        return {
          day: day.day,
          title: day.title,
          description: day.description,
          activities: day.activities?.map((act: any) => act.title) || []
        };
      }) || [];

      // Format price range
      const priceEstimate = trip.price_range ? 
        `$${trip.price_range.min.toLocaleString()} - $${trip.price_range.max.toLocaleString()} ${trip.price_range.currency}` : 
        '';
      
      // Convert to expected TripData format
      const formattedTrip: TripData = {
        id: trip.id,
        title: trip.title,
        description: trip.description,
        whyWeChoseThis: Array.isArray(trip.whyWeChoseThis) ? trip.whyWeChoseThis.join('. ') : trip.whyWeChoseThis,
        difficultyLevel: difficultyLevelMap[trip.intensity] || trip.intensity,
        priceEstimate,
        duration: `${trip.duration_days} Days`,
        location: trip.region,
        suggestedGuides: trip.recommended_outfitters?.map((outfitter: any) => outfitter.name) || [],
        mapCenter: trip.map_center,
        markers: markers,
        journey: journey,
        itinerary: itinerary
      };
      
      // Log the trip data for debugging
      console.log('Processed trip data:', {
        title: formattedTrip.title,
        location: formattedTrip.location,
        markers: formattedTrip.markers?.length || 0,
        segments: formattedTrip.journey?.segments.length || 0
      });
      
      return formattedTrip;
    });
    
    return validatedTrips;
  } catch (error) {
    console.error('Error parsing trip data:', error);
    return undefined;
  }
}
