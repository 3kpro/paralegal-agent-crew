export const CCAI_TARGETS = [
  // DAY 1: THE AI ASSISTANT REVEAL (Focus: Intelligence, Vertex AI, Onboarding)
  { 
    day: 1,
    platform: 'product_hunt', 
    community_name: 'Product Hunt Launch', 
    url: 'https://www.producthunt.com/posts/new',
    content: {
      tagline: "Your AI Marketing Strategist, powered by Google Vertex AI.",
      description: "Content Cascade AI isn't just a content generator. It's an intelligent marketing assistant that learns your brand, plans your strategy, and guides you through the entire campaign lifecycle. Built on Gemini 1.5 Pro.",
      first_comment: "Hey Product Hunt! 👋\n\nI'm Mark, founder of Content Cascade AI.\n\nWe realized that 'generating content' wasn't enough. Users needed strategy. That's why we pivoted to build a true AI Marketing Assistant first.\n\nIt uses Google Vertex AI to understand your product and guide you through onboarding and campaign planning. Would love your feedback on the assistant's helpfulness!"
    }
  },
  { 
    day: 1,
    platform: 'reddit', 
    community_name: 'r/SaaS', 
    url: 'https://www.reddit.com/r/SaaS/submit',
    content: {
      title: "I built an AI onboarding assistant using Vertex AI to solve the 'blank page' problem. Roast my flow?",
      body: "Hey r/SaaS,\n\nWe found that users were getting stuck *before* they even generated content. They didn't know what to ask for.\n\nSo we paused our main launch to build a dedicated AI Marketing Assistant using Google Vertex AI and Gemini 1.5.\n\nIt acts as a concierge, interviewing the user to build a brand profile before a single post is written. \n\nIs this overkill for an MVP, or the right move for retention? Link: https://contentcascade.ai"
    }
  },
  { 
    day: 1,
    platform: 'reddit', 
    community_name: 'r/ArtificialInteligence', 
    url: 'https://www.reddit.com/r/ArtificialInteligence/submit',
    content: {
      title: "Technical Deep Dive: Orchestrating Gemini 1.5 Pro via Vertex AI for a context-aware marketing assistant",
      body: "I wanted to share our architecture for the new Content Cascade AI assistant.\n\nInstead of simple RAG, we're using a multi-agent setup on Vertex AI. One agent handles strategy, another handles brand voice compliance, and a third manages the actual content generation.\n\nWe're seeing much higher relevance compared to standard GPT-4 wrappers. Happy to answer questions about the Vertex AI integration!"
    }
  },
  { 
    day: 1,
    platform: 'twitter', 
    community_name: '#BuildInPublic', 
    url: 'https://twitter.com/compose/tweet',
    content: {
      thread: [
        "We pivoted our launch strategy. 🔄\n\nInstead of just 'content generation', we're launching with a full AI Marketing Assistant first.\n\nWhy? Because context is king. 👑\n\nHere's how we built it using Google Vertex AI 👇 #buildinpublic #AI",
        "1. The Problem: Users churn when they don't know what to post.\n2. The Fix: An AI that interviews YOU first.\n3. The Tech: Gemini 1.5 Pro + Vertex AI for massive context windows.",
        "Try the new onboarding flow: https://contentcascade.ai\n\nIt's like having a CMO in your pocket."
      ]
    }
  },
  {
    day: 1,
    platform: 'linkedin',
    community_name: 'Personal Profile',
    url: 'https://www.linkedin.com/feed/',
    content: {
      text: "I'm excited to unveil the new direction for Content Cascade AI.\n\nWe've shifted focus from pure automation to **intelligence**.\n\nToday, we're launching our new AI Marketing Assistant, powered by Google Vertex AI. It's designed to help founders and marketing teams build a strategy *before* they spend a dime on ads.\n\nIt's not just about writing posts; it's about writing the *right* posts.\n\nCheck it out: https://contentcascade.ai #AI #MarketingStrategy #GoogleCloud #Startup"
    }
  },

  // DAY 2: THE CONTENT ENGINE (Focus: Execution & Automation)
  { 
    day: 2,
    platform: 'reddit', 
    community_name: 'r/ContentCreation', 
    url: 'https://www.reddit.com/r/ContentCreation/submit',
    content: {
      title: "Automating the boring stuff: How our AI assistant handles the repurposing workflow",
      body: "Now that we have the strategy layer (see yesterday's post), here is how the execution works.\n\nOnce the AI Assistant understands your brand, it can take a single asset (like a video or blog) and 'cascade' it into 20+ pieces of content.\n\nWe're trying to bridge the gap between 'quality strategy' and 'quantity execution'. Thoughts on this hybrid approach?"
    }
  },
  { 
    day: 2,
    platform: 'reddit', 
    community_name: 'r/SideProject', 
    url: 'https://www.reddit.com/r/SideProject/submit',
    content: {
      title: "Update: Added an 'Auto-Pilot' mode to my marketing tool",
      body: "Following up on the AI Assistant launch... we just enabled the 'Auto-Pilot' feature.\n\nOnce your strategy is approved by the assistant, you can click one button to generate a week's worth of content across Twitter, LinkedIn, and Reddit.\n\nIt's live now. Would love to hear if the tone matches what you'd write yourself. https://contentcascade.ai"
    }
  },
  { 
    day: 2,
    platform: 'twitter', 
    community_name: '#SaaS', 
    url: 'https://twitter.com/compose/tweet',
    content: {
      text: "Strategy without execution is hallucination.\n\nContent Cascade AI does both.\n\n1. The Assistant plans the campaign.\n2. The Engine generates the assets.\n\nSee it in action: https://contentcascade.ai #SaaS #Automation"
    }
  },
  {
    day: 2,
    platform: 'instagram',
    community_name: 'Reels Caption',
    url: 'https://www.instagram.com/',
    content: {
      caption: "Your new marketing intern is an AI. 🤖\n\nMeet the Content Cascade Assistant. It learns your brand, plans your posts, and writes them for you.\n\nPowered by Vertex AI. Link in bio! 🔗\n\n#ai #marketing #business",
      hashtags: ["#artificialintelligence", "#growthhacking", "#startup", "#googlecloud"],
      image_prompt: "A split screen comparison: Left side 'Manual' showing a stressed person with messy notes. Right side 'With CCAI' showing a calm person sipping coffee while a holographic AI interface organizes content. Cyber-clean aesthetic."
    }
  },

  // DAY 3: THE VISION & ROADMAP (Focus: Enterprise & Future)
  { 
    day: 3,
    platform: 'reddit', 
    community_name: 'r/Entrepreneur', 
    url: 'https://www.reddit.com/r/Entrepreneur/submit',
    content: {
      title: "Why we're betting on 'Assisted Intelligence' over 'Full Automation' for Enterprise",
      body: "There's a lot of noise about 'fully autonomous' marketing. We think that's dangerous for brands.\n\nOur roadmap focuses on the 'Human-in-the-loop' approach. The AI Assistant (Vertex AI) does the heavy lifting, but you steer the ship.\n\nWe believe this is the only way to sell to Enterprise clients who care about brand safety. Agree or disagree?"
    }
  },
  { 
    day: 3,
    platform: 'reddit', 
    community_name: 'r/marketing', 
    url: 'https://www.reddit.com/r/marketing/submit',
    content: {
      title: "The future of the 'Marketing Generalist' in an AI world",
      body: "We're building Content Cascade AI to be the tool for the modern marketing generalist.\n\nYou don't need to be a copywriter, data scientist, and strategist. The AI Assistant handles the specialized tasks, letting you focus on the big picture.\n\nHow are you using AI to augment your team today?"
    }
  },
  { 
    day: 3,
    platform: 'twitter', 
    community_name: '#AI', 
    url: 'https://twitter.com/compose/tweet',
    content: {
      text: "The roadmap is clear: \n\nPhase 1: AI Assistant (Live Now) ✅\nPhase 2: Content Automation (Beta) 🚧\nPhase 3: Enterprise Analytics (Coming Soon) 🔮\n\nJoin us on the journey: https://contentcascade.ai #BuildingInPublic"
    }
  },

  // DAY 4: FEEDBACK & ITERATION (Focus: Community)
  { 
    day: 4,
    platform: 'indie_hackers', 
    community_name: 'Landing Page Feedback', 
    url: 'https://www.indiehackers.com/group/landing-page-feedback',
    content: {
      title: "Roast my roadmap: AI Assistant -> Full Automation Platform",
      body: "Hey Indie Hackers,\n\nWe've just rolled out the new AI Assistant powered by Vertex AI. It's the first step in our roadmap towards a full enterprise marketing platform.\n\nI'd love feedback on the positioning. Does 'AI Assistant' resonate more than 'Content Generator'?\n\nhttps://contentcascade.ai"
    }
  },
  { 
    day: 4,
    platform: 'reddit', 
    community_name: 'r/startups', 
    url: 'https://www.reddit.com/r/startups/submit',
    content: {
      title: "Lessons learned integrating Google Vertex AI into a Next.js app",
      body: "We just finished a sprint integrating the new Gemini models via Vertex AI for our marketing assistant.\n\nKey takeaways:\n1. Context window size is a game changer for brand voice.\n2. Latency is manageable with optimistic UI.\n3. The quality of 'reasoning' is noticeably better than smaller models.\n\nHappy to share code snippets if anyone is interested!"
    }
  }
];
