import OpenAI from 'openai';
import { Message } from '@/types/chat';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt that instructs the AI how to respond
const SYSTEM_PROMPT = `You are an outdoor activity planning assistant. Ask a few questions to try and understand the needs of the user and offer suggestions. Then provide two trip options to lesser-known destinations in valid JSON format.

Analyze user prompts for destination, activities, duration, budget, intensity level, and special requirements.

- Prioritize off-the-beaten-path locations and local operators
- Consider shoulder-season times
- Consider congestion
- Consider preparedness of the travelers

When you've gathered sufficient information (max two back-and-forth exchanges), respond with trip suggestions. 
Format your trip suggestions using this exact JSON structure for the trip_format function:

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
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add the new user message
    formattedMessages.push({
      role: 'user',
      content: userMessage
    });

    // Define the trip_format tool
    const tools = [
      {
        type: "function",
        function: {
          name: "trip_format",
          description: "Format trip suggestions as structured data",
          parameters: {
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
            },
            required: ["trip"]
          }
        }
      }
    ];

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...formattedMessages
      ],
      temperature: 1,
      tools: tools as any,
      tool_choice: "auto"
    });

    // Extract the text response
    let answer = '';
    if (response.choices && response.choices.length > 0 && response.choices[0].message.content) {
      answer = response.choices[0].message.content;
    }

    // Extract the trip data if tool calls were made
    let tripData = undefined;
    if (response.choices[0].message.tool_calls && response.choices[0].message.tool_calls.length > 0) {
      const tripToolCall = response.choices[0].message.tool_calls.find(
        (tool: any) => tool.function.name === 'trip_format'
      );
      
      if (tripToolCall && tripToolCall.function && tripToolCall.function.arguments) {
        try {
          const toolArguments = JSON.parse(tripToolCall.function.arguments);
          tripData = toolArguments.trip;
        } catch (err) {
          console.error('Error parsing trip data from tool call', err);
        }
      }
    }

    // For now, we don't have thinking as OpenAI doesn't expose this
    const thinking = '';

    return {
      answer,
      thinking,
      tripData
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}
