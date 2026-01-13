
$prompts = @(
    @{
        Path = "prompts\marketing\facebook-ad-copy-generator.md"
        Title = "Facebook Ad Copy Generator"
        Category = "Marketing"
        Price = "9"
        Description = "Generate high-converting Facebook ad copy using the AIDA framework."
        Prompt = "Act as a professional copywriter. Write 3 variations of Facebook ad copy for [PRODUCT_NAME]. The target audience is [TARGET_AUDIENCE]. The main pain point being addressed is [PAIN_POINT]. Use the AIDA (Attention, Interest, Desire, Action) framework. innovative and punchy tone."
        Example = "Headlines:`n1. Stop Struggling with [Pain Point]`n2. The Secret to [Benefit]`n3. [Product] - The Solution You've Been Waiting For`n`nAd Copy 1:`nAttention: ...`nInterest: ...`nDesire: ...`nAction: Click here to learn more."
        UseCases = @("Launching a new SaaS product", "Promoting a webinar", "eCommerce sales")
    },
    @{
        Path = "prompts\marketing\email-warming-sequence.md"
        Title = "Email Warming Sequence"
        Category = "Marketing"
        Price = "12"
        Description = "Create a 5-day email warming sequence for new subscribers."
        Prompt = "Write a 5-day email sequence for new subscribers to [NEWSLETTER_NAME]. The goal is to build trust and establish authority before selling [PRODUCT]. Tone should be specific, helpful, and personal. `n`nDay 1: Welcome & Value`nDay 2: Personal Story/Epiphany`nDay 3: Case Study/Social Proof`nDay 4: Addressing Objections`nDay 5: Soft Pitch"
        Example = "Subject: Welcome to the family! (Plus a gift inside)`n`nHi [Name],`n`nThanks for joining... Here is what you can expect..."
        UseCases = @("New lead magnet subscribers", "Post-webinar follow-up", "Onboarding new users")
    },
    @{
        Path = "prompts\marketing\landing-page-headline-optimizer.md"
        Title = "Landing Page Headline Optimizer"
        Category = "Marketing"
        Price = "5"
        Description = "Generate 10 headline variations optimized for conversion."
        Prompt = "Generate 10 landing page headline variations for [PRODUCT_DESCRIPTION]. The goal is to [CONVERSION_GOAL]. Target audience: [TARGET_AUDIENCE]. Use psychological triggers like urgency, curiosity, and benefit-driven language."
        Example = "1. 'Stop Wasting Time on X: The Proven Way to Y'`n2. 'The #1 Secret 99% of Marketers Miss'`n3. 'Get Z Without the Headache of A'"
        UseCases = @("A/B testing landing pages", "Improving hero sections", "Ad headlines")
    },
    @{
        Path = "prompts\marketing\seo-meta-description-writer.md"
        Title = "SEO Meta Description Writer"
        Category = "Marketing"
        Price = "5"
        Description = "Write SEO-optimized meta titles and descriptions."
        Prompt = "Write 5 SEO meta titles (under 60 chars) and meta descriptions (under 160 chars) for a page about [PAGE_TOPIC]. Primary keyword: [KEYWORD]. Secondary keywords: [SECONDARY_KEYWORDS]."
        Example = "Title: Best AI Tools for 2026 - Top Reviews & Comparison`nDesc: Discover the top AI tools for 2026. comprehensive reviews, pricing comparisons, and user ratings to help you choose."
        UseCases = @("Blog optimization", "Product page SEO", "Service page SEO")
    },
    @{
        Path = "prompts\marketing\product-launch-email-series.md"
        Title = "Product Launch Email Series"
        Category = "Marketing"
        Price = "15"
        Description = "A comprehensive 7-email sequence for a major product launch."
        Prompt = "Create a 7-email product launch sequence for [PRODUCT_NAME]. Features: [KEY_FEATURES]. Benefits: [KEY_BENEFITS]. Launch date: [DATE]. `n`nStructure:`n1. Tease (3 days out)`n2. Reveal (Launch Day)`n3. Social Proof`n4. Logical/Rational Argument`n5. Emotional Argument`n6. Q&A / FAQs`n7. Closing Soon (Last Chance)"
        Example = "Email 1 Subject: Something big is coming...`nEmail 2 Subject: It's finally here!`n..."
        UseCases = @("Launcing courses", "SaaS feature release", "New eBook launch")
    },
    @{
        Path = "prompts\marketing\instagram-caption-creator.md"
        Title = "Instagram Caption Creator"
        Category = "Marketing"
        Price = "5"
        Description = "Engaging Instagram captions with hashtags."
        Prompt = "Write an engaging Instagram caption for a photo showing [IMAGE_CONTENT]. The vibe is [MOOD]. Include a question to drive engagement. Add 15 relevant hashtags at the end."
        Example = "Sunset vibes today 🌅. Sometimes you just need to pause and reset. What's your favorite way to unwind?`n`n#sunset #mindfulness #relaxation ..."
        UseCases = @("Brand lifestyle posts", "Product showcases", "Behind the scenes")
    },
    @{
        Path = "prompts\marketing\linkedin-thought-leadership-post.md"
        Title = "LinkedIn Thought Leadership Post"
        Category = "Marketing"
        Price = "9"
        Description = "Write viral-style LinkedIn posts that establish authority."
        Prompt = "Write a LinkedIn post about [TOPIC] that challenges conventional wisdom. Start with a hook (short, punchy sentence). Use short paragraphs. Use bullet points for key insights. End with a question to provoke debate. Tone: Professional yet provocative."
        Example = "Most people think X is true.`n`nThey are wrong.`n`nHere is why:`n- Reason 1`n- Reason 2`n`nAgree or disagree?"
        UseCases = @("Personal branding", "Founder stories", "Industry commentary")
    },
    @{
        Path = "prompts\marketing\youtube-video-script-hook.md"
        Title = "YouTube Video Script Hook"
        Category = "Marketing"
        Price = "5"
        Description = "Generate hooks that keep viewers watching past 30 seconds."
        Prompt = "Write 5 potential video hooks for a YouTube video about [VIDEO_TOPIC]. The hook must appear in the first 5 seconds. Use techniques like 'The Pattern Interrupt', 'The Big Promise', or 'The Story Tease'."
        Example = "1. 'I bet you've never seen this before...'`n2. 'This one mistake is costing you thousands...'`n3. 'What if I told you X was a lie?'"
        UseCases = @("YouTube intros", "TikToks", "Reels")
    },
    @{
        Path = "prompts\marketing\customer-persona-generator.md"
        Title = "Customer Persona Generator"
        Category = "Marketing"
        Price = "9"
        Description = "Detailed customer avatars for targeted marketing."
        Prompt = "Create a detailed customer persona for [PRODUCT/SERVICE]. Include demographics, psychographics, goals, challenges, objections to purchasing, and favorite media channels. Give the persona a name."
        Example = "Name: Marketing Mary`nAge: 32`nRole: Marketing Manager`nGoals: Increase ROI, Save Time`nPain Points: Too many tools, messy data..."
        UseCases = @("Strategy sessions", "Copywriting focus", "Team alignment")
    },
    @{
        Path = "prompts\marketing\competitor-analysis-framework.md"
        Title = "Competitor Analysis Framework"
        Category = "Marketing"
        Price = "12"
        Description = "Deep dive analysis of competitor strategies."
        Prompt = "Perform a SWOT analysis for [COMPETITOR_NAME] based on their publicly available website text: [PASTE_TEXT_OR_URL_DESCRIPTION]. Identify their unique selling proposition, pricing strategy weaknesses, and gaps in their content."
        Example = "Strength: Strong brand recognition.`nWeakness: High price point.`nOpportunity: Target their churned users with a migration discount."
        UseCases = @("Market research", "Pitch deck creation", "Strategic pivot")
    },

    # Content Creation
    @{
        Path = "prompts\content\blog-post-outline-generator.md"
        Title = "Blog Post Outline Generator"
        Category = "Content Creation"
        Price = "5"
        Description = "Create comprehensive outlines for long-form SEO content."
        Prompt = "Create a detailed blog post outline for the keyword: [KEYWORD]. Title: [PROPOSED_TITLE]. Structure should include h1, h2, h3 tags and bullet points for what to cover in each section. optimize for semantic SEO."
        Example = "# Title`n## Intro`n## H2 Section`n- Point 1`n- Point 2`n## Conclusion"
        UseCases = @("Writing briefs", "Overcoming writer's block", "SEO planning")
    },
    @{
        Path = "prompts\content\seo-optimized-blog-article.md"
        Title = "SEO Optimized Blog Article"
        Category = "Content Creation"
        Price = "9"
        Description = "Draft a full blog article focused on value and SEO."
        Prompt = "Write a 1500-word blog post based on this outline: [INSERT_OUTLINE]. Use a conversational, authoritative tone. Include transitions between paragraphs. Ensure keyword density is natural."
        Example = "Full 1500 word article text."
        UseCases = @("Content marketing", "Guest posting", "Niche sites")
    },
    @{
        Path = "prompts\content\tweet-thread-generator.md"
        Title = "Tweet Thread Generator"
        Category = "Content Creation"
        Price = "5"
        Description = "Turn articles or ideas into viral Twitter threads."
        Prompt = "Convert the following text into a 10-tweet thread: [INSERT_TEXT]. The first tweet must be a strong hook. The last tweet must be a recap and CTA. Number the tweets 1/x."
        Example = "1/10 This is the hook.`n`n2/10 Point one.`n`n...`n`n10/10 Recap. Follow for more!"
        UseCases = @("Repurposing content", "Building Twitter audience", "Sharing news")
    },
    @{
        Path = "prompts\content\youtube-video-script-full.md"
        Title = "YouTube Video Script (Full)"
        Category = "Content Creation"
        Price = "15"
        Description = "Complete script with visual cues for YouTube videos."
        Prompt = "Write a script for a 10-minute YouTube video on [TOPIC]. `nStructure:`n1. Hook (0:00-0:45)`n2. Intro/Branding (0:45-1:30)`n3. Core Content (Steps 1-3)`n4. CTA`n`nInclude [VISUAL_CUE] notes for the editor."
        Example = "**[Visual: Host smiling]**`nHost: Welcome back!`n**[Visual: B-Roll of product]**"
        UseCases = @("Educational channels", "Product reviews", "Tutorials")
    },
    @{
        Path = "prompts\content\podcast-episode-planner.md"
        Title = "Podcast Episode Planner"
        Category = "Content Creation"
        Price = "9"
        Description = "Plan interview questions and flow for podcasts."
        Prompt = "Plan a podcast episode interviewing [GUEST_NAME], expert in [TOPIC]. Goal: Extract actionable advice on [SUBTOPIC]. List 10 questions, starting easy and getting deep. Include 3 'lighting round' fun questions."
        Example = "1. How did you get started?`n2. What was your biggest failure?`n...`nLighting Round: Coffee or Tea?"
        UseCases = @("Podcast hosts", "YouTube interviews", "Panel moderation")
    },
    @{
        Path = "prompts\content\newsletter-curation-format.md"
        Title = "Newsletter Curation Format"
        Category = "Content Creation"
        Price = "9"
        Description = "Curate links and news into a cohesive newsletter."
        Prompt = "I have these 3 links: [LINK_1], [LINK_2], [LINK_3]. Rewrite the key takeaways from each into a snappy, fun newsletter segment. Theme: [THEME]. Add a personal intro about [WEEKLY_UPDATE]."
        Example = "## What's Happening`n`n**1. [Title]**: Insight here...`n`n**2. [Title]**: Insight here..."
        UseCases = @("Weekly roundups", "Industry news", "Internal team updates")
    },
    @{
        Path = "prompts\content\tiktok-script-generator.md"
        Title = "TikTok Script Generator"
        Category = "Content Creation"
        Price = "5"
        Description = "Scripts optimized for 15-60 second vertical video retention."
        Prompt = "Write a script for a 30-second TikTok about [TOPIC]. `n0-3s: Visual hook + Text overlay`n3-15s: fast explanation`n15-25s: The 'Secret' or 'Tip'`n25-30s: Call to action."
        Example = "0:00 [Text: You're doing it wrong] Check this out..."
        UseCases = @("TikTok", "Reels", "Shorts")
    },
    @{
        Path = "prompts\content\webinar-script-structure.md"
        Title = "Webinar Script Structure"
        Category = "Content Creation"
        Price = "15"
        Description = "High-converting webinar script template."
        Prompt = "Help me outline a 45-minute webinar selling [PRODUCT]. `n1. Hero's Journey Intro`n2. The 'Old Way' vs 'New Way'`n3. 3 Secrets/Pillars`n4. The Stack (Offer)`n5. Urgent CTA."
        Example = "Slide 1: Title`nSlide 2: My Story`n...`nSlide 40: The Offer"
        UseCases = @("Sales webinars", "Live trainings", "Masterclasses")
    },
    @{
        Path = "prompts\content\case-study-writer.md"
        Title = "Case Study Writer"
        Category = "Content Creation"
        Price = "12"
        Description = "Turn client success metrics into compelling stories."
        Prompt = "Write a case study about how [CLIENT] achieved [RESULT] using [SERVICE]. `nChallenge: [DETAILS]`nSolution: [DETAILS]`nResult: [METRICS]. `nFormat: Problem-Agitate-Solve."
        Example = "**Problem:** Company X was losing money.`n**Solution:** They implemented Y.`n**Result:** 300% growth."
        UseCases = @("Sales enablement", "Website social proof", "PDF downloads")
    },
    @{
        Path = "prompts\content\whitepaper-outline.md"
        Title = "Whitepaper Outline"
        Category = "Content Creation"
        Price = "9"
        Description = "Structure for authoritative industry whitepapers."
        Prompt = "Outline a 10-page whitepaper on the future of [INDUSTRY]. Target Audience: C-Level Execs. `nSections: Executive Summary, Market Analysis, Problem Statement, Proposed Solution, Conclusion."
        Example = "1. Executive Summary`n2. The State of AI in 2026`n3. Strategic Risks..."
        UseCases = @("B2B lead generation", "Think pieces", "Industry reports")
    },
    @{
        Path = "prompts\content\ebook-chapter-drafter.md"
        Title = "eBook Chapter Drafter"
        Category = "Content Creation"
        Price = "9"
        Description = "Write meaningful chapters for your eBook."
        Prompt = "Write a 1000-word chapter for an eBook about [BOOK_TOPIC]. This chapter is titled [CHAPTER_TITLE]. It should cover [KEY_POINTS]. Tone: Educational and encouraging."
        Example = "Chapter 1: The Beginning. `n`nIt all starts with a single step..."
        UseCases = @("Lead magnets", "Self-publishing", "Course materials")
    },
    @{
        Path = "prompts\content\faq-generator-from-text.md"
        Title = "FAQ Generator from Text"
        Category = "Content Creation"
        Price = "5"
        Description = "Automatically generate FAQs from product documentation."
        Prompt = "Read the following product description: [INSERT_TEXT]. Generate 10 Frequently Asked Questions and their answers based ONLY on this text. If the answer isn't there, do not make it up."
        Example = "Q: How much does it cost?`nA: It is $19/month."
        UseCases = @("Support pages", "Bot training", "Product pages")
    },
    @{
        Path = "prompts\content\press-release-writer.md"
        Title = "Press Release Writer"
        Category = "Content Creation"
        Price = "9"
        Description = "Standard PR format for news announcements."
        Prompt = "Write a press release announcing [NEWS]. Company: [COMPANY_NAME]. Location: [CITY]. Date: [DATE]. Quote from CEO: [QUOTE_GIST]. Follow standard AP style."
        Example = "FOR IMMEDIATE RELEASE`n`nCompany X Launches Revolutionary Tool`n`nCITY, Date - ..."
        UseCases = @("Product launches", "Partnerships", "Funding news")
    },
    @{
        Path = "prompts\content\infographic-text-content.md"
        Title = "Infographic Text Content"
        Category = "Content Creation"
        Price = "5"
        Description = "Summarize complex data into bitesize points."
        Prompt = "Summarize this article [INSERT_TEXT] into 5 key points suitable for an infographic. Keep each point under 15 words. Suggest an icon for each point."
        Example = "1. 30% Growth (Icon: Chart)`n2. New Features (Icon: Sparkles)"
        UseCases = @("Design briefs", "Social images", "Presentation slides")
    },
    @{
        Path = "prompts\content\social-media-content-calendar.md"
        Title = "Social Media Content Calendar"
        Category = "Content Creation"
        Price = "12"
        Description = "Plan a month of content in one go."
        Prompt = "Create a 4-week content calendar for a [BUSINESS_TYPE]. Platforms: LinkedIn and Twitter. `nFocus areas: [THEMES]. `nFormat: Table with Date, Platform, Topic, and Content Idea."
        Example = "| Date | Platform | Topic | Idea |`n|---|---|---|---|`n| Jan 1 | Twitter | Tips | Thread about X |"
        UseCases = @("Social media management", "Marketing planning", "Consistency")
    },

    # Code & Development
    @{
        Path = "prompts\code\python-script-debugger.md"
        Title = "Python Script Debugger"
        Category = "Code & Development"
        Price = "5"
        Description = "Find and fix bugs in Python code."
        Prompt = "Analyze this Python code: [PASTE_CODE]. I am getting this error: [ERROR_MESSAGE]. Explain why it's happening and provide the corrected code snippet."
        Example = "Error: IndexOutOfRange.`nFix: Check len(list) before accessing."
        UseCases = @("Debugging", "Learning Python", "Code review")
    },
    @{
        Path = "prompts\code\react-component-generator.md"
        Title = "React Component Generator"
        Category = "Code & Development"
        Price = "9"
        Description = "Create clean, functional React components."
        Prompt = "Create a React functional component named [COMPONENT_NAME]. `nProps: [PROPS_LIST]. `nFunctionality: [DESCRIPTION]. `nStyle: Tailwind CSS. `nUse TypeScript interfaces."
        Example = "export const Button = ({label}: ButtonProps) => {...}"
        UseCases = @("Rapid prototyping", "Design system implementation", "Front-end dev")
    },
    @{
        Path = "prompts\code\sql-query-optimizer.md"
        Title = "SQL Query Optimizer"
        Category = "Code & Development"
        Price = "9"
        Description = "Optimize slow SQL queries for performance."
        Prompt = "Here is a SQL query: [INSERT_QUERY]. The table schema is: [SCHEMA_DESC]. Suggest indices to add and rewrite the query for better performance. Explain the changes."
        Example = "Use JOIN instead of subquery. Add index on user_id."
        UseCases = @("Database tuning", "Backend optimization", "Learning SQL")
    },
    @{
        Path = "prompts\code\api-documentation-writer.md"
        Title = "API Documentation Writer"
        Category = "Code & Development"
        Price = "9"
        Description = "Generate Swagger/OpenAPI style docs from code."
        Prompt = "Generate API documentation for this endpoint handler: [CODE_SNIPPET]. Include: URL params, Request Body, Response examples (200, 400, 500). Format as Markdown."
        Example = "## GET /users`nReturns list of users."
        UseCases = @("Documentation", "Developer portal", "Handover")
    },
    @{
        Path = "prompts\code\regex-generator-explainer.md"
        Title = "Regex Generator & Explainer"
        Category = "Code & Development"
        Price = "5"
        Description = "Create complex specific RegEx patterns."
        Prompt = "Create a Regular Expression to match: [PATTERN_REQUIREMENT]. Provide the Regex string and break down exactly how it works for a beginner."
        Example = "``````^[a-z0-9]+$`````` - matches lowercase alphanumeric strings."
        UseCases = @("Form validation", "Data scraping", "String parsing")
    },
    @{
        Path = "prompts\code\unit-test-writer-jest.md"
        Title = "Unit Test Writer (Jest)"
        Category = "Code & Development"
        Price = "9"
        Description = "Generate comprehensive test suites for JS functions."
        Prompt = "Write Jest unit tests for this function: [PASTE_FUNCTION]. Cover happy paths, edge cases, and error handling. Mock any external dependencies like [DEPENDENCY]."
        Example = "test('should return true when...', () => { ... })"
        UseCases = @("TDD", "QA", "Increasing coverage")
    },
    @{
        Path = "prompts\code\code-refactoring-advisor.md"
        Title = "Code Refactoring Advisor"
        Category = "Code & Development"
        Price = "9"
        Description = "Clean up spaghetti code."
        Prompt = "Refactor this function [PASTE_CODE] to be more readable and maintainable. Apply CLEAN code principles. Extract sub-functions where necessary. Add comments."
        Example = "Before: 50 lines function.`nAfter: 3 small functions."
        UseCases = @("Legacy code update", "Code reviews", "Mentoring")
    },
    @{
        Path = "prompts\code\bash-script-automator.md"
        Title = "Bash Script Automator"
        Category = "Code & Development"
        Price = "5"
        Description = "Automate server tasks with Bash."
        Prompt = "Write a Bash script to [TASK_DESCRIPTION]. Ensure it checks if required tools are installed first. Add error handling and echo statements for progress."
        Example = "#!/bin/bash`nif ! command -v git &> /dev/null..."
        UseCases = @("DevOps", "Local automation", "Server management")
    },
    @{
        Path = "prompts\code\git-commit-message-generator.md"
        Title = "Git Commit Message Generator"
        Category = "Code & Development"
        Price = "5"
        Description = "Write semantic, conventional commit messages."
        Prompt = "Based on these changes: [DIFF_OR_SUMMARY], write a conventional commit message. Format: <type>(<scope>): <subject>."
        Example = "feat(auth): add google login provider"
        UseCases = @("Git workflow", "Team standards", "History clarity")
    },
    @{
        Path = "prompts\code\css-tailwind-converter.md"
        Title = "CSS to Tailwind Converter"
        Category = "Code & Development"
        Price = "5"
        Description = "Convert vanilla CSS to Tailwind utility classes."
        Prompt = "Convert this CSS rule to Tailwind CSS classes: [CSS_CODE]. If exact values don't exist, use arbitrary values (e.g., w-[500px])."
        Example = "Input: ``````display: flex; justify-content: center`````` `nOutput: ``````flex justify-center``````"
        UseCases = @("Migration", "Learning Tailwind", "Styling")
    },

    # Business Operations
    @{
        Path = "prompts\business\meeting-minutes-summarizer.md"
        Title = "Meeting Minutes Summarizer"
        Category = "Business Operations"
        Price = "9"
        Description = "Turn raw transcripts into actionable minutes."
        Prompt = "Summarize this meeting transcript: [TRANSCRIPT]. Output: `n1. Attendees`n2. Key Decisions Made`n3. Action Items (Who, What, By When)`n4. Open Questions."
        Example = "**Action Items:**`n- John to email client by Friday.`n- Sarah to fix bug #123."
        UseCases = @("Admin", "Project management", "Record keeping")
    },
    @{
        Path = "prompts\business\project-proposal-writer.md"
        Title = "Project Proposal Writer"
        Category = "Business Operations"
        Price = "15"
        Description = "Win more clients with structured proposals."
        Prompt = "Draft a project proposal for [CLIENT_NAME]. Project: [PROJECT_NAME]. `nSections:`n1. Problem Understanding`n2. Proposed Solution`n3. Timeline`n4. Investment (Pricing)`n5. Why Us?"
        Example = "## Investment`nBased on the scope, the estimated cost is $5,000..."
        UseCases = @("Freelancing", "Agency sales", "Consulting")
    },
    @{
        Path = "prompts\business\job-description-optimizer.md"
        Title = "Job Description Optimizer"
        Category = "Business Operations"
        Price = "9"
        Description = "Attract better talent with better JDs."
        Prompt = "Rewrite this job description for a [ROLE_TITLE] to be more inclusive and appealing to top talent. Remove corporate jargon. Focus on impact and culture. [PASTE_DRAFT]."
        Example = "Instead of 'Must be a rockstar', use 'We are looking for someone passionate about...'"
        UseCases = @("HR", "Hiring managers", "Recruiting")
    },
    @{
        Path = "prompts\business\cold-outreach-email.md"
        Title = "Cold Outreach Email"
        Category = "Business Operations"
        Price = "9"
        Description = "B2B sales emails that get replies."
        Prompt = "Write a cold email to a [TITLE] at a [INDUSTRY] company. Pitch: [VALUE_PROP]. Keep it under 100 words. End with a low-friction CTA (e.g., 'Worth a chat?')."
        Example = "Hi [Name], I saw you're leading X at Y... Have you considered Z? Worth a quick chat?"
        UseCases = @("Sales", "Networking", "Partnerships")
    },
    @{
        Path = "prompts\business\swot-analysis-generator.md"
        Title = "SWOT Analysis Generator"
        Category = "Business Operations"
        Price = "9"
        Description = "Strategic planning made easy."
        Prompt = "Create a SWOT analysis for [COMPANY/IDEA]. Info: [CONTEXT]. List 5 items per quadrant (Strengths, Weaknesses, Opportunities, Threats)."
        Example = "| Strengths | Weaknesses |`n|---|---|`n| Agile team | Low budget |"
        UseCases = @("Strategy", "Business plans", "Marketing")
    },
    @{
        Path = "prompts\business\okr-goal-setting-framework.md"
        Title = "OKR Goal Setting Framework"
        Category = "Business Operations"
        Price = "9"
        Description = "Define clear Objectives and Key Results."
        Prompt = "Define 3 OKRs for [TEAM/DEPARTMENT] focused on [GOAL]. `nObjective: Qualitative and inspirational.`nKey Results: 3-4 Quantitative metrics to measure success."
        Example = "O: Dominate the US market.`nKR: Increase sales by 20%."
        UseCases = @("Management", "Quarterly planning", "Performance tracking")
    },
    @{
        Path = "prompts\business\standard-operating-procedure-sop.md"
        Title = "Standard Operating Procedure (SOP)"
        Category = "Business Operations"
        Price = "12"
        Description = "Document processes clearly."
        Prompt = "Write an SOP for [PROCESS_NAME]. `n1. Purpose`n2. Prerequisites`n3. Step-by-step instructions (numbered)`n4. Troubleshooting common issues."
        Example = "## How to Deploy`n1. Run npm build`n2. Check logs..."
        UseCases = @("Operations", "Training", "Compliance")
    },
    @{
        Path = "prompts\business\contract-clause-explainer.md"
        Title = "Contract Clause Explainer"
        Category = "Business Operations"
        Price = "9"
        Description = "Understand legalese in plain English."
        Prompt = "Explain this contract clause in plain English as if I'm a 5th grader. Warning: Do not validitate legal advice, just explain the language. [PASTE_CLAUSE]."
        Example = "This means if you break the item, you have to pay for it."
        UseCases = @("Legal review", "Signing documents", "Risk assessment")
    },
    @{
        Path = "prompts\business\customer-support-response-polisher.md"
        Title = "Customer Support Response Polisher"
        Category = "Business Operations"
        Price = "5"
        Description = "De-escalate angry customers professionally."
        Prompt = "Rewrite this draft response to an angry customer [PASTE_DRAFT]. The customer is upset about [ISSUE]. Tone: Empathic, apologetic, but firm on policy [POLICY]. Offer [SOLUTION]."
        Example = "I completely understand your frustration... I'm sorry that happened. Here is what I can do..."
        UseCases = @("Support teams", "Social media replies", "Crisis comms")
    },
    @{
        Path = "prompts\business\interview-question-generator.md"
        Title = "Interview Question Generator"
        Category = "Business Operations"
        Price = "9"
        Description = "Screen candidates effectively."
        Prompt = "Generate 10 interview questions for a [ROLE_TITLE]. `n3 Cultural Fit questions`n3 Technical/Skill questions`n4 Situational (behavioral) questions."
        Example = "Tell me about a time you failed. How did you handle it?"
        UseCases = @("Hiring", "Recruiting", "Team building")
    },

    # Creative Writing
    @{
        Path = "prompts\creative\short-story-plot-outline.md"
        Title = "Short Story Plot Outline"
        Category = "Creative Writing"
        Price = "5"
        Description = "Generate plot structures."
        Prompt = "Outline a short story in the [GENRE] genre. Protagonist: [DESC]. Setting: [SETTING]. Use the 'Hero's Journey' structure."
        Example = "1. Call to Adventure: Hero finds map.`n2. Crossing Threshold: Hero leaves home."
        UseCases = @("Creative writing", "Game design", "Screenwriting")
    },
    @{
        Path = "prompts\creative\character-backstory-builder.md"
        Title = "Character Backstory Builder"
        Category = "Creative Writing"
        Price = "5"
        Description = "Deepen your characters."
        Prompt = "Create a backstory for a character named [NAME]. Age: [AGE]. Role: [ROLE]. Include a defining childhood trauma, a secret they keep, and their greatest fear."
        Example = "Name: Arin.`nSecret: He actually stole the sword."
        UseCases = @("novels", "RPGs", "Screenplays")
    },
    @{
        Path = "prompts\creative\dialogue-enhancer.md"
        Title = "Dialogue Enhancer"
        Category = "Creative Writing"
        Price = "5"
        Description = "Make dialogue sound natural."
        Prompt = "Rewrite this dialogue between [CHAR_A] and [CHAR_B] to be more subtext-heavy and less 'on the nose'. [PASTE_DIALOGUE]."
        Example = "Original: 'I am angry at you.'`nRevised: 'Don't pretend you don't know why I'm leaving.'"
        UseCases = @("Editing", "Script doctoring", "Fiction writing")
    },
    @{
        Path = "prompts\creative\world-building-framework.md"
        Title = "World Building Framework"
        Category = "Creative Writing"
        Price = "9"
        Description = "Flesh out fictional worlds."
        Prompt = "Help me build a fantasy world. Magic system based on: [IDEA]. Political structure: [TYPE]. Geography: [MAIN_FEATURE]. Describe the daily life of a commoner."
        Example = "The world of X is ruled by mages. Commoners must pay a magic tax."
        UseCases = @("Fantasy novels", "D&D campaigns", "Game lore")
    },
    @{
        Path = "prompts\creative\creative-writing-prompt-generator.md"
        Title = "Creative Writing Prompt Generator"
        Category = "Creative Writing"
        Price = "5"
        Description = "Never run out of ideas."
        Prompt = "Give me 5 unique creative writing prompts about [THEME]. Each prompt should include a constraint (e.g., 'write without complying the letter E')."
        Example = "Write a story about a clock that runs backwards, but use only 50 words."
        UseCases = @("Daily practice", "Writing groups", "Workshops")
    }
)

foreach ($p in $prompts) {
    # Fix: Ensure UseCases is treated as an array even if it's a single string
    $cases = $p.UseCases
    if ($cases -is [string]) { $cases = @($cases) }
    
    $useCasesString = $cases | ForEach-Object { "- $_" } | Out-String

    $content = @"
# $($p.Title)
**Category:** $($p.Category)
**Price:** `$($p.Price)
**Description:** $($p.Description)

## Full Prompt
$($p.Prompt)

## Example Output
$($p.Example)

## Use Cases
$useCasesString
"@
    
    $fullPath = Join-Path "C:\DEV\3K-Pro-Services\Dev\products\idea_05_AI_PROMPT_TEMPLATES" $p.Path
    $dir = Split-Path $fullPath
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    Set-Content -Path $fullPath -Value $content
    Write-Host "Created: $fullPath"
}
