import { getChatResponse } from "./openai";
import { Message } from "../../client/src/types/chat";
import { v4 as uuidv4 } from "uuid";

/**
 * Processes an incoming chat message, sends it to the OpenAI API,
 * and formats the response for the client
 */
export async function processChatMessage(messages: Message[], userMessage: string) {
  try {
    // Format the new user message
    const newUserMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    
    // Prepare messages for the OpenAI API
    // Only send the text content, not the full message objects
    const apiMessages = [
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];
    
    // Call the OpenAI API
    console.log("Sending messages to OpenAI:", apiMessages);
    const response = await getChatResponse(apiMessages);
    
    // Get the AI's response text
    let aiMessageContent = "";
    if (response.choices && response.choices.length > 0) {
      aiMessageContent = response.choices[0].message.content;
    } else {
      throw new Error("No response from OpenAI API");
    }
    
    // Format the AI's response
    const aiMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: aiMessageContent,
      timestamp: new Date().toISOString(),
    };
    
    // Return both the new user message and the AI's response
    return {
      userMessage: newUserMessage,
      aiMessage,
    };
  } catch (error) {
    console.error("Error in processChatMessage:", error);
    throw error;
  }
}