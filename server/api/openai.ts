import OpenAI from "openai";
import { Message } from "../../client/src/types/chat";
import { TripResponse } from "../../client/src/types/trip-schema";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Makes a request to OpenAI for chat completion
 */
export async function getChatResponse(messages: any[]): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
    });
    
    return response;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

/**
 * Requests trip plans from the OpenAI Assistant
 * This uses a dedicated assistant built specifically for trip planning
 */
export async function getTripPlans(query: string): Promise<TripResponse> {
  const ASSISTANT_ID = "asst_LxWLQAQzSQgk3rNTAPNhj5Uv";
  
  try {
    console.log("Creating thread for OpenAI assistant...");
    // Create a thread
    const thread = await openai.beta.threads.create();
    
    // Add a message to the thread with the user's query
    console.log("Adding user message to thread...");
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `Generate trip plan based on the following request: ${query}. 
      Please respond with valid JSON that follows the TripResponse schema with detailed trip information.`
    });
    
    // Run the assistant on the thread
    console.log("Running the Assistant...");
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
      instructions: `
        You are a trip planning assistant specialized in adventure travel.
        - Generate detailed trip plans based on user requests
        - Respond with valid JSON data following the Trip schema
        - Include real geographic data, with accurate locations, coordinates and routes
        - Always include detailed itineraries, activities, and why this trip was chosen
        - Include weather data, recommended outfitters, and key locations
        - Focus on outdoor adventures like hiking, biking, camping, etc.
        - Your responses should ONLY contain valid JSON, no explanatory text
      `
    });
    
    // Wait for completion
    console.log("Waiting for assistant to complete...");
    let runStatus = await openai.beta.threads.runs.retrieve(
      thread.id,
      run.id
    );
    
    // Poll for completion
    while (runStatus.status !== "completed") {
      if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
        throw new Error(`Run ended with status: ${runStatus.status}`);
      }
      
      // Wait 1 second before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      console.log("Current status:", runStatus.status);
    }
    
    // Get the messages
    const messages = await openai.beta.threads.messages.list(thread.id);
    
    // Find the last assistant message
    const lastMessage = messages.data
      .filter(message => message.role === "assistant")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    
    if (!lastMessage || !lastMessage.content || lastMessage.content.length === 0) {
      throw new Error("No response from assistant");
    }
    
    // Parse response as JSON
    let tripData: TripResponse;
    try {
      const content = lastMessage.content[0];
      
      if (content.type !== 'text') {
        throw new Error("Expected text response from OpenAI");
      }
      
      // Try to extract JSON from the text response
      const textContent = content.text.value;
      const jsonMatch = textContent.match(/```json\n([\s\S]*?)\n```/) || 
                          textContent.match(/```\n([\s\S]*?)\n```/) ||
                          [null, textContent]; 
      
      const jsonStr = jsonMatch[1] || textContent;
      
      tripData = JSON.parse(jsonStr) as TripResponse;
      
      if (!tripData || !tripData.trips || tripData.trips.length === 0) {
        throw new Error("Invalid trip data format returned from OpenAI");
      }
      
      console.log("Successfully parsed trip data");
    } catch (error) {
      console.error("Error parsing JSON from assistant response:", error);
      throw new Error("Failed to parse trip data from assistant response");
    }
    
    return tripData;
  } catch (error) {
    console.error("Error in getTripPlans:", error);
    throw error;
  }
}