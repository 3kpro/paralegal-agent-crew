# Helix AI Assistant - Implementation Roadmap

## Overview
This roadmap builds on the Grok analysis and breaks down Helix enhancements into actionable phases with clear priorities and implementation details.

---

## Phase 1: Foundation Completion (2-4 weeks)
**Goal:** Make Helix fully functional as an MVP assistant

### 1.1 Complete RAG Implementation
**Priority:** CRITICAL
**Estimated Time:** 1-2 weeks

#### Tasks:
- [ ] **Document Upload Interface**
  - File: `app/helix/components/DocumentUpload.tsx`
  - Support: PDF, DOC, DOCX, TXT, MD
  - Drag-and-drop + file picker
  - File size limits (10MB per file)
  - Progress indicators

- [ ] **Text Processing Pipeline**
  - File: `app/api/helix/documents/process/route.ts`
  - Extract text from PDFs (using `pdf-parse`)
  - Extract text from DOC/DOCX (using `mammoth`)
  - Chunk text into 512-token segments with 50-token overlap
  - Generate metadata (file name, upload date, user_id)

- [ ] **Embedding Generation**
  - Use Google's `text-embedding-004` model
  - Batch process chunks (100 at a time)
  - Store in `knowledge_base` table with vector column
  - Enable HNSW indexing (already exists in schema)

- [ ] **Semantic Search Implementation**
  - File: `app/api/helix/search/route.ts`
  - Use `pgvector` similarity search
  - Return top 5 most relevant chunks
  - Include source metadata in results
  - Add relevance score threshold (>0.7)

- [ ] **Citation System**
  - Display source documents in AI responses
  - Format: "Source: [filename] (relevance: 87%)"
  - Link to view original document
  - Highlight matching text snippets

#### Technical Details:
```typescript
// knowledge_base table structure (already exists)
{
  id: uuid,
  user_id: uuid,
  content: text,
  embedding: vector(768), // Google embeddings
  metadata: jsonb, // { filename, page, upload_date }
  created_at: timestamp
}

// Search query example
const results = await supabase.rpc('match_documents', {
  query_embedding: embedding,
  match_threshold: 0.7,
  match_count: 5
});
```

---

### 1.2 Conversation History & Management
**Priority:** HIGH
**Estimated Time:** 1 week

#### Tasks:
- [ ] **Load Conversation History**
  - Fix TODO in `app/api/helix/chat/route.ts`
  - Load last 10 messages from `ai_messages` table
  - Format for Gemini context window
  - Implement token limit (keep last ~2000 tokens)

- [ ] **Session Sidebar UI**
  - File: `app/helix/components/SessionSidebar.tsx`
  - List all user sessions sorted by `updated_at`
  - Auto-generate titles from first user message
  - Show timestamp and message count
  - Highlight active session

- [ ] **Session Management**
  - Create new session button
  - Delete session (with confirmation)
  - Rename session
  - Search sessions by title/content

- [ ] **Conversation Export**
  - Export as JSON
  - Export as Markdown
  - Export as PDF (using `jsPDF`)
  - Include metadata (date, user, brand DNA)

#### UI Design:
```
┌─────────────────┬──────────────────────┐
│  Sessions       │  Chat Interface      │
│  ─────────      │                      │
│  📝 Product     │  [Active chat]       │
│     Launch Q&A  │                      │
│     2 hrs ago   │                      │
│                 │                      │
│  ✨ Campaign    │                      │
│     Ideas       │                      │
│     Yesterday   │                      │
│                 │                      │
│  + New Chat     │                      │
└─────────────────┴──────────────────────┘
```

---

### 1.3 Enhanced Context Awareness
**Priority:** HIGH
**Estimated Time:** 1 week

#### Tasks:
- [ ] **Page Content Extraction**
  - File: `app/helix/hooks/usePageContext.ts`
  - Extract current page title
  - Extract main content text (exclude nav/footer)
  - Detect page type (dashboard, campaign, analytics, etc.)
  - Pass to AI in system prompt

- [ ] **User Activity Tracking**
  - Track last visited pages
  - Track time spent on each section
  - Detect user workflow patterns
  - Store in `user_preferences` table (new)

- [ ] **Platform Data Integration**
  - Query user's active campaigns from `campaigns` table
  - Get recent content performance from `content` table
  - Include in AI context when relevant
  - Example: "User has 3 active campaigns targeting Reddit"

- [ ] **Cross-Platform Context**
  - Integrate with social media metrics (if available)
  - Include TrendPulse viral scores in context
  - Reference ContentFlow drafts

#### Implementation Example:
```typescript
// Enhanced context structure
const context = {
  page: {
    type: 'campaign-detail',
    title: 'Reddit Launch Campaign',
    url: '/campaigns/123'
  },
  user: {
    active_campaigns: 3,
    recent_content: ['Twitter thread', 'Blog post'],
    preferences: { tone: 'professional' }
  },
  data: {
    campaign_performance: { engagement_rate: 0.12 },
    trending_topics: ['AI tools', 'productivity']
  }
};
```

---

## Phase 2: Advanced UX (1-2 months)
**Goal:** Make Helix delightful and powerful to use

### 2.0 Vercel AI SDK Integration
**Priority:** HIGH
**Estimated Time:** 1 week

#### Why Vercel AI SDK?
The Vercel AI SDK provides production-ready tools for building AI applications:
- **Streaming responses** for real-time UX
- **Multi-provider support** (OpenAI, Anthropic, Google, etc.)
- **Built-in React hooks** (`useChat`, `useCompletion`)
- **Edge runtime support** for faster responses
- **Function calling** (tool use) out of the box
- **Prompt caching** and optimization

#### Tasks:
- [ ] **Install Vercel AI SDK**
  - `npm install ai @ai-sdk/google`
  - Install additional providers as needed

- [ ] **Replace Current Chat Implementation**
  - File: `app/api/helix/chat/route.ts`
  - Use `streamText` from Vercel AI SDK
  - Replace manual Gemini API calls
  - Implement streaming responses

- [ ] **Add React Hooks on Frontend**
  - File: `app/helix/components/ChatInterface.tsx`
  - Use `useChat` hook for cleaner state management
  - Automatic message streaming
  - Built-in error handling
  - Optimistic UI updates

- [ ] **Implement Tool/Function Calling**
  - Define tools using Vercel AI SDK schema
  - `search_knowledge_base` tool
  - `get_campaign_data` tool
  - `create_content` tool
  - Automatic tool execution

- [ ] **Add Multi-Provider Support**
  - Support switching between Google, OpenAI, Anthropic
  - User preference for AI model
  - Fallback to alternative provider on failure
  - Cost optimization by provider

#### Implementation Example:
```typescript
// app/api/helix/chat/route.ts
import { streamText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages, userId } = await req.json();

  const result = await streamText({
    model: google('gemini-2.0-flash-exp'),
    messages,
    tools: {
      search_knowledge_base: tool({
        description: 'Search uploaded documents for relevant information',
        parameters: z.object({
          query: z.string().describe('The search query'),
        }),
        execute: async ({ query }) => {
          // Call your RAG search
          return await searchKnowledgeBase(query, userId);
        },
      }),
      get_campaign_metrics: tool({
        description: 'Get performance metrics for a campaign',
        parameters: z.object({
          campaignId: z.string(),
        }),
        execute: async ({ campaignId }) => {
          return await getCampaignMetrics(campaignId);
        },
      }),
    },
    maxSteps: 5, // Allow multi-step tool usage
  });

  return result.toDataStreamResponse();
}
```

```typescript
// app/helix/components/ChatInterface.tsx
'use client';
import { useChat } from 'ai/react';

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/helix/chat',
  });

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          <strong>{m.role}:</strong> {m.content}
          {m.toolInvocations?.map(tool => (
            <div>Tool: {tool.toolName}</div>
          ))}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
```

#### Benefits:
✅ **Real-time streaming** - no more waiting for full responses
✅ **Cleaner code** - built-in state management
✅ **Better UX** - automatic optimistic updates
✅ **Tool calling** - easily add actions (search, create content, etc.)
✅ **Multi-model support** - use best AI for each task
✅ **Production-ready** - used by thousands of apps in production

---

### 2.1 Voice Input/Output
**Priority:** MEDIUM
**Estimated Time:** 1 week

#### Tasks:
- [ ] **Voice Input (Speech-to-Text)**
  - Use Web Speech API (`SpeechRecognition`)
  - Fallback to Google Cloud Speech-to-Text
  - Real-time transcription display
  - Support for multiple languages
  - Push-to-talk button

- [ ] **Voice Output (Text-to-Speech)**
  - Use Web Speech API (`speechSynthesis`)
  - Fallback to Google Cloud Text-to-Speech
  - Natural voice selection (male/female options)
  - Playback controls (pause, stop, speed)
  - Auto-read responses toggle

#### UI Components:
```tsx
// VoiceInput.tsx
<Button onMouseDown={startRecording} onMouseUp={stopRecording}>
  <Mic className={isRecording ? 'animate-pulse text-red-500' : ''} />
  {isRecording ? 'Recording...' : 'Hold to speak'}
</Button>

// VoiceOutput.tsx
<Button onClick={toggleSpeech}>
  <Volume2 className={isSpeaking ? 'animate-bounce' : ''} />
</Button>
```

---

### 2.2 Multi-Modal Inputs
**Priority:** MEDIUM
**Estimated Time:** 1 week

#### Tasks:
- [ ] **Image Attachments**
  - Drag-and-drop images into chat
  - Use Gemini Vision for image analysis
  - Support PNG, JPG, WebP
  - Extract text from screenshots (OCR)

- [ ] **Screenshot Analysis**
  - Browser screenshot tool
  - Annotate screenshots before sending
  - Analyze UI/UX elements
  - Extract data from charts/graphs

- [ ] **File Attachments**
  - Attach CSV files for data analysis
  - Attach code files for review
  - Preview attachments before sending

#### Gemini Vision Integration:
```typescript
const response = await gemini.generateContent([
  { text: userMessage },
  {
    inlineData: {
      mimeType: 'image/png',
      data: base64Image
    }
  }
]);
```

---

### 2.3 Workflow Automation
**Priority:** MEDIUM-HIGH
**Estimated Time:** 2 weeks

#### Tasks:
- [ ] **Multi-Step Actions**
  - Define workflow schema
  - Chain multiple API calls
  - Progress tracking UI
  - Error handling at each step

- [ ] **Action Templates**
  - "Create Social Campaign" workflow
  - "Analyze Competitor" workflow
  - "Generate Weekly Content" workflow
  - User-customizable templates

- [ ] **Scheduled Actions**
  - Schedule messages/actions for later
  - Recurring tasks (daily/weekly)
  - Reminder system
  - Integration with calendar

#### Example Workflow:
```yaml
Workflow: "Launch Product on Reddit"
Steps:
  1. Generate Reddit post from product description
  2. Create engaging title (A/B test 3 options)
  3. Identify best subreddits (using TrendPulse)
  4. Schedule posts for optimal times
  5. Set up engagement tracking
```

---

## Phase 3: Intelligence & Learning (3-6 months)
**Goal:** Make Helix truly personalized and proactive

### 3.1 Learning & Personalization
**Priority:** MEDIUM
**Estimated Time:** 3 weeks

#### Tasks:
- [ ] **Preference Learning**
  - Track user interactions (positive/negative feedback)
  - Learn preferred response styles
  - Adapt tone based on context
  - Store in `user_preferences` table

- [ ] **Response Style Adaptation**
  - Detect user communication patterns
  - Match formality level
  - Adjust verbosity (concise vs. detailed)
  - Learn industry-specific terminology

- [ ] **Proactive Suggestions**
  - Analyze user behavior patterns
  - Suggest actions before asked
  - "Users like you also tried..."
  - Context-aware recommendations

#### ML Approach:
```
User Feedback → Preference Vector → Fine-tuned Prompts
   ↓                    ↓                    ↓
Clicks, Ratings    Feature weights    Personalized AI
```

---

### 3.2 Advanced Analytics
**Priority:** MEDIUM
**Estimated Time:** 2 weeks

#### Tasks:
- [ ] **Usage Dashboard**
  - File: `app/helix/analytics/page.tsx`
  - Messages per day/week/month
  - Most common queries
  - Average response time
  - User satisfaction scores

- [ ] **ROI Measurement**
  - Time saved vs. manual tasks
  - Tasks completed via Helix
  - Productivity metrics
  - Cost per query

- [ ] **Success Rate Tracking**
  - Track completed vs. abandoned tasks
  - Identify failure patterns
  - A/B test prompt variations
  - User satisfaction surveys (thumbs up/down)

---

### 3.3 Platform Integration
**Priority:** HIGH
**Estimated Time:** 2 weeks

#### Tasks:
- [ ] **Campaigns Integration**
  - "Create campaign" via Helix
  - Edit campaign settings
  - Get campaign analytics
  - Suggest optimizations

- [ ] **ContentFlow Integration**
  - Generate content drafts
  - Review and edit content
  - Schedule content publishing
  - Analyze content performance

- [ ] **TrendPulse Integration**
  - Query viral scores
  - Analyze trending topics
  - Get content recommendations
  - Predict virality

- [ ] **Analytics Integration**
  - Query performance metrics
  - Generate reports
  - Identify trends
  - Suggest improvements

#### API Design:
```typescript
// Helix actions for platform integration
const actions = {
  'create-campaign': async (params) => {
    return await createCampaign(params);
  },
  'get-analytics': async (campaignId) => {
    return await getAnalytics(campaignId);
  },
  'generate-content': async (brief) => {
    return await generateContent(brief);
  }
};
```

---

## Phase 4: Collaboration & Enterprise (Future)
**Goal:** Scale Helix for teams and organizations

### 4.1 Team Collaboration
**Priority:** LOW (unless team customers exist)
**Estimated Time:** 3 weeks

- Shared conversations
- Team knowledge bases
- Role-based permissions
- Activity feeds
- Comments on conversations

### 4.2 Enterprise Features
**Priority:** LOW (premature)
**Estimated Time:** 4 weeks

- Audit logging
- Data retention policies
- GDPR compliance
- SSO integration
- White-label options

---

## Technical Infrastructure Improvements

### Performance Optimizations
- [ ] Response caching (Redis)
- [ ] Database query optimization (add indexes)
- [x] Streaming responses (via Vercel AI SDK - Phase 2.0)
- [ ] Lazy loading for conversations
- [ ] Image optimization

### Reliability
- [ ] Automatic retry with exponential backoff
- [ ] Graceful degradation (fallback to simpler AI)
- [ ] Offline message queuing
- [ ] Error boundary components
- [ ] Health check endpoints

### Scalability
- [ ] Database connection pooling
- [ ] Background job processing (BullMQ)
- [ ] Rate limiting (per user tier)
- [ ] CDN for static assets
- [ ] Horizontal scaling preparation

---

## Success Metrics

### Phase 1 Goals:
- ✅ 100% RAG search accuracy on uploaded documents
- ✅ Conversation history loads in <500ms
- ✅ 90% user satisfaction with context awareness

### Phase 2 Goals:
- ✅ Streaming responses implemented (Vercel AI SDK)
- ✅ Tool calling works for 3+ integrations
- ✅ 50% of users try voice input
- ✅ 30% of queries include images
- ✅ 3+ workflow templates created and used
- ✅ Response time <2 seconds (with streaming)

### Phase 3 Goals:
- ✅ 20% improvement in response relevance (based on feedback)
- ✅ 5+ platform integrations working seamlessly
- ✅ 70% of users report time savings

---

## Resource Requirements

### Phase 1:
- **Developer Time:** 60-80 hours
- **Tools:** Google AI Studio, Supabase, pdf-parse, mammoth
- **Cost:** ~$50/month (API usage)

### Phase 2:
- **Developer Time:** 100-120 hours
- **Tools:** Vercel AI SDK, Web Speech API, Google Cloud Speech, jsPDF
- **Dependencies:** `ai`, `@ai-sdk/google`, `@ai-sdk/openai` (optional)
- **Cost:** ~$100/month (with voice APIs + AI usage)

### Phase 3:
- **Developer Time:** 150-200 hours
- **Tools:** Redis, BullMQ, analytics libraries
- **Cost:** ~$200/month (with caching/jobs)

---

## Next Steps

1. ✅ Review and approve this roadmap
2. [ ] Set up project tracking (GitHub Projects or Linear)
3. [ ] Begin Phase 1.1: RAG Implementation
4. [ ] Create detailed technical specs for each task
5. [ ] Set up monitoring/analytics from day 1

---

**Last Updated:** 2025-12-04
**Status:** Ready for Implementation
