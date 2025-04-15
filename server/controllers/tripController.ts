import { z } from "zod";
import { generateTripSuggestion as openAIGenerateTripSuggestion } from "../services/openaiService";

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

export async function createTripSuggestion(userMessage: string, sessionId: string = 'default') {
  try {
    // Use the "Offbeat Agent" assistant from OpenAI with the session ID
    const response = await openAIGenerateTripSuggestion(userMessage, sessionId);

    // If the response contains JSON data, validate it
    if (response.tripData) {
      try {
        // Validate the data against our schema
        const validatedData = tripFormatSchema.parse(response.tripData);
        return {
          content: response.content,
          tripData: validatedData
        };
      } catch (error) {
        console.error("Error validating trip data:", error);
        // Return just the text content if validation fails
        return {
          content: response.content,
          tripData: null
        };
      }
    }

    return response;
  } catch (error) {
    console.error("Error creating trip suggestion:", error);
    throw new Error(`Failed to generate trip suggestion: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
