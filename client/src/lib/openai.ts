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
    
    // Server returns { userMessage, aiMessage } format
    // Convert it to the expected format for the client
    if (data.aiMessage) {
      return {
        answer: data.aiMessage.content || '',
        thinking: data.aiMessage.thinking || '',
        tripData: data.aiMessage.tripData,
      };
    } else {
      // Fallback for backwards compatibility
      return {
        answer: data.answer || '',
        thinking: data.thinking || '',
        tripData: data.tripData,
      };
    }
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
      // Make sure journey segments have proper typing
      if (trip.journey && trip.journey.segments) {
        trip.journey.segments = trip.journey.segments.map((segment: any) => {
          return {
            ...segment,
            // Ensure geometry is LineString type
            geometry: {
              type: 'LineString' as const,
              coordinates: segment.geometry.coordinates
            }
          };
        });
      }
      
      // Log the trip data for debugging
      console.log('Processed trip data:', {
        title: trip.title,
        location: trip.location,
        markers: trip.markers ? trip.markers.length : 0,
        segments: trip.journey ? trip.journey.segments.length : 0
      });
      
      return trip;
    });
    
    return validatedTrips;
  } catch (error) {
    console.error('Error parsing trip data:', error);
    return undefined;
  }
}
