import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const MODEL = "gpt-4o";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Assistant ID for the "Offbeat Agent"
const ASSISTANT_ID = "asst_yPZvvKtxEHvphjto5ynhiCvz";

export async function generateTripSuggestion(userMessage: string) {
  try {
    // Create a thread
    const thread = await openai.beta.threads.create();
    
    // Add the user message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userMessage,
    });
    
    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
    });
    
    // Poll for the completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    
    while (runStatus.status !== "completed") {
      if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
        throw new Error(`Run ended with status: ${runStatus.status}`);
      }
      
      // Wait a bit before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }
    
    // Get the messages from the thread
    const messages = await openai.beta.threads.messages.list(thread.id);
    
    // The last message should be from the assistant
    const lastMessage = messages.data.filter(msg => msg.role === "assistant")[0];
    
    if (!lastMessage) {
      throw new Error("No response from assistant");
    }
    
    // Extract the message content
    let content = "";
    let jsonData = null;
    
    for (const part of lastMessage.content) {
      if (part.type === "text") {
        content += part.text.value;
        
        // Try to extract JSON from the response
        try {
          const jsonRegex = /{[\s\S]*}/g;
          const match = part.text.value.match(jsonRegex);
          
          if (match) {
            const jsonString = match[0];
            jsonData = JSON.parse(jsonString);
          }
        } catch (error) {
          console.error("Error parsing JSON from assistant response:", error);
        }
      }
    }
    
    return {
      content: content.trim(),
      tripData: jsonData,
    };
  } catch (error) {
    console.error("Error in OpenAI assistant:", error);
    throw new Error(`Failed to generate trip suggestion: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function generateText(prompt: string, options: {
  maxTokens?: number;
  temperature?: number;
  system?: string;
}) {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        ...(options.system ? [{ role: "system" as const, content: options.system }] : []),
        { role: "user", content: prompt }
      ],
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature || 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating text with OpenAI:", error);
    throw error;
  }
}

export default openai;