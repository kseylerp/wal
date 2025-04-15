import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

// The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const MODEL = "claude-3-7-sonnet-20250219";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Schema for a trip suggestion
const tripFormatSchema = z.object({
  trip: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      whyWeChoseThis: z.string(),
      difficultyLevel: z.string(),
      priceEstimate: z.string(),
      duration: z.string(),
      location: z.string(),
      suggestedGuides: z.array(z.string()),
      mapCenter: z.tuple([z.number(), z.number()]),
      markers: z.array(
        z.object({
          coordinates: z.tuple([z.number(), z.number()]),
          name: z.string(),
        })
      ),
      journey: z.object({
        segments: z.array(
          z.object({
            mode: z.enum(["walking", "driving", "cycling", "transit"]),
            from: z.string(),
            to: z.string(),
            distance: z.number(),
            duration: z.number(),
            terrain: z.enum(["trail", "paved", "rocky", "mixed"]).optional(),
            geometry: z
              .object({
                type: z.literal("LineString"),
                coordinates: z.array(z.tuple([z.number(), z.number()])),
              })
              .optional(),
            steps: z
              .array(
                z.object({
                  maneuver: z.object({
                    instruction: z.string(),
                    location: z.tuple([z.number(), z.number()]),
                  }),
                  distance: z.number(),
                  duration: z.number(),
                })
              )
              .optional(),
          })
        ),
        totalDistance: z.number(),
        totalDuration: z.number(),
        bounds: z.tuple([
          z.tuple([z.number(), z.number()]),
          z.tuple([z.number(), z.number()]),
        ]),
      }),
      itinerary: z.array(
        z.object({
          day: z.number(),
          title: z.string(),
          description: z.string(),
          activities: z.array(z.string()),
          accommodation: z.string().optional(),
        })
      ),
    })
  ),
});

const systemPrompt = `You are an outdoor activity planning assistant. Ask a few questions to try and understand the needs of the user and offer suggestions. Then provide two trip options to lesser-known destinations in valid JSON format.

Analyze user prompts for destination, activities, duration, budget, intensity level, and special requirements.

- Prioritize off-the-beaten-path locations and local operators
- Consider shoulder-season times
- Consider congestion
- Consider prepared users would be for the challenges

Your trip suggestions must be in the form of structured JSON that can be mapped to frontend components.

When providing trip options, include:
1. Detailed descriptions
2. Accurate geographic coordinates for Mapbox API
3. Complete journey segments with distances
4. Realistic itineraries with day-by-day activities
5. Appropriate difficulty ratings and price estimates

You're friendly, succinct, and conversational. Make your responses both informative and engaging.`;

export async function createTripSuggestion(userMessage: string) {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      tools: [
        {
          type: "custom",
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
                    "itinerary",
                  ],
                  properties: {
                    id: {
                      type: "string",
                      description: "Unique identifier for the trip",
                    },
                    title: {
                      type: "string",
                      description: "Title of the trip",
                    },
                    description: {
                      type: "string",
                      description: "Description of the trip",
                    },
                    whyWeChoseThis: {
                      type: "string",
                      description: "Reason for recommending this trip",
                    },
                    difficultyLevel: {
                      type: "string",
                      description: "Difficulty level of the trip",
                    },
                    priceEstimate: {
                      type: "string",
                      description: "Estimated price range for the trip",
                    },
                    duration: {
                      type: "string",
                      description: "Duration of the trip",
                    },
                    location: {
                      type: "string",
                      description: "Location of the trip",
                    },
                    suggestedGuides: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                      description: "List of suggested guides for the trip",
                    },
                    mapCenter: {
                      type: "array",
                      items: {
                        type: "number",
                      },
                      description: "Center coordinates for the map [longitude, latitude]",
                    },
                    markers: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["coordinates", "name"],
                        properties: {
                          coordinates: {
                            type: "array",
                            items: {
                              type: "number",
                            },
                            description: "Coordinates for the marker [longitude, latitude]",
                          },
                          name: {
                            type: "string",
                            description: "Name of the location",
                          },
                        },
                      },
                      description: "Markers for key locations on the map",
                    },
                    journey: {
                      type: "object",
                      required: ["segments", "totalDistance", "totalDuration", "bounds"],
                      properties: {
                        segments: {
                          type: "array",
                          items: {
                            type: "object",
                            required: ["mode", "from", "to", "distance", "duration"],
                            properties: {
                              mode: {
                                type: "string",
                                enum: ["walking", "driving", "cycling", "transit"],
                                description: "Mode of transportation",
                              },
                              from: {
                                type: "string",
                                description: "Starting point",
                              },
                              to: {
                                type: "string",
                                description: "Ending point",
                              },
                              distance: {
                                type: "number",
                                description: "Distance in meters",
                              },
                              duration: {
                                type: "number",
                                description: "Duration in seconds",
                              },
                              terrain: {
                                type: "string",
                                enum: ["trail", "paved", "rocky", "mixed"],
                                description: "Type of terrain",
                              },
                              geometry: {
                                type: "object",
                                properties: {
                                  type: {
                                    type: "string",
                                    enum: ["LineString"],
                                  },
                                  coordinates: {
                                    type: "array",
                                    items: {
                                      type: "array",
                                      items: {
                                        type: "number",
                                      },
                                    },
                                  },
                                },
                                description: "Geometry for the route",
                              },
                              steps: {
                                type: "array",
                                items: {
                                  type: "object",
                                  required: ["maneuver", "distance", "duration"],
                                  properties: {
                                    maneuver: {
                                      type: "object",
                                      required: ["instruction", "location"],
                                      properties: {
                                        instruction: {
                                          type: "string",
                                          description: "Instruction for this step",
                                        },
                                        location: {
                                          type: "array",
                                          items: {
                                            type: "number",
                                          },
                                          description: "Location coordinates [longitude, latitude]",
                                        },
                                      },
                                    },
                                    distance: {
                                      type: "number",
                                      description: "Distance in meters",
                                    },
                                    duration: {
                                      type: "number",
                                      description: "Duration in seconds",
                                    },
                                  },
                                },
                                description: "Steps within this segment",
                              },
                            },
                          },
                          description: "Segments of the journey",
                        },
                        totalDistance: {
                          type: "number",
                          description: "Total distance in meters",
                        },
                        totalDuration: {
                          type: "number",
                          description: "Total duration in seconds",
                        },
                        bounds: {
                          type: "array",
                          items: {
                            type: "array",
                            items: {
                              type: "number",
                            },
                          },
                          description: "Bounding box for the journey [southwest, northeast]",
                        },
                      },
                      description: "Journey details",
                    },
                    itinerary: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["day", "title", "description", "activities"],
                        properties: {
                          day: {
                            type: "number",
                            description: "Day number",
                          },
                          title: {
                            type: "string",
                            description: "Title for this day",
                          },
                          description: {
                            type: "string",
                            description: "Description for this day",
                          },
                          activities: {
                            type: "array",
                            items: {
                              type: "string",
                            },
                            description: "Activities for this day",
                          },
                          accommodation: {
                            type: "string",
                            description: "Accommodation for this night",
                          },
                        },
                      },
                      description: "Day-by-day itinerary",
                    },
                  },
                },
              },
            },
          },
        },
      ],
    });

    if (!response || !response.content || response.content.length === 0) {
      throw new Error("Failed to get a valid response from Anthropic");
    }

    let content = "";
    let jsonData = null;

    // Process the response content
    for (const item of response.content) {
      if (item.type === "text") {
        content += item.text;
      } else if (item.type === "tool_use") {
        try {
          const parsedData = JSON.parse(item.input);
          // Validate the data against our schema
          const validatedData = tripFormatSchema.parse(parsedData);
          jsonData = validatedData;
          // Include the JSON string in the content for the client to parse
          content += `\n${JSON.stringify(parsedData, null, 2)}\n`;
        } catch (error) {
          console.error("Error parsing tool_use JSON:", error);
        }
      }
    }

    return {
      content: content.trim(),
      tripData: jsonData,
    };
  } catch (error) {
    console.error("Error creating trip suggestion:", error);
    throw new Error(`Failed to generate trip suggestion: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
