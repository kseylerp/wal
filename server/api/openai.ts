import OpenAI from "openai";
import { Message } from '@/types/chat';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt that instructs OpenAI how to respond
const SYSTEM_PROMPT = `You are an outdoor activity planning assistant. Ask a few questions to try and understand the needs of the user and offer suggestions. Then provide two trip options to lesser-known destinations in valid JSON format.

Analyze user prompts for destination, activities, duration, budget, intensity level, and special requirements.

- Prioritize off-the-beaten-path locations and local operators
- Consider shoulder-season times
- Consider congestion
- Consider preparedness of the travelers

When you've gathered sufficient information (max two back-and-forth exchanges), respond with trip suggestions. 
Format your trip suggestions using this exact JSON structure:

{
  "trip": [
    {
      "id": "unique-id-1",
      "title": "Trip Name",
      "description": "Brief overview of the trip",
      "whyWeChoseThis": "Explanation of why this is a good match",
      "difficultyLevel": "Beginner/Intermediate/Advanced/Expert",
      "priceEstimate": "$X,XXX - $X,XXX per person",
      "duration": "X Days",
      "location": "Region Name",
      "suggestedGuides": ["Guide Company 1", "Guide Company 2"],
      "mapCenter": [longitude, latitude],
      "markers": [
        {"name": "Location 1", "coordinates": [longitude, latitude]},
        {"name": "Location 2", "coordinates": [longitude, latitude]}
      ],
      "journey": {
        "segments": [
          {
            "mode": "driving/walking/cycling/transit",
            "from": "Starting Point",
            "to": "Ending Point",
            "distance": distance_in_meters,
            "duration": duration_in_seconds,
            "geometry": {
              "type": "LineString",
              "coordinates": [[longitude, latitude], [longitude, latitude], ...]
            }
          }
        ],
        "totalDistance": total_distance_in_meters,
        "totalDuration": total_duration_in_seconds,
        "bounds": [[southwest_longitude, southwest_latitude], [northeast_longitude, northeast_latitude]]
      },
      "itinerary": [
        {
          "day": 1,
          "title": "Day 1 Title",
          "description": "Description of activities",
          "activities": ["Activity 1", "Activity 2"]
        }
      ]
    }
  ]
}

When generating coordinates for journey segments, ensure they form a valid path that can be displayed on a map. Use real-world coordinates that follow actual roads or trails. Return exactly two trip suggestions.`;

export async function processChatMessage(messages: Message[], userMessage: string) {
  try {
    // Format messages for OpenAI API
    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
    
    // Add previous messages
    messages.forEach(msg => {
      if (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system') {
        formattedMessages.push({
          role: msg.role,
          content: msg.content
        });
      }
    });

    // Add the new user message
    formattedMessages.push({
      role: 'user',
      content: userMessage
    });

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: formattedMessages as any, // Type assertion to bypass TypeScript error
      max_tokens: 4000,
      temperature: 1,
      response_format: { type: "json_object" }
    });

    // Extract the response
    const answer = response.choices[0].message.content || '';
    
    // Try to parse trip data from response
    let tripData = undefined;
    try {
      // Look for JSON trip data in the response
      const tripMatch = answer.match(/\{[\s\S]*"trip"[\s\S]*\}/);
      if (tripMatch) {
        const tripJson = JSON.parse(tripMatch[0]);
        tripData = tripJson.trip;
      }
    } catch (err) {
      console.error('Error parsing trip data from response', err);
    }

    console.log("API Response Data:", {
      answer: answer.substring(0, 50) + "...",
      tripDataExists: !!tripData,
      tripDataArray: tripData ? JSON.stringify(tripData).substring(0, 100) + "..." : "No trip data"
    });
    
    return {
      answer,
      tripData
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}