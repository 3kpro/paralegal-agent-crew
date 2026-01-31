import { getGeminiModel } from '@/lib/gemini';
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
  private model: any;
  private tools: Map<string, HelixTool>;

  constructor() {
    // Initialize using centralized helper
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    // We can't really use this.genAI anymore as it was GoogleGenerativeAI class. 
    // We will just store the model.
    // However, the class definition has private genAI: GoogleGenerativeAI. We should remove that property or ignore it.
    // Let's rely on getGeminiModel from lib.
    
    // Import helper dynamically or assume it's available (I will add import).
    // Actually, I can just use getGeminiModel('gemini-2.0-flash').
    
    // Changing implementation to use getGeminiModel
    this.model = getGeminiModel('gemini-2.0-flash');
    
    if (!this.model) {
        throw new Error("Failed to initialize Gemini model via Vertex AI");
    }

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
  public async processMessage(userId: string, sessionId: string, message: string, context?: any, injectedSupabase?: any) {
    const supabase = injectedSupabase || await createClient();
    
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

    // 3. Load Conversation History
    // Fetch last 20 messages for context
    const { data: dbHistory } = await supabase
      .from('helix_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20);

    const history = (dbHistory || []).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // 4. Call Gemini
    const chat = this.model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 8000,
      },
    });

    let result = await chat.sendMessage(systemPrompt + "\n\nUser: " + message);
    let responseText = result.response.text();

    // 5. Check for Tool Calls (JSON parsing)
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
