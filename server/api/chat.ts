import Anthropic from '@anthropic-ai/sdk';
import { Message } from '@/types/chat';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// System prompt that instructs Claude how to respond
const SYSTEM_PROMPT = `You are an outdoor activity planning assistant. Ask a few questions to try and understand the needs of the user and offer suggestions. Then provide two trip options to lesser-known destinations in valid JSON format.

Analyze user prompts for destination, activities, duration, budget, intensity level, and special requirements.

- Prioritize off-the-beaten-path locations and local operators
- Consider shoulder-season times
- Consider congestion
- Consider preparedness of the travelers

When you've gathered sufficient information (max two back-and-forth exchanges), respond with trip suggestions. 
Format your trip suggestions using this exact JSON structure inside a trip_format tool call:

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
    // Format messages for Claude API - need to filter system messages
    const formattedMessages = messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

    // Add the new user message
    formattedMessages.push({
      role: 'user',
      content: userMessage
    });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: formattedMessages,
      temperature: 1,
      tools: [
        {
          name: "trip_format",
          input_schema: {
            type: "object",
            properties: {
              trip: {
                type: "array",
                items: {
                  type: "object",
                  required: [
                    "id",
                    "title",
                    "description",
                    "whyWeChoseThis",
                    "difficultyLevel",
                    "priceEstimate",
                    "duration",
                    "location",
                    "suggestedGuides",
                    "mapCenter",
                    "markers",
                    "journey",
                    "itinerary"
                  ],
                  properties: {
                    id: {
                      type: "string",
                      description: "Unique identifier for the trip"
                    },
                    title: {
                      type: "string",
                      description: "Title of the trip"
                    },
                    description: {
                      type: "string",
                      description: "Brief overview of the trip"
                    },
                    whyWeChoseThis: {
                      type: "string",
                      description: "Explanation of why this trip is a good match"
                    },
                    difficultyLevel: {
                      type: "string",
                      description: "Difficulty level of the trip"
                    },
                    priceEstimate: {
                      type: "string", 
                      description: "Estimated price range for the trip"
                    },
                    duration: {
                      type: "string",
                      description: "Duration of the trip"
                    },
                    location: {
                      type: "string",
                      description: "Region name of the trip"
                    },
                    suggestedGuides: {
                      type: "array",
                      items: {
                        type: "string"
                      },
                      description: "List of suggested guide companies"
                    },
                    mapCenter: {
                      type: "array",
                      items: {
                        type: "number"
                      },
                      maxItems: 2,
                      minItems: 2,
                      description: "Center coordinates of the trip map [longitude, latitude]"
                    },
                    markers: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["name", "coordinates"],
                        properties: {
                          name: {
                            type: "string",
                            description: "Name of the location"
                          },
                          coordinates: {
                            type: "array",
                            items: {
                              type: "number"
                            },
                            maxItems: 2,
                            minItems: 2,
                            description: "Coordinates of the location [longitude, latitude]"
                          }
                        }
                      },
                      description: "List of markers for the trip map"
                    },
                    journey: {
                      type: "object",
                      required: ["segments", "totalDistance", "totalDuration", "bounds"],
                      properties: {
                        segments: {
                          type: "array",
                          items: {
                            type: "object",
                            required: ["mode", "from", "to", "distance", "duration", "geometry"],
                            properties: {
                              mode: {
                                type: "string",
                                enum: ["walking", "driving", "cycling", "transit"],
                                description: "Mode of transportation"
                              },
                              from: {
                                type: "string",
                                description: "Starting point name"
                              },
                              to: {
                                type: "string",
                                description: "Ending point name"
                              },
                              distance: {
                                type: "number",
                                description: "Distance in meters"
                              },
                              duration: {
                                type: "number",
                                description: "Duration in seconds"
                              },
                              geometry: {
                                type: "object",
                                required: ["type", "coordinates"],
                                properties: {
                                  type: {
                                    type: "string",
                                    enum: ["LineString"],
                                    description: "Type of geometry"
                                  },
                                  coordinates: {
                                    type: "array",
                                    items: {
                                      type: "array",
                                      items: {
                                        type: "number"
                                      },
                                      maxItems: 2,
                                      minItems: 2
                                    },
                                    description: "Array of coordinates forming the path"
                                  }
                                }
                              }
                            }
                          }
                        },
                        totalDistance: {
                          type: "number",
                          description: "Total journey distance in meters"
                        },
                        totalDuration: {
                          type: "number",
                          description: "Total journey duration in seconds"
                        },
                        bounds: {
                          type: "array",
                          items: {
                            type: "array",
                            items: {
                              type: "number"
                            },
                            maxItems: 2,
                            minItems: 2
                          },
                          maxItems: 2,
                          minItems: 2,
                          description: "Bounding box for the journey [[southwest_lng, southwest_lat], [northeast_lng, northeast_lat]]"
                        }
                      }
                    },
                    itinerary: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["day", "title", "description", "activities"],
                        properties: {
                          day: {
                            type: "number",
                            description: "Day number in the itinerary"
                          },
                          title: {
                            type: "string",
                            description: "Title for this day"
                          },
                          description: {
                            type: "string",
                            description: "Description of activities for this day"
                          },
                          activities: {
                            type: "array",
                            items: {
                              type: "string"
                            },
                            description: "List of activities for this day"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ]
    });

    // Extract the thinking process if available
    let thinking = '';
    const thinkingContent = response.content.find(item => item.type === 'thinking');
    if (thinkingContent && 'thinking' in thinkingContent) {
      thinking = thinkingContent.thinking;
    }

    // Extract the text response
    let answer = '';
    const textContent = response.content.find(item => item.type === 'text');
    if (textContent && 'text' in textContent) {
      answer = textContent.text;
    }

    // Extract the trip data if tool calls were made
    let tripData = undefined;
    // @ts-ignore - Anthropic API types in package might be outdated
    if (response.tool_calls && response.tool_calls.length > 0) {
      // @ts-ignore
      const tripToolCall = response.tool_calls.find((tool: any) => tool.name === 'trip_format');
      if (tripToolCall && tripToolCall.input) {
        try {
          tripData = (tripToolCall.input as any).trip;
        } catch (err) {
          console.error('Error parsing trip data from tool call', err);
        }
      }
    }

    console.log("API Response Data:", {
      answer: answer.substring(0, 50) + "...",
      thinkingExists: !!thinking,
      tripDataExists: !!tripData,
      tripDataArray: tripData ? JSON.stringify(tripData).substring(0, 100) + "..." : "No trip data"
    });
    
    return {
      answer,
      thinking,
      tripData
    };
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    throw error;
  }
}
