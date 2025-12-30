# Genkit Agentic Architecture Roadmap

**Status:** Research / Future Planning
**Priority:** Post-Launch (Pro/Premium/Enterprise tiers)
**Last Updated:** 2025-12-29

---

## Overview

This document captures research on Google's **Genkit framework** for building agentic AI applications. The patterns demonstrated in Google's "AI Barista" example app align with Xelora's evolution roadmap for Helix.

**Source:** [Google Developers - Agentic Barista Solution](https://developers.google.com/solutions/learn/agentic-barista)

---

## Key Concepts from Genkit

### 1. Multi-Agent Architecture
Breaking applications into specialized agents that can hand off to each other.

```
orderingAgent (orchestrator)
    ├── recommendationAgent (specialized for recommendations)
    └── [other specialized agents]
```

**Xelora Application:**
```
Helix (orchestrator)
    ├── ContentAgent (generates content variations)
    ├── TrendAgent (analyzes trending topics)
    ├── PublishAgent (handles platform publishing)
    └── AnalyticsAgent (data analysis - already exists as query_analytics)
```

### 2. Tool Calling
Agents use `ai.defineTool()` to interact with external systems.

```typescript
const addItem = ai.defineTool({
  name: 'add_to_order',
  description: 'Add items to the customer order',
  inputSchema: z.object({
    name: z.string(),
    modifiers: z.array(z.string())
  }),
  // ... execute function
});
```

**Current Helix Implementation:**
- Already has `query_analytics` tool for database queries
- Pattern is familiar, just needs expansion

### 3. Human-in-the-Loop Interactions
Critical actions pause for user confirmation before executing.

```typescript
const submitOrder = ai.defineTool({
  name: 'submit_order',
  // ...
  async (input, {context, interrupt, resumed}) => {
    if (!resumed) {
      // Pause and show user what will happen
      interrupt({order: getStateOrder()});
    }
    // Only execute after user approves
    if (resumed?.approved) {
      // Submit the order
    }
  }
});
```

**Xelora Application:**
- **Publishing approval:** "Post this to Twitter?" → Preview → Confirm → Publish
- **Campaign launch:** Review all generated content before going live
- **Prevents accidental publishes** - major UX improvement

### 4. Multimodal Input
Users can upload images, and AI processes them for context.

```typescript
// User uploads photo → AI analyzes → Generates contextual response
message.push({
  media: {url: inputMedia.storageUrl, contentType: inputMedia.contentType}
});
```

**Xelora Application:**
- Upload brand assets (logo, product photos, brand guide)
- AI learns visual style and tone
- Generates on-brand content automatically
- "Upload your brand photo → get content that matches the vibe"

### 5. Session Persistence
Conversations persist across sessions using Firestore.

**Current Helix Implementation:**
- Already using `helix_sessions` and `helix_messages` tables in Supabase
- Pattern is similar, just different storage backend

---

## Mapping to Xelora Tiers

| Feature | Tier | Complexity | Value |
|---------|------|------------|-------|
| Human-in-the-loop publishing | Pro | Medium | High - prevents mistakes |
| Specialized sub-agents | Premium | High | High - better task handling |
| Multimodal brand analysis | Premium | High | Very High - differentiator |
| Full multi-agent orchestration | Enterprise | Very High | Enterprise-grade automation |

---

## Implementation Phases

### Phase 1: Pro Tier - Human-in-the-Loop Publishing
**Goal:** Add confirmation step before any publish action.

```
User: "Post this to Twitter"
Helix: [Shows preview card]
       "Ready to publish this to Twitter?"
       [Confirm] [Edit] [Cancel]
User: [Clicks Confirm]
Helix: "Published! Here's the link: ..."
```

**Technical:**
- Add `interrupt()` pattern to publish flow
- Create preview UI component
- Store pending actions in session state

### Phase 2: Premium Tier - Multimodal Brand DNA
**Goal:** Users upload brand assets, AI learns style.

```
User: [Uploads logo, product photos, brand guide PDF]
Helix: "I've analyzed your brand. Your tone is professional
       but approachable, colors are blue/white, style is minimal..."

User: "Create a Twitter post about our new feature"
Helix: [Generates content matching brand style]
```

**Technical:**
- Integrate Cloud Storage (or Supabase Storage) for media
- Use Gemini's multimodal capabilities
- Store brand DNA in `helix_brand_dna` table (already exists)

### Phase 3: Enterprise - Multi-Agent Orchestration
**Goal:** Specialized agents for different tasks.

```
User: "Launch a campaign for my new product"

Helix (orchestrator):
  → TrendAgent: "What's trending in [user's industry]?"
  → ContentAgent: "Generate 5 post variations using trends"
  → [Human-in-the-loop]: "Review these posts"
  → PublishAgent: "Schedule approved posts"
```

**Technical:**
- Refactor to Genkit framework
- Define specialized agent prompts
- Build agent handoff logic
- Create agent-specific tools

---

## Technical Considerations

### Current Stack vs Genkit

| Aspect | Current | Genkit |
|--------|---------|--------|
| AI Provider | Gemini via AI SDK | Gemini via Genkit |
| Session Storage | Supabase | Firestore (native) or custom adapter |
| Auth | Supabase Auth | Firebase Auth (native) or custom |
| Hosting | Vercel | Cloud Run (native) or any Node.js |
| Tools | Manual implementation | `ai.defineTool()` pattern |

### Migration Path

1. **Don't migrate everything at once**
2. Start with human-in-the-loop as a standalone feature
3. Evaluate Genkit for new features, not rewriting existing
4. Consider hybrid: Keep Supabase, use Genkit for agent logic only

### Supabase Adapter for Genkit Sessions

Would need to implement `SessionStore` interface:

```typescript
class SupabaseSessionStore implements SessionStore {
  async get(sessionId: string): Promise<SessionData> {
    const { data } = await supabase
      .from('helix_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    return data;
  }

  async save(sessionId: string, sessionData: SessionData): Promise<void> {
    await supabase
      .from('helix_sessions')
      .upsert({ id: sessionId, ...sessionData });
  }
}
```

---

## Competitive Advantage

If implemented, this positions Xelora as:

1. **Not just a content tool** - An intelligent marketing copilot
2. **Safe publishing** - Human-in-the-loop prevents brand disasters
3. **Brand-aware** - Multimodal analysis creates truly on-brand content
4. **Enterprise-ready** - Multi-agent architecture scales to complex workflows

---

## Resources

- [Google Genkit Documentation](https://firebase.google.com/docs/genkit)
- [AI Barista Solution](https://developers.google.com/solutions/learn/agentic-barista)
- [Genkit on GitHub](https://github.com/firebase/genkit)
- [Tool Calling in Genkit](https://firebase.google.com/docs/genkit/tool-calling)

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-29 | Document as future roadmap, not immediate | Launch priority is current Helix. This is Pro+ tier evolution. |

---

*This document is for planning purposes. Implementation decisions should be made post-launch based on user feedback and business priorities.*
