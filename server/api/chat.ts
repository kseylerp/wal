import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { Message } from '@/types/chat';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Using the specific assistant ID as requested
const ASSISTANT_ID = 'asst_LxWLQAQzSQgk3rNTAPNhj5Uv';

// System prompt that instructs the AI how to respond
const SYSTEM_PROMPT = `You are an outdoor activity planning assistant. Ask a few questions to try and understand the needs of the user and offer suggestions. Max two back and forth. Then provide two trip options to lesser-known destinations in valid JSON format.

Analyze user prompts for destination, activities, duration, budget, intensity level, and special requirements.

- Prioritize off-the-beaten-path locations and local operators
- Consider shoulder-season times
- Consider congestion
- Consider preparedness
- Activities and Itineraries need to consider the time it will take to do that activity, time of day, if you need to camp, and how long to get back.

Once you send the JSON, allow the user to thread chat back at you to modify the JSON.

Format your trip suggestions using this exact JSON structure for the trip_format function:

{
  "trips": [
    {
      "id": "unique-id-1",
      "title": "Trip Name",
      "description": "Brief overview of the trip",
      "themes": ["Adventure", "Nature", "Hiking"],
      "region": "Region Name",
      "duration_days": 5,
      "intensity": "moderate",
      "price_range": {
        "min": 500,
        "max": 1500,
        "currency": "USD"
      },
      "best_seasons": ["spring", "fall"],
      "recommended_months": [4, 5, 9, 10],
      "weather": {
        "historical": {
          "avg_high_f": 75,
          "avg_low_f": 45,
          "avg_precipitation_inches": 1.2,
          "typical_conditions": ["Sunny", "Partly Cloudy"]
        }
      },
      "map_center": [longitude, latitude],
      "bounds": [[southwest_lng, southwest_lat], [northeast_lng, northeast_lat]],
      "key_locations": [
        {
          "id": "loc-1",
          "name": "Location Name",
          "type": "trailhead",
          "coordinates": [longitude, latitude],
          "elevation_ft": 5280,
          "description": "Description of this location"
        }
      ],
      "itinerary": [
        {
          "day": 1,
          "title": "Day 1 Title",
          "description": "Day 1 description",
          "lodging": {
            "type": "camping",
            "name": "Campground Name",
            "location": "Location description",
            "coordinates": [longitude, latitude]
          },
          "activities": [
            {
              "id": "act-1",
              "title": "Activity Title",
              "type": "hiking",
              "difficulty": "moderate",
              "duration_hours": 4,
              "start_location": "Start point",
              "end_location": "End point",
              "highlights": ["Scenic views", "Wildlife"],
              "hazards": ["Steep terrain"],
              "route_details": {
                "distance_miles": 8,
                "elevation_gain_ft": 1200,
                "elevation_loss_ft": 800,
                "high_point_ft": 9600,
                "terrain": "Rocky trail with stream crossings",
                "route_type": "loop"
              },
              "route_geometry": {
                "type": "LineString",
                "coordinates": [[lng1, lat1], [lng2, lat2]]
              }
            }
          ]
        }
      ],
      "whyWeChoseThis": "Explanation of why this trip is a good match for the user",
      "recommended_outfitters": [
        {
          "name": "Outfitter Name",
          "specialty": "Hiking Tours",
          "location": "Location",
          "website": "https://example.com",
          "description": "Description of this outfitter"
        }
      ],
      "notes": ["Important note 1", "Important note 2"],
      "warnings": ["Warning about conditions", "Safety information"]
    }
  ]
}`;

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
              trips: {
                type: "array",
                items: {
                  type: "object",
                  required: [
                    "id",
                    "title",
                    "description",
                    "themes",
                    "region",
                    "duration_days",
                    "intensity",
                    "price_range",
                    "best_seasons",
                    "recommended_months",
                    "weather",
                    "map_center",
                    "bounds",
                    "key_locations",
                    "itinerary",
                    "whyWeChoseThis",
                    "recommended_outfitters",
                    "notes",
                    "warnings"
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
                    themes: {
                      type: "array",
                      items: {
                        type: "string"
                      },
                      description: "Themes of the trip (e.g., Adventure, Nature, Hiking)"
                    },
                    region: {
                      type: "string",
                      description: "Region name of the trip"
                    },
                    duration_days: {
                      type: "number",
                      description: "Duration of the trip in days"
                    },
                    intensity: {
                      type: "string",
                      enum: ["low", "moderate", "high", "extreme"],
                      description: "Intensity level of the trip"
                    },
                    price_range: {
                      type: "object",
                      required: ["min", "max", "currency"],
                      properties: {
                        min: {
                          type: "number",
                          description: "Minimum price"
                        },
                        max: {
                          type: "number",
                          description: "Maximum price"
                        },
                        currency: {
                          type: "string",
                          description: "Currency code (e.g., USD)"
                        }
                      }
                    },
                    best_seasons: {
                      type: "array",
                      items: {
                        type: "string",
                        enum: ["spring", "summer", "fall", "winter"]
                      },
                      description: "Best seasons for this trip"
                    },
                    recommended_months: {
                      type: "array",
                      items: {
                        type: "number",
                        minimum: 1,
                        maximum: 12
                      },
                      description: "Recommended months (1-12) for this trip"
                    },
                    weather: {
                      type: "object",
                      required: ["historical"],
                      properties: {
                        historical: {
                          type: "object",
                          required: ["avg_high_f", "avg_low_f", "avg_precipitation_inches", "typical_conditions"],
                          properties: {
                            avg_high_f: {
                              type: "number",
                              description: "Average high temperature in Fahrenheit"
                            },
                            avg_low_f: {
                              type: "number",
                              description: "Average low temperature in Fahrenheit"
                            },
                            avg_precipitation_inches: {
                              type: "number",
                              description: "Average precipitation in inches"
                            },
                            typical_conditions: {
                              type: "array",
                              items: {
                                type: "string"
                              },
                              description: "Typical weather conditions"
                            }
                          }
                        }
                      }
                    },
                    map_center: {
                      type: "array",
                      items: {
                        type: "number"
                      },
                      maxItems: 2,
                      minItems: 2,
                      description: "Center coordinates of the trip map [longitude, latitude]"
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
                      description: "Bounding box [[southwest_lng, southwest_lat], [northeast_lng, northeast_lat]]"
                    },
                    key_locations: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["id", "name", "type", "coordinates", "elevation_ft", "description"],
                        properties: {
                          id: {
                            type: "string",
                            description: "Unique identifier for this location"
                          },
                          name: {
                            type: "string",
                            description: "Name of the location"
                          },
                          type: {
                            type: "string",
                            enum: ["city", "town", "trailhead", "campground", "viewpoint", "landmark"],
                            description: "Type of location"
                          },
                          coordinates: {
                            type: "array",
                            items: {
                              type: "number"
                            },
                            maxItems: 2,
                            minItems: 2,
                            description: "Coordinates [longitude, latitude]"
                          },
                          elevation_ft: {
                            type: "number",
                            description: "Elevation in feet"
                          },
                          description: {
                            type: "string",
                            description: "Description of this location"
                          }
                        }
                      }
                    },
                    itinerary: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["day", "title", "description", "lodging", "activities"],
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
                          lodging: {
                            type: "object",
                            required: ["type", "name", "location", "coordinates"],
                            properties: {
                              type: {
                                type: "string",
                                enum: ["hotel", "camping", "hostel", "cabin", "lodge", "backcountry"],
                                description: "Type of lodging"
                              },
                              name: {
                                type: "string",
                                description: "Name of the lodging"
                              },
                              location: {
                                type: "string",
                                description: "Location description"
                              },
                              coordinates: {
                                type: "array",
                                items: {
                                  type: "number"
                                },
                                maxItems: 2,
                                minItems: 2,
                                description: "Coordinates [longitude, latitude]"
                              },
                              booking_link: {
                                type: "string",
                                description: "Optional link for booking"
                              },
                              notes: {
                                type: "string",
                                description: "Optional notes about the lodging"
                              }
                            }
                          },
                          activities: {
                            type: "array",
                            items: {
                              type: "object",
                              required: ["id", "title", "type", "difficulty", "duration_hours", "start_location", "end_location"],
                              properties: {
                                id: {
                                  type: "string",
                                  description: "Unique identifier for this activity"
                                },
                                title: {
                                  type: "string",
                                  description: "Title of the activity"
                                },
                                type: {
                                  type: "string",
                                  enum: ["hiking", "biking", "cycling", "kayaking", "rafting", "climbing", "sightseeing", "driving", "swimming"],
                                  description: "Type of activity"
                                },
                                difficulty: {
                                  type: "string",
                                  enum: ["easy", "moderate", "challenging", "difficult", "extreme"],
                                  description: "Difficulty level"
                                },
                                duration_hours: {
                                  type: "number",
                                  description: "Duration in hours"
                                },
                                start_location: {
                                  type: "string",
                                  description: "Starting point"
                                },
                                end_location: {
                                  type: "string",
                                  description: "Ending point"
                                },
                                highlights: {
                                  type: "array",
                                  items: {
                                    type: "string"
                                  },
                                  description: "Key highlights of this activity"
                                },
                                hazards: {
                                  type: "array",
                                  items: {
                                    type: "string"
                                  },
                                  description: "Potential hazards"
                                },
                                route_details: {
                                  type: "object",
                                  properties: {
                                    distance_miles: {
                                      type: "number",
                                      description: "Distance in miles"
                                    },
                                    elevation_gain_ft: {
                                      type: "number",
                                      description: "Elevation gain in feet"
                                    },
                                    elevation_loss_ft: {
                                      type: "number",
                                      description: "Elevation loss in feet"
                                    },
                                    high_point_ft: {
                                      type: "number",
                                      description: "Highest elevation point in feet"
                                    },
                                    terrain: {
                                      type: "string",
                                      description: "Description of terrain"
                                    },
                                    route_type: {
                                      type: "string",
                                      enum: ["out_and_back", "loop", "point_to_point", "lollipop"],
                                      description: "Type of route"
                                    }
                                  }
                                },
                                route_geometry: {
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
                          }
                        }
                      }
                    },
                    whyWeChoseThis: {
                      oneOf: [
                        {
                          type: "string",
                          description: "Explanation of why this trip is a good match"
                        },
                        {
                          type: "array",
                          items: {
                            type: "string"
                          },
                          description: "List of reasons why this trip is a good match"
                        }
                      ]
                    },
                    recommended_outfitters: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["name", "specialty", "location", "description"],
                        properties: {
                          name: {
                            type: "string",
                            description: "Name of the outfitter"
                          },
                          specialty: {
                            type: "string",
                            description: "Specialty of the outfitter"
                          },
                          location: {
                            type: "string",
                            description: "Location of the outfitter"
                          },
                          website: {
                            type: "string",
                            description: "Website URL"
                          },
                          phone: {
                            type: "string",
                            description: "Phone number"
                          },
                          description: {
                            type: "string",
                            description: "Description of the outfitter"
                          }
                        }
                      }
                    },
                    notes: {
                      type: "array",
                      items: {
                        type: "string"
                      },
                      description: "Important notes about the trip"
                    },
                    warnings: {
                      type: "array",
                      items: {
                        type: "string"
                      },
                      description: "Warnings and safety information"
                    }
                  }
                }
              }
            },
            required: ["trips"]
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
          tripData = toolArguments.trips;
          console.log('Parsed trip data from OpenAI Assistant:', JSON.stringify(tripData).substring(0, 200) + '...');
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
