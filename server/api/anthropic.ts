import Anthropic from '@anthropic-ai/sdk';
import { Message } from "../../client/src/types/chat";
import { TripResponse } from "../../client/src/types/trip-schema";

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025. do not change this unless explicitly requested by the user
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Makes a request to Anthropic Claude for a chat completion
 */
export async function getClaudeResponse(messages: any[]): Promise<any> {
  try {
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1024,
      messages: formattedMessages,
    });
    
    return response;
  } catch (error) {
    console.error('Anthropic API Error:', error);
    throw error;
  }
}

/**
 * Processes an incoming chat message with Claude
 */
export async function processClaudeMessage(messages: Message[], userMessage: string) {
  try {
    // Prepare messages for the Anthropic API
    const apiMessages = messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));
    
    // Add the new user message
    apiMessages.push({
      role: 'user',
      content: userMessage
    });
    
    // Call the Anthropic API
    console.log("Sending messages to Claude:", apiMessages);
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1024,
      messages: apiMessages,
    });
    
    // Return Claude's response text
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error("Expected text response from Claude");
    }
    
    // Type assertion to safely access the text property
    const textBlock = content as { type: 'text', text: string };
    return textBlock.text;
  } catch (error) {
    console.error("Error in processClaudeMessage:", error);
    throw error;
  }
}

/**
 * Alternative implementation for trip planning using Claude
 */
export async function getClaudeTripPlans(query: string): Promise<TripResponse> {
  try {
    const systemPrompt = `You are a trip planning assistant specialized in adventure travel.
      - Generate detailed trip plans based on user requests
      - Respond with valid JSON data following the Trip schema
      - Include real geographic data, with accurate locations, coordinates and routes
      - Always include detailed itineraries, activities, and why this trip was chosen
      - Include weather data, recommended outfitters, and key locations
      - Focus on outdoor adventures like hiking, biking, camping, etc.
      - Your responses should ONLY contain valid JSON, no explanatory text`;
    
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Generate trip plan based on the following request: ${query}. 
          Please respond with valid JSON that follows the TripResponse schema with detailed trip information.`
        }
      ],
    });
    
    if (!response.content || response.content.length === 0) {
      throw new Error("No response from Claude");
    }
    
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error("Expected text response from Claude");
    }
    
    // We've verified it's a text type, so we can safely access the text property
    const textBlock = content as { type: 'text', text: string };
    const textContent = textBlock.text;
    
    // Try to extract JSON from the text response
    const jsonMatch = textContent.match(/```json\n([\s\S]*?)\n```/) || 
                        textContent.match(/```\n([\s\S]*?)\n```/) ||
                        [null, textContent];
    
    const jsonStr = jsonMatch[1] || textContent;
    
    try {
      const tripData = JSON.parse(jsonStr) as TripResponse;
      
      if (!tripData || !tripData.trips || tripData.trips.length === 0) {
        throw new Error("Invalid trip data format returned from Claude");
      }
      
      return tripData;
    } catch (error) {
      console.error("Error parsing JSON from Claude response:", error);
      throw new Error("Failed to parse trip data from Claude response");
    }
  } catch (error) {
    console.error("Error in getClaudeTripPlans:", error);
    throw error;
  }
}