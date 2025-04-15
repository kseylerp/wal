import { Message, TripData } from '../types/chat';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

export async function sendChatMessage(messages: Message[], userMessage: string): Promise<{
  answer: string;
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
      tripData: data.tripData,
    };
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

export function parseTripsFromResponse(response: any): TripData[] | undefined {
  if (!response || !response.tripData) {
    return undefined;
  }
  
  try {
    return response.tripData;
  } catch (error) {
    console.error('Error parsing trip data:', error);
    return undefined;
  }
}