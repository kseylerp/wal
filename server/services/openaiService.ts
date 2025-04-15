import OpenAI from "openai";
import fs from 'fs';
import path from 'path';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const MODEL = "gpt-4o";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Assistant ID for the "Offbeat Agent"
const ASSISTANT_ID = "asst_yPZvvKtxEHvphjto5ynhiCvz";

// File to store thread IDs by session
const THREAD_STORAGE_FILE = path.join(process.cwd(), 'thread_storage.json');

// Initialize thread storage if it doesn't exist
if (!fs.existsSync(THREAD_STORAGE_FILE)) {
  fs.writeFileSync(THREAD_STORAGE_FILE, JSON.stringify({}), 'utf8');
}

// Load thread storage
function loadThreadStorage() {
  try {
    const data = fs.readFileSync(THREAD_STORAGE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading thread storage:', error);
    return {};
  }
}

// Save thread storage
function saveThreadStorage(storage: Record<string, string>) {
  try {
    fs.writeFileSync(THREAD_STORAGE_FILE, JSON.stringify(storage), 'utf8');
  } catch (error) {
    console.error('Error saving thread storage:', error);
  }
}

// Get or create a thread for a session
async function getOrCreateThread(sessionId: string = 'default'): Promise<string> {
  const storage = loadThreadStorage();
  
  if (storage[sessionId]) {
    // Verify the thread still exists
    try {
      await openai.beta.threads.retrieve(storage[sessionId]);
      return storage[sessionId];
    } catch (error) {
      console.log('Thread not found or expired, creating a new one');
    }
  }
  
  // Create a new thread
  const thread = await openai.beta.threads.create();
  storage[sessionId] = thread.id;
  saveThreadStorage(storage);
  
  return thread.id;
}

export async function generateTripSuggestion(userMessage: string, sessionId: string = 'default') {
  try {
    // Get or create a thread for this session
    const threadId = await getOrCreateThread(sessionId);
    
    // Add the user message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: userMessage,
    });
    
    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID,
    });
    
    // Poll for the completion
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    
    while (runStatus.status !== "completed") {
      if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
        throw new Error(`Run ended with status: ${runStatus.status}`);
      }
      
      // Wait a bit before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }
    
    // Get the messages from the thread
    const messages = await openai.beta.threads.messages.list(threadId);
    
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