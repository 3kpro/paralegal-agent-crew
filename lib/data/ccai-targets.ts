export const CCAI_TARGETS = [
  // REDDIT
  { 
    platform: 'reddit', 
    community_name: 'r/SaaS', 
    url: 'https://www.reddit.com/r/SaaS/submit',
    content: {
      title: "I built an AI that turns 1 video into a month of content. Roast my landing page?",
      body: "Hey r/SaaS,\n\nI've been working on Content Cascade AI for the past few months. It solves a problem I had myself: spending way too much time repurposing long-form video content for social media.\n\nIt takes a YouTube video, analyzes the transcript, finds the viral moments, and automatically generates Twitter threads, LinkedIn posts, and TikTok scripts.\n\nI'd love your brutal feedback on the landing page and the value prop. Is it clear? \n\nLink: https://contentcascade.ai"
    }
  },
  { 
    platform: 'reddit', 
    community_name: 'r/SideProject', 
    url: 'https://www.reddit.com/r/SideProject/submit',
    content: {
      title: "Launched my side project: An AI content repurposing engine",
      body: "Hi everyone,\n\nJust launched Content Cascade AI. It's a tool that helps creators and founders repurpose their video content automatically.\n\nYou upload a video, and it gives you ready-to-post content for Twitter, LinkedIn, and more. \n\nWould love to hear what you think! \n\nhttps://contentcascade.ai"
    }
  },
  { 
    platform: 'reddit', 
    community_name: 'r/Entrepreneur', 
    url: 'https://www.reddit.com/r/Entrepreneur/submit',
    content: {
      title: "How I automated my content marketing workflow with AI",
      body: "I used to spend 10+ hours a week just clipping videos and writing posts. I realized this was not scalable, so I built a tool to do it for me.\n\nIt's called Content Cascade AI. It uses Gemini 1.5 to analyze video context and generate native social posts.\n\nHas anyone else tried automating their repurposing flow? What tools are you using?"
    }
  },
  { 
    platform: 'reddit', 
    community_name: 'r/marketing', 
    url: 'https://www.reddit.com/r/marketing/submit',
    content: {
      title: "Is AI content repurposing actually good yet?",
      body: "I've been building a tool called Content Cascade AI that attempts to solve the 'quality' issue with AI content. Instead of generic summaries, it extracts specific hooks and viral moments.\n\nCurious to hear from other marketers: what's the biggest pain point you have with current AI writing tools?"
    }
  },
  
  // TWITTER / X
  { 
    platform: 'twitter', 
    community_name: '#BuildInPublic', 
    url: 'https://twitter.com/compose/tweet',
    content: {
      thread: [
        "I just launched Content Cascade AI 🚀\n\nIt turns your long-form videos into viral social posts automatically.\n\nHere's how I built it 👇 #buildinpublic",
        "1. The Problem: Repurposing content takes FOREVER.\n2. The Solution: AI that understands context, not just keywords.\n3. The Stack: Next.js, Supabase, Gemini 1.5 Flash.",
        "Check it out here: https://contentcascade.ai\n\nWould love your feedback! 🫡"
      ]
    }
  },
  { 
    platform: 'twitter', 
    community_name: '#SaaS', 
    url: 'https://twitter.com/compose/tweet',
    content: {
      text: "Stop wasting time writing social posts manually.\n\nContent Cascade AI turns your videos into a month of content in minutes.\n\nTry it now: https://contentcascade.ai #SaaS #AI #ContentMarketing"
    }
  },
  { 
    platform: 'twitter', 
    community_name: '#AI', 
    url: 'https://twitter.com/compose/tweet',
    content: {
      text: "The future of content is automated repurposing.\n\nContent Cascade AI analyzes your video, finds the best clips, and writes the posts for you.\n\nSee the magic: https://contentcascade.ai #AI #Marketing"
    }
  },

  // LINKEDIN
  {
    platform: 'linkedin',
    community_name: 'Personal Profile',
    url: 'https://www.linkedin.com/feed/',
    content: {
      text: "I'm excited to announce the launch of Content Cascade AI! 🎉\n\nWe've all been there: you spend hours creating a great video, but then you have to spend even more time chopping it up for social media.\n\nContent Cascade AI solves this by automating the entire repurposing workflow. It turns one video into blog posts, Twitter threads, and LinkedIn updates instantly.\n\nCheck it out and let me know what you think: https://contentcascade.ai\n\n#AI #ContentMarketing #SaaS #Startup"
    }
  },

  // INDIE HACKERS
  { 
    platform: 'indie_hackers', 
    community_name: 'Landing Page Feedback', 
    url: 'https://www.indiehackers.com/group/landing-page-feedback',
    content: {
      title: "Roast my landing page: AI Content Repurposing Tool",
      body: "Hey Indie Hackers,\n\nI just pushed the landing page for Content Cascade AI live. It's a tool that automates content repurposing for video creators.\n\nI'm looking for feedback on the copy and the pricing section. Is the value prop clear?\n\nhttps://contentcascade.ai"
    }
  },

  // PRODUCT HUNT
  { 
    platform: 'product_hunt', 
    community_name: 'Product Hunt Launch', 
    url: 'https://www.producthunt.com/posts/new',
    content: {
      tagline: "Turn 1 video into a month of content instantly.",
      description: "Content Cascade AI analyzes your long-form videos and automatically generates viral clips, Twitter threads, LinkedIn posts, and blog articles. Stop wasting time on manual repurposing.",
      first_comment: "Hey Product Hunt! 👋\n\nI'm Mark, the maker of Content Cascade AI.\n\nI built this because I was tired of spending hours editing and writing posts for every single video I made. I wanted a way to 'cascade' my content across all platforms effortlessly.\n\nI'd love to hear your thoughts and answer any questions!"
    }
  },

  // INSTAGRAM / TIKTOK (Visuals)
  {
    platform: 'instagram',
    community_name: 'Reels Caption',
    url: 'https://www.instagram.com/',
    content: {
      caption: "Stop editing manually. 🛑\n\nContent Cascade AI does the heavy lifting for you. 🏋️‍♂️\n\nLink in bio! 🔗\n\n#contentcreator #ai #marketingtips",
      hashtags: ["#contentmarketing", "#socialmediamarketing", "#ai", "#saas"],
      image_prompt: "A futuristic, glowing dashboard interface showing a video file splitting into multiple social media icons (Twitter bird, LinkedIn logo, TikTok note) with a 'streamlined' neon aesthetic. Dark mode, cyber-purple and coral colors."
    }
  }
];
