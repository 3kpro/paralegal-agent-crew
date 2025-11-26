import { VertexAI } from '@google-cloud/vertexai';
import { createClient } from '@/lib/supabase/server';

// Define the shape of a Tool
interface HelixTool {
  name: string;
  description: string;
  execute: (args: any, context: any) => Promise<any>;
}

// Define the Agent's state
interface AgentState {
  userId: string;
  sessionId: string;
  history: any[];
  brandDna?: any;
}

export class HelixAgentManager {
  private vertexAI: VertexAI;
  private model: any;
  private tools: Map<string, HelixTool>;

  constructor() {
    // Initialize Vertex AI
    this.vertexAI = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: 'us-central1'
    });

    // Use Gemini 1.5 Pro for the "Brain"
    this.model = this.vertexAI.getGenerativeModel({
      model: 'gemini-1.5-pro-preview-0409', // Latest preview with 1M context
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
        topP: 0.95,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
      ],
    });

    this.tools = new Map();
    this.registerCoreTools();
  }

  // Register the basic tools available to the agent
  private registerCoreTools() {
    this.registerTool({
      name: 'update_brand_dna',
      description: 'Updates the user\'s Brand DNA profile with new rules or preferences. Args: { attributes: object }',
      execute: async (args, context) => {
        const supabase = await createClient();
        const { userId } = context;
        
        // 1. Get existing DNA
        const { data: existing } = await supabase
          .from('helix_brand_dna')
          .select('dna_attributes')
          .eq('user_id', userId)
          .single();
          
        const currentAttributes = existing?.dna_attributes || {};
        const newAttributes = { ...currentAttributes, ...args.attributes };
        
        // 2. Upsert new DNA
        const { error } = await supabase
          .from('helix_brand_dna')
          .upsert({
            user_id: userId,
            dna_attributes: newAttributes,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
          
        if (error) throw new Error(`Failed to update Brand DNA: ${error.message}`);
        
        return { status: 'success', message: 'Brand DNA updated.', current_dna: newAttributes };
      }
    });

    this.registerTool({
      name: 'search_knowledge_base',
      description: 'Searches the user\'s uploaded documents for context.',
      execute: async (args, context) => {
        // TODO: Implement RAG search
        return { results: [] };
      }
    });
  }

  public registerTool(tool: HelixTool) {
    this.tools.set(tool.name, tool);
  }

  // The main entry point for processing a user message
  public async processMessage(userId: string, sessionId: string, message: string, context?: any) {
    const supabase = await createClient();
    
    // 1. Load Context (History + Brand DNA)
    const { data: brandDna } = await supabase
      .from('helix_brand_dna')
      .select('*')
      .eq('user_id', userId)
      .single();

    // 2. Construct the System Prompt
    const systemPrompt = `
      You are Helix, an advanced AI Marketing Assistant.
      
      Your Goal: Help the user build their brand, plan strategy, and generate content.
      
      User Context:
      - Current Page: ${context?.currentPath || 'Unknown'}
      ${context?.pageContent ? `- Page Content Summary: ${context.pageContent}` : ''}
      
      Brand Context:
      ${brandDna ? JSON.stringify(brandDna.dna_attributes) : "No brand DNA established yet. Ask the user to define their voice."}
      
      Available Tools:
      ${Array.from(this.tools.values()).map(t => `- ${t.name}: ${t.description}`).join('\n')}
      
      Instructions:
      - If you need to perform an action, output a JSON object with "tool" and "args".
      - If you can answer directly, just speak naturally.
      - Always stay in character: Professional, insightful, and proactive.
      - Use the "Current Page" context to tailor your advice.
    `;

    // 3. Call Gemini
    const chat = this.model.startChat({
      history: [], // TODO: Load recent history from DB
      generationConfig: {
        maxOutputTokens: 8000,
      },
    });

    let result = await chat.sendMessage(systemPrompt + "\n\nUser: " + message);
    let responseText = result.response.text();

    // 4. Check for Tool Calls (JSON parsing)
    try {
      // Attempt to find JSON in the response (it might be wrapped in markdown code blocks)
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const toolCall = JSON.parse(jsonStr);
        
        if (toolCall.tool && this.tools.has(toolCall.tool)) {
          console.log(`Executing tool: ${toolCall.tool}`);
          const tool = this.tools.get(toolCall.tool)!;
          
          // Execute Tool
          const toolResult = await tool.execute(toolCall.args, { userId, sessionId });
          
          // Feed result back to Gemini
          const followUp = await chat.sendMessage(`Tool Output (${toolCall.tool}): ${JSON.stringify(toolResult)}\n\nContinue helping the user.`);
          responseText = followUp.response.text();
        }
      }
    } catch (e) {
      // Not a valid tool call, or parsing failed. Just return the text.
      console.log("No tool call detected or parsing failed:", e);
    }
    
    // 5. Save Message to DB
    await supabase.from('helix_messages').insert({
      session_id: sessionId,
      user_id: userId,
      role: 'user',
      content: message
    });

    await supabase.from('helix_messages').insert({
      session_id: sessionId,
      user_id: userId,
      role: 'assistant',
      content: responseText
    });

    return responseText;
  }
}
