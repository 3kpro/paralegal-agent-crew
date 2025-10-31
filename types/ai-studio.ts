export interface AIProvider {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  priority: number;
  icon: string;
  description: string;
  costPer1kTokens?: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  template: string;
  variables: string[];
  usage_count: number;
  average_quality: number;
}

export interface GenerationRequest {
  id: string;
  provider: string;
  model: string;
  prompt: string;
  content: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processingTime: number;
  qualityScore: number;
  tokensUsed: number;
  cost: number;
  timestamp: Date;
}

export interface GenerateViewProps {
  currentPrompt: string;
  setCurrentPrompt: (prompt: string) => void;
  selectedProviders: string[];
  setSelectedProviders: (providers: string[]) => void;
  providers: AIProvider[];
  isGenerating: boolean;
  generateContent: () => void;
  generationResults: GenerationRequest[];
  templates: PromptTemplate[];
  applyTemplate: (template: PromptTemplate) => void;
  selectedTemplate: PromptTemplate | null;
  templateVariables: Record<string, string>;
  setTemplateVariables: (vars: Record<string, string>) => void;
  buildPromptFromTemplate: () => void;
}

export interface TemplatesViewProps {
  templates: PromptTemplate[];
  onTemplateUpdate: () => void;
}