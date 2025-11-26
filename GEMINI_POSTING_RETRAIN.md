# Gemini Posting Model Retrain - TrendPulse Focus

## Context
The `/launchpad` posting app currently generates content for "Content Cascade AI" (a video repurposing tool). This needs to be retrained to generate content for **TrendPulse** - an AI-powered social media management platform.

## 4-Day Posting Structure (Maintained)
- **Day 1**: Launch (Product Hunt, Twitter thread, LinkedIn, r/SaaS)
- **Day 2**: Momentum (Twitter follow-up, r/SideProject, Instagram/TikTok)
- **Day 3**: Value & Education (r/Entrepreneur, r/marketing, Twitter feature)
- **Day 4**: Feedback & Iteration (Indie Hackers)

## TrendPulse Product Details

### What is TrendPulse?
AI-powered social media management SaaS that enables businesses to:
- Create, optimize, and publish content across Twitter, Instagram, LinkedIn, Facebook, and TikTok
- Get AI-powered viral score predictions (0-100) before posting
- Generate platform-optimized content with OpenAI GPT-4
- Schedule content weeks in advance
- Manage multiple accounts from one dashboard

### Key Value Props
1. **Viral Score Prediction** - Know if content will go viral BEFORE posting (patent pending)
2. **Multi-Platform Publishing** - Post to 5+ platforms simultaneously
3. **AI Content Generation** - Platform-specific content optimization
4. **Bootstrap-Friendly Pricing** - $0-$79/month (50% cheaper than competitors)
5. **Modern Stack** - Next.js 15, Vertex AI, Gemini assistant

### Target Audience
- Individual creators, micro-influencers
- Small businesses, freelancers
- Marketing teams, small agencies
- Solo founders building in public

### Pricing Tiers
- **Free**: $0/month (5 posts, viral testing)
- **Starter**: $9/month (30 posts, 3 accounts per platform)
- **Pro**: $29/month (100 posts, AI assistant)
- **Business**: $79/month (500 posts, team features)

### Competitors
Hootsuite ($99/month), Buffer ($99/month), Sprout Social ($249/month)

### Key Differentiators
- AI-first (not bolted on)
- 50% cheaper than competitors
- Viral prediction algorithm
- Modern tech stack (faster, better UX)

## Updated Content Generation Prompts

### File: `app/api/launchpad/generate/route.ts`

Replace existing prompts (lines 81-143) with TrendPulse-focused versions:

#### Twitter (Line 81)
```
You are a viral social media expert. Write a Twitter thread (3-5 tweets) to launch TrendPulse.

Product: TrendPulse
URL: https://trendpulse.3kpro.services
Description: AI-powered social media management platform with viral score prediction. Post to Twitter, Instagram, LinkedIn, Facebook, TikTok from one dashboard. Get AI-powered viral scores before posting. Generate platform-optimized content. $0-$79/month pricing (50% cheaper than Hootsuite).

Target Audience: Solo founders, indie hackers, creators, small businesses.
Tone: Exciting, authentic, "building in public", problem-focused.
Angle: Emphasize the pain of managing multiple platforms and the viral prediction feature.

Format: Return ONLY a JSON object with a "thread" array of strings.
```

#### Reddit (Line 92)
```
You are a helpful community member. Write a Reddit post for the ${target.community_name} subreddit.

Product: TrendPulse
URL: https://trendpulse.3kpro.services
Description: AI-powered social media management platform. Viral score prediction, multi-platform publishing (Twitter, Instagram, LinkedIn, Facebook, TikTok), AI content generation. Built on Next.js 15 + Vertex AI. Free tier available.

Context: I'm the founder launching this to solve my own problem of managing social media across platforms.
Tone: Humble, transparent, asking for feedback. NOT salesy. Show vulnerability.
Pain Point: "I was spending 10+ hours/week managing social accounts. Built TrendPulse to predict what content will go viral BEFORE posting."

Format: Return ONLY a JSON object with "title" and "body" fields.
```

#### LinkedIn (Line 104)
```
You are a thought leader. Write a LinkedIn post to announce TrendPulse.

Product: TrendPulse
URL: https://trendpulse.3kpro.services
Description: AI-powered social media management platform. Predict viral content with 85% accuracy. Publish to 5+ platforms from one dashboard. AI content generation. $9-$79/month (vs Hootsuite $99+).

Tone: Professional, insightful, focusing on the "why" and the problem solved.
Angle: Modern businesses need data-driven social media strategies, not guesswork.

Format: Return ONLY a JSON object with a "text" field.
```

#### Product Hunt (Line 115)
```
You are a Product Hunt launch expert. Write the assets for TrendPulse's Product Hunt launch.

Product: TrendPulse
URL: https://trendpulse.3kpro.services
Description: AI-powered social media management platform. Viral score prediction (0-100) tells you if content will succeed BEFORE posting. Multi-platform publishing (Twitter, Instagram, LinkedIn, Facebook, TikTok). AI content generation. Modern stack (Next.js 15, Vertex AI, Gemini). $0-$79/month.

Tone: Punchy, exciting, clear value prop.
Unique Hook: First social media tool with AI-powered viral prediction.

Format: Return ONLY a JSON object with "tagline" (max 60 chars), "description" (max 260 chars), and "first_comment" (intro from maker) fields.
```

#### Instagram/TikTok (Line 126)
```
You are a visual content strategist. Create a concept for a viral ${target.platform} post for TrendPulse.

Product: TrendPulse
URL: https://trendpulse.3kpro.services
Description: AI-powered social media management platform. Know if your post will go viral BEFORE you publish. Multi-platform scheduling. AI content generation. $0-$79/month.

Visual Angle: Show the pain of manual social media management vs automated workflow.
Hook: "Stop guessing if your content will go viral."

Format: Return ONLY a JSON object with "caption" (text), "hashtags" (array of strings), and "image_prompt" (description of the image/video to generate) fields.
```

#### Generic Fallback (Line 136)
```
Write a social media post for ${target.platform} to launch TrendPulse.

Product: TrendPulse
URL: https://trendpulse.3kpro.services
Description: AI-powered social media management platform with viral score prediction. Post to Twitter, Instagram, LinkedIn, Facebook, TikTok from one dashboard. AI content generation. $0-$79/month.

Tone: Problem-focused, authentic.
Pain Point: Managing social media across platforms is time-consuming and you never know what will work.

Format: Return ONLY a JSON object with a "text" field.
```

## Updated Static Content

### File: `lib/data/ccai-targets.ts`

Replace ALL content in `CCAI_TARGETS` array with TrendPulse-focused versions:

#### Day 1 Examples:

**Product Hunt:**
```javascript
{
  tagline: "Know if your post will go viral before you publish",
  description: "TrendPulse predicts content virality with 85% accuracy using AI. Publish to Twitter, Instagram, LinkedIn, Facebook, TikTok from one dashboard. AI content generation included. $0-$79/month.",
  first_comment: "Hey Product Hunt! 👋\n\nI'm Kevin, the founder of TrendPulse.\n\nI built this because I was tired of guessing which social posts would work. I wanted to know BEFORE I hit publish.\n\nTrendPulse uses Google Vertex AI to score your content (0-100) and predict engagement. It's like having a crystal ball for social media.\n\nWould love your feedback!"
}
```

**Twitter #BuildInPublic:**
```javascript
{
  thread: [
    "I just launched TrendPulse 🚀\n\nIt tells you if your social post will go viral BEFORE you publish.\n\nHere's why I built it 👇 #buildinpublic",
    "The Problem: You spend hours creating content, post it, and... crickets. No way to know what will work.\n\nThe Solution: AI-powered viral prediction (0-100 score) trained on 1M+ posts. 85% accuracy.",
    "Stack: Next.js 15, Supabase, Google Vertex AI, Gemini.\n\nPricing: $0-$79/month (50% cheaper than Hootsuite)\n\nCheck it out: https://trendpulse.3kpro.services\n\nFeedback welcome! 🙏"
  ]
}
```

**LinkedIn:**
```javascript
{
  text: "I'm excited to announce TrendPulse! 🎉\n\nEvery marketer faces this: you create content, hit publish, and hope for the best.\n\nTrendPulse solves this with AI-powered viral prediction. It scores your content (0-100) BEFORE you post, so you know what will work.\n\nIt also handles multi-platform publishing (Twitter, Instagram, LinkedIn, Facebook, TikTok) and AI content generation.\n\nBuilt for bootstrappers: $0-$79/month vs Hootsuite's $99+.\n\nCheck it out: https://trendpulse.3kpro.services\n\n#AI #SocialMedia #MarketingTech #SaaS"
}
```

**r/SaaS:**
```javascript
{
  title: "I built an AI that predicts if your social post will go viral. Feedback?",
  body: "Hey r/SaaS,\n\nI've been working on TrendPulse for the past 6 months. It solves a problem I had: no way to know if my social content would work before posting.\n\nTrendPulse uses Google Vertex AI to score your content (0-100) and predict engagement. It's trained on 1M+ posts with 85% accuracy.\n\nAlso handles multi-platform publishing (Twitter, Instagram, LinkedIn, Facebook, TikTok) and AI content generation.\n\nPricing: $0-$79/month (vs Hootsuite $99+).\n\nI'd love brutal feedback on the landing page and value prop.\n\nLink: https://trendpulse.3kpro.services"
}
```

#### Day 2 Examples:

**Twitter #SaaS:**
```javascript
{
  text: "Stop guessing if your content will work.\n\nTrendPulse uses AI to predict viral potential BEFORE you post.\n\n85% accuracy. $0-$79/month.\n\nTry it: https://trendpulse.3kpro.services #SaaS #AI #SocialMedia"
}
```

**r/SideProject:**
```javascript
{
  title: "Launched my side project: AI-powered viral prediction for social media",
  body: "Hi everyone,\n\nJust launched TrendPulse. It's a social media management tool that predicts if your content will go viral BEFORE you publish.\n\nUses Google Vertex AI trained on 1M+ posts. Also handles multi-platform publishing and AI content generation.\n\nBuilt this because I was tired of posting into the void and hoping something would stick.\n\nWould love feedback!\n\nhttps://trendpulse.3kpro.services"
}
```

**Instagram Reels:**
```javascript
{
  caption: "Stop posting blindly. 🎯\n\nTrendPulse shows your viral score BEFORE you publish. 📊\n\nLink in bio! 🔗",
  hashtags: ["#socialmedia", "#contentcreator", "#ai", "#marketing"],
  image_prompt: "A futuristic dashboard showing a social media post with a glowing '89/100' viral score displayed prominently. Dark mode UI with cyan and coral accents. Modern, clean aesthetic."
}
```

#### Day 3 Examples:

**r/Entrepreneur:**
```javascript
{
  title: "How I use AI to predict which social posts will go viral",
  body: "I used to waste hours creating content that flopped. No way to know what would work.\n\nSo I built TrendPulse - an AI that scores your content (0-100) and predicts engagement BEFORE you post.\n\nIt's trained on 1M+ posts with 85% accuracy using Google Vertex AI.\n\nAlso handles multi-platform publishing and AI content generation.\n\nHas anyone else tried using AI for social media strategy? What tools are working for you?"
}
```

**r/marketing:**
```javascript
{
  title: "Is AI social media prediction actually accurate yet?",
  body: "I've been building TrendPulse - an AI that predicts viral potential (0-100 score) before posting.\n\nCurrent accuracy: 85% on 1M+ post training data.\n\nCurious to hear from marketers: would you trust an AI to tell you if your content will work? What accuracy rate would you need?"
}
```

**Twitter #AI:**
```javascript
{
  text: "The future of social media is predictive, not reactive.\n\nTrendPulse uses AI to score your content before posting.\n\n85% accuracy. Know what will work.\n\nSee it: https://trendpulse.3kpro.services #AI #MarTech"
}
```

#### Day 4 Example:

**Indie Hackers:**
```javascript
{
  title: "Roast my landing page: AI Viral Prediction for Social Media",
  body: "Hey Indie Hackers,\n\nJust pushed TrendPulse live. It's a social media tool that predicts viral potential (0-100 score) before you post.\n\nI'm bootstrapping this solo and would love feedback on:\n1. Is the value prop clear?\n2. Is the pricing too low? ($0-$79/month)\n3. Does the viral prediction feature make sense?\n\nhttps://trendpulse.3kpro.services\n\nThanks!"
}
```

## Key Messaging Guidelines

### Pain Points to Emphasize
- No way to know if content will work before posting
- Managing multiple social platforms is time-consuming
- Expensive competitors (Hootsuite $99+, Buffer $99+)
- Guessing what content will succeed

### Benefits to Highlight
- Viral score prediction (0-100) with 85% accuracy
- Multi-platform publishing from one dashboard
- AI content generation (platform-optimized)
- Bootstrap-friendly pricing ($0-$79/month)
- Modern, fast UI (Next.js 15)

### Tone Guidelines
- **Twitter**: Punchy, exciting, "building in public" energy
- **Reddit**: Humble, transparent, asking for feedback (NOT salesy)
- **LinkedIn**: Professional, data-focused, problem-solving
- **Product Hunt**: Clear value prop, exciting, maker-first
- **Instagram/TikTok**: Visual, hook-first, aspirational

### What NOT to Say
- Don't mention "Content Cascade AI" or "video repurposing"
- Don't focus on video content (TrendPulse is multi-format)
- Avoid generic "AI tool" language
- Don't oversell - be authentic and humble

## Implementation Steps

1. Update `app/api/launchpad/generate/route.ts` prompts (lines 81-143)
2. Replace all content in `lib/data/ccai-targets.ts` with TrendPulse versions
3. Test generation for each platform/day combination
4. Verify viral score, pricing, and URL are correct
5. Ensure tone matches platform (humble on Reddit, exciting on Twitter)

## Success Criteria

Generated posts should:
- Focus on TrendPulse's viral prediction feature (primary differentiator)
- Mention multi-platform publishing (Twitter, Instagram, LinkedIn, Facebook, TikTok)
- Include pricing ($0-$79/month) and compare to competitors
- Use authentic, founder-first tone (especially on Reddit)
- Be platform-specific (not generic)
- URL: `https://trendpulse.3kpro.services` (correct)
