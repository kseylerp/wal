// OpenAI integration for trip planning API
import { OpenAI } from 'openai';
import { TripResponse } from '@/types/trip-schema';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";
const ASSISTANT_ID = "asst_LxWLQAQzSQgk3rNTAPNhj5Uv";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export async function getChatResponse(messages: any[]): Promise<any> {
  try {
    // Create a thread with the user's message history
    const thread = await openai.beta.threads.create({
      messages: messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
    });

    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(
      thread.id,
      { assistant_id: ASSISTANT_ID }
    );

    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(
      thread.id,
      run.id
    );

    // Wait for completion (with timeout)
    const startTime = Date.now();
    const TIMEOUT_MS = 60000; // 1 minute timeout
    
    while (runStatus.status !== 'completed' && runStatus.status !== 'failed') {
      // Check timeout
      if (Date.now() - startTime > TIMEOUT_MS) {
        throw new Error('Request timed out waiting for assistant response');
      }
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get updated status
      runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );
    }

    if (runStatus.status === 'failed') {
      throw new Error(`Assistant run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
    }

    // Get messages (only those from the assistant)
    const messages_response = await openai.beta.threads.messages.list(
      thread.id
    );

    // Find the assistant's response (the latest one)
    const assistantMessages = messages_response.data
      .filter(msg => msg.role === 'assistant')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    if (assistantMessages.length === 0) {
      throw new Error('No response from assistant');
    }

    // Return the latest response
    const latestMessage = assistantMessages[0];
    
    // Handle different content types
    let responseContent = '';
    
    if (latestMessage.content[0].type === 'text') {
      responseContent = latestMessage.content[0].text.value;
    }
    
    return {
      role: 'assistant',
      content: responseContent,
      thread_id: thread.id, // Keep the thread ID for future messages
    };
  } catch (error) {
    console.error('Error in OpenAI API call:', error);
    throw error;
  }
}

export async function getTripPlans(query: string): Promise<TripResponse> {
  try {
    console.log('Generating trip plans for query:', query);
    
    // Initial message to the assistant
    const messages = [
      {
        role: 'system',
        content: 'You are a travel planning expert. Generate a detailed trip itinerary based on the user\'s query. Include coordinates, detailed activities, and routes. Respond with a valid JSON object that matches the Trip schema.'
      },
      {
        role: 'user',
        content: `Please create a detailed trip plan for the following request: ${query}. Make sure to include real geographic coordinates, realistic routes, and activity details in your response. Format your response as a JSON object following the TripResponse schema.`
      }
    ];

    // Call OpenAI
    const response = await getChatResponse(messages);
    
    // Parse JSON from response
    let tripData: TripResponse;
    
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/) || 
                         response.content.match(/```\n([\s\S]*?)\n```/) ||
                         [null, response.content];
      
      const jsonString = jsonMatch[1] || response.content;
      tripData = JSON.parse(jsonString);
      
      console.log('Successfully parsed trip data');
    } catch (error) {
      console.error('Error parsing trip data:', error);
      throw new Error('Failed to parse trip data from assistant response');
    }
    
    return tripData;
  } catch (error) {
    console.error('Error getting trip plans:', error);
    throw error;
  }
}