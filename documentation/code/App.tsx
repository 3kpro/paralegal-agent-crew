
import React, { useState, createContext, useContext, useCallback, useMemo } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import {
  Step, Trend, AppState, AppContextType, PresentationStyle, FocusPoint, ContentLength, ContentTone,
  TargetAudience, ContentFocus, CallToAction, SocialPlatform, SocialPost, AI_MODEL_TEXT, AI_MODEL_IMAGE, getAiClient, socialPostSchema
} from './types';
import { Button, Input, Card, ToggleChip, TextArea, Select, Checkbox, LoadingSpinner } from './components/UI';
import { SparklesIcon, CheckIcon, SearchIcon, XIcon, BotIcon, ImageIcon, SocialIcon } from './components/Icons';

// --- CONTEXT ---
const initialAppState: AppState = {
  step: 'discover',
  trendingTopic: '',
  productDetails: {
    productName: '', productUrl: '', presentationStyle: 'Benefits-focused', focusPoints: [],
    highlightPrice: false, includeTestimonials: false, customDescription: '', aiDescription: '',
  },
  campaignImage: { platform: '', style: 'Modern', generating: false, url: '', prompt: '' },
  contentSettings: {
    creativity: 0.7, contentLength: 'Standard', contentTone: 'Professional', targetAudience: 'General Audience',
    contentFocus: 'Share Information', callToAction: 'Ask for Engagement',
  },
  generatedPosts: [],
  isLoading: false,
  error: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialAppState);

  const setStep = (step: Step) => setState(s => ({ ...s, step }));
  const setTrendingTopic = (topic: string) => setState(s => ({ ...s, trendingTopic: topic }));
  const updateProductDetails = (details: Partial<AppState['productDetails']>) => setState(s => ({ ...s, productDetails: { ...s.productDetails, ...details } }));
  const updateCampaignImage = (image: Partial<AppState['campaignImage']>) => setState(s => ({ ...s, campaignImage: { ...s.campaignImage, ...image } }));
  const updateContentSettings = (settings: Partial<AppState['contentSettings']>) => setState(s => ({ ...s, contentSettings: { ...s.contentSettings, ...settings } }));
  const setGeneratedPosts = (posts: SocialPost[]) => setState(s => ({ ...s, generatedPosts: posts }));
  const setIsLoading = (isLoading: boolean) => setState(s => ({ ...s, isLoading }));
  const setError = (error: string | null) => setState(s => ({ ...s, error }));
  const resetState = () => setState(initialAppState);

  const contextValue = useMemo(() => ({
    ...state, setStep, setTrendingTopic, updateProductDetails, updateCampaignImage,
    updateContentSettings, setGeneratedPosts, setIsLoading, setError, resetState
  }), [state]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};

// --- API HELPERS ---
const generateTrends = async (keyword: string): Promise<Trend[]> => {
  const ai = getAiClient();
  const prompt = `Based on Google Search trends, find 5 trending topics related to "${keyword}". For each topic, provide a title, an estimated search volume (e.g., "170K searches"), and a list of 3 related sub-topics. Format the output as a valid JSON array string. Each object in the array should have keys "title", "searchVolume", and "relatedTopics" (an array of strings). Do not include any other text or markdown formatting.`;
  
  const response = await ai.models.generateContent({
    model: AI_MODEL_TEXT,
    contents: { role: 'user', parts: [{ text: prompt }] },
    config: { tools: [{ googleSearch: {} }] },
  });

  const text = response.text.trim().replace(/^```json\n?/, '').replace(/```$/, '');
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const trends: Trend[] = JSON.parse(text);
  if (sources && trends.length > 0) {
      trends[0].sources = sources;
  }
  return trends;
};

const generateAiDescription = async (details: AppState['productDetails']): Promise<string> => {
    const ai = getAiClient();
    const prompt = `Generate a compelling product description for "${details.productName}".
    - Presentation Style: ${details.presentationStyle}
    - Key Focus Points: ${details.focusPoints.join(', ') || 'None specified'}
    ${details.highlightPrice ? '- Highlight the product\'s price and value.' : ''}
    ${details.includeTestimonials ? '- Incorporate the idea of positive customer testimonials.' : ''}
    ${details.customDescription ? `- Build upon this custom description: "${details.customDescription}"` : ''}
    ${details.productUrl ? `- Product URL for context: ${details.productUrl}` : ''}
    Keep the description concise, engaging, and ready for marketing.`;

    const response = await ai.models.generateContent({
        model: AI_MODEL_TEXT,
        contents: { role: 'user', parts: [{ text: prompt }] },
    });
    return response.text;
};

const generateImage = async (prompt: string): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateImages({
        model: AI_MODEL_IMAGE,
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '1:1' },
    });
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

const generateFinalContent = async (state: AppState): Promise<SocialPost[]> => {
    const ai = getAiClient();
    const { productDetails, contentSettings, trendingTopic } = state;
    const prompt = `
    Generate a set of social media posts for a marketing campaign.

    **Product/Topic Information:**
    - Product Name: ${productDetails.productName}
    - Trending Topic Context: ${trendingTopic || 'None'}
    - Core Description: ${productDetails.aiDescription || productDetails.customDescription}
    - Key Focus Points: ${productDetails.focusPoints.join(', ')}

    **Content Guidelines:**
    - Creativity Level (temperature): ${contentSettings.creativity} (0.0=focused, 1.0=creative)
    - Desired Length: ${contentSettings.contentLength}
    - Tone: ${contentSettings.contentTone}
    - Target Audience: ${contentSettings.targetAudience}
    - Content Goal: ${contentSettings.contentFocus}
    - Call to Action: ${contentSettings.callToAction}

    Based on all this information, create one post for each of these platforms: Twitter, Instagram, Facebook, and TikTok. For TikTok, provide a brief video script idea. Ensure the content is tailored to each platform's style and format.
    `;

    const response = await ai.models.generateContent({
        model: AI_MODEL_TEXT,
        contents: { role: 'user', parts: [{ text: prompt }] },
        config: {
            temperature: contentSettings.creativity,
            responseMimeType: 'application/json',
            responseSchema: socialPostSchema,
        },
    });

    const jsonResponse = JSON.parse(response.text);
    return jsonResponse.posts as SocialPost[];
};


// --- UI COMPONENTS ---
const Stepper = () => {
  const { step } = useAppContext();
  const steps: { id: Step; title: string }[] = [
    { id: 'discover', title: 'Discover Topics' },
    { id: 'details', title: 'Product Details' },
    { id: 'settings', title: 'Content Settings' },
  ];
  const currentStepIndex = steps.findIndex(s => s.id === step) ?? (step === 'results' ? 2 : -1);

  return (
    <div className="flex items-center justify-center gap-8 my-8">
      {steps.map((s, index) => (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${index <= currentStepIndex ? 'bg-brand-accent-cyan border-brand-accent-cyan' : 'border-brand-border'}`}>
              {index < currentStepIndex ? <CheckIcon className="w-6 h-6 text-brand-bg" /> : <SparklesIcon className={`w-6 h-6 ${index <= currentStepIndex ? 'text-brand-bg' : 'text-brand-text-secondary'}`} />}
            </div>
          </div>
          {index < steps.length - 1 && <div className={`h-1 flex-1 rounded-full ${index < currentStepIndex ? 'bg-gradient-to-r from-brand-accent-cyan to-brand-accent-purple' : 'bg-brand-surface-alt'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
};

// --- VIEWS / STEPS ---
const DiscoverTopicsView = () => {
  const { setStep, setTrendingTopic, setIsLoading, setError } = useAppContext();
  const [keyword, setKeyword] = useState('');
  const [trends, setTrends] = useState<Trend[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setIsSearching(true);
    setError(null);
    try {
      const results = await generateTrends(keyword);
      setTrends(results);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch trending topics. The AI may have returned an unexpected format. Please try a different keyword.');
      setTrends([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectTopic = (topic: string) => {
    setTrendingTopic(topic);
    setStep('details');
  };

  const quickSearches = ["Tech Innovations", "Health & Wellness", "Business Tips", "Marketing Trends"];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-text">Discover Trending Topics</h1>
        <p className="text-brand-text-secondary mt-2">Find the perfect trending topic for your campaign.</p>
      </div>

      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="e.g., AI productivity tools, healthy recipes..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="pl-12 h-14 text-lg"
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-text-secondary" />
        <Button variant="primary" onClick={handleSearch} disabled={isSearching} className="absolute right-2 top-1/2 -translate-y-1/2 h-10">
          {isSearching ? <LoadingSpinner /> : 'Search'}
        </Button>
      </div>

      {isSearching && <div className="flex justify-center py-8"><LoadingSpinner /></div>}
      
      {!isSearching && trends.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block p-4 bg-brand-surface-alt rounded-full mb-4">
            <SparklesIcon className="w-10 h-10 text-brand-accent-cyan" />
          </div>
          <h3 className="text-xl font-semibold text-brand-text-primary">Discover Trending Topics</h3>
          <p className="text-brand-text-secondary mt-1">Enter keywords to find the hottest trends and content ideas powered by AI.</p>
          <div className="flex gap-3 justify-center mt-6">
            {quickSearches.map(q => <Button key={q} onClick={() => {setKeyword(q); handleSearch();}}>{q}</Button>)}
          </div>
        </div>
      )}

      {!isSearching && trends.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">{trends.length} results</h3>
          <div className="space-y-3">
            {trends.map((trend, i) => (
              <div key={i} className="bg-brand-surface p-4 rounded-lg border border-brand-border hover:border-brand-accent-cyan transition-colors cursor-pointer" onClick={() => handleSelectTopic(trend.title)}>
                <h4 className="font-bold text-lg text-brand-text-primary">{trend.title}</h4>
                <div className="flex items-center gap-4 text-sm text-brand-text-secondary mt-1">
                  <span>{trend.searchVolume}</span>
                  <span className="text-brand-accent-cyan font-semibold">{`+${trend.relatedTopics.length} related topics`}</span>
                </div>
                {trend.sources && i === 0 && (
                    <div className="mt-2 text-xs text-brand-text-secondary">
                        Sources: {trend.sources.map(s => <a href={s.web.uri} target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-accent-cyan ml-2">{s.web.title}</a>)}
                    </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="primary" className="w-full max-w-xs mx-auto" onClick={() => setStep('details')}>
              Skip and Generate Content Manually &gt;
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductDetailsStep = () => {
  const { 
    productDetails, 
    updateProductDetails, 
    trendingTopic, 
    setStep, 
    setError, 
    campaignImage, 
    updateCampaignImage 
  } = useAppContext();
  
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  React.useEffect(() => {
    if (trendingTopic && !productDetails.productName) {
      updateProductDetails({ productName: trendingTopic });
    }
  }, [trendingTopic, productDetails.productName, updateProductDetails]);

  const handleGenerateDesc = async () => {
    setIsGeneratingDesc(true);
    setError(null);
    try {
        const desc = await generateAiDescription(productDetails);
        updateProductDetails({ aiDescription: desc });
    } catch (e) {
        console.error(e);
        setError("Failed to generate AI description. Please check your API key and try again.");
    } finally {
        setIsGeneratingDesc(false);
    }
  };
  
  const handleGenerateImage = async () => {
    if (!productDetails.productName) {
        setError("Please enter a product name before generating an image.");
        return;
    }
    updateCampaignImage({ generating: true, url: '' });
    setError(null);
    const prompt = `A ${campaignImage.style}, professional campaign image for a product called "${productDetails.productName}". The image should be eye-catching and suitable for social media marketing.`;
    try {
        const imageUrl = await generateImage(prompt);
        updateCampaignImage({ url: imageUrl, prompt });
    } catch (e) {
        console.error(e);
        setError("Failed to generate image. Please check your API key and try again.");
    } finally {
        updateCampaignImage({ generating: false });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <Card>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><SparklesIcon /> Product Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-brand-text-secondary mb-1">Product Name</label>
            <Input value={productDetails.productName} onChange={e => updateProductDetails({ productName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text-secondary mb-1">Product URL (optional)</label>
            <Input value={productDetails.productUrl} onChange={e => updateProductDetails({ productUrl: e.target.value })} />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-brand-text-secondary mb-2">Presentation Style</label>
          <div className="flex flex-wrap gap-2">
            {(['Benefits-focused', 'Feature-focused', 'Story-telling', 'Technical Details'] as PresentationStyle[]).map(style => (
              <ToggleChip key={style} selected={productDetails.presentationStyle === style} onSelected={() => updateProductDetails({ presentationStyle: style })}>{style}</ToggleChip>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-brand-text-secondary mb-2">Focus Points (select multiple)</label>
          <div className="flex flex-wrap gap-2">
            {(['Quality', 'Value', 'Innovation', 'Reliability', 'Sustainability'] as FocusPoint[]).map(point => (
              <ToggleChip key={point} selected={productDetails.focusPoints.includes(point)} onSelected={() => {
                const newPoints = productDetails.focusPoints.includes(point)
                  ? productDetails.focusPoints.filter(p => p !== point)
                  : [...productDetails.focusPoints, point];
                updateProductDetails({ focusPoints: newPoints });
              }}>{point}</ToggleChip>
            ))}
          </div>
        </div>
        <div className="flex gap-6 mt-6">
          <Checkbox label="Highlight Price" checked={productDetails.highlightPrice} onChange={c => updateProductDetails({ highlightPrice: c })} />
          <Checkbox label="Include Testimonials" checked={productDetails.includeTestimonials} onChange={c => updateProductDetails({ includeTestimonials: c })} />
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-brand-text-secondary mb-1">Custom Description (optional)</label>
          <TextArea rows={3} value={productDetails.customDescription} onChange={e => updateProductDetails({ customDescription: e.target.value })} placeholder="Add your own product description..." />
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-brand-text-secondary mb-1">AI-Generated Description</label>
          <div className="relative">
            <TextArea rows={4} value={productDetails.aiDescription} onChange={e => updateProductDetails({ aiDescription: e.target.value })} placeholder="Click 'Generate Description' to create one with AI." className="bg-brand-surface-alt" />
            <Button variant="secondary" onClick={handleGenerateDesc} disabled={isGeneratingDesc} className="absolute bottom-3 right-3">
              {isGeneratingDesc ? <LoadingSpinner /> : <><BotIcon className="w-4 h-4" /> Generate Description</>}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ImageIcon /> Campaign Images</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-brand-text-secondary mb-1">Platform</label>
            <Select value={campaignImage.platform} onChange={e => updateCampaignImage({ platform: e.target.value as SocialPlatform | '' })}>
              <option value="">Select platform</option>
              {(['TikTok', 'Instagram', 'Twitter', 'Facebook'] as SocialPlatform[]).map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text-secondary mb-1">Style</label>
            <Select value={campaignImage.style} onChange={e => updateCampaignImage({ style: e.target.value })}>
              <option>Modern</option><option>Minimalist</option><option>Futuristic</option><option>Vintage</option><option>Playful</option>
            </Select>
          </div>
        </div>
        <Button variant="secondary" className="mt-4" onClick={handleGenerateImage} disabled={campaignImage.generating}>
          {campaignImage.generating ? <LoadingSpinner /> : <><ImageIcon className="w-4 h-4" /> Generate Image</>}
        </Button>
        {campaignImage.generating && <div className="mt-4 flex justify-center"><LoadingSpinner /></div>}
        {campaignImage.url && (
            <div className="mt-4">
                <img src={campaignImage.url} alt="Generated campaign image" className="rounded-lg w-full max-w-sm mx-auto" />
            </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button onClick={() => setStep('discover')}>Back</Button>
        <Button variant="primary" onClick={() => setStep('settings')}>Next: Content Settings</Button>
      </div>
    </div>
  );
};

const ContentSettingsStep = () => {
  const { contentSettings, updateContentSettings, setStep, setIsLoading, setGeneratedPosts, setError } = useAppContext();
  const { creativity, contentLength, contentTone, targetAudience, contentFocus, callToAction } = contentSettings;
  const appState = useAppContext();

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const posts = await generateFinalContent(appState);
        setGeneratedPosts(posts);
        setStep('results');
    } catch (e) {
        console.error(e);
        setError("Failed to generate final content. Please check your settings and API key.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card>
        <h3 className="text-xl font-bold mb-4">Content Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-brand-text-secondary mb-2">Creativity</label>
            <div className="flex items-center gap-4">
              <span className="text-xs text-brand-text-secondary">Focused</span>
              <input type="range" min="0" max="1" step="0.1" value={creativity} onChange={e => updateContentSettings({ creativity: parseFloat(e.target.value) })} className="w-full h-2 bg-brand-surface-alt rounded-lg appearance-none cursor-pointer" />
              <span className="text-xs text-brand-text-secondary">Creative</span>
            </div>
            <div className="text-center mt-1 font-bold text-brand-accent-cyan">{creativity.toFixed(1)}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text-secondary mb-2">Content Length</label>
            <div className="flex flex-wrap gap-2">
              {(['Concise', 'Standard', 'Detailed'] as ContentLength[]).map(l => <ToggleChip key={l} selected={contentLength === l} onSelected={() => updateContentSettings({ contentLength: l })}>{l}</ToggleChip>)}
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <label className="block text-sm font-medium text-brand-text-secondary mb-2">Content Tone</label>
        <div className="flex flex-wrap gap-2">
          {(['Professional', 'Casual', 'Humorous', 'Inspirational', 'Educational'] as ContentTone[]).map(t => <ToggleChip key={t} selected={contentTone === t} onSelected={() => updateContentSettings({ contentTone: t })}>{t}</ToggleChip>)}
        </div>
      </Card>
      <Card>
        <label className="block text-sm font-medium text-brand-text-secondary mb-2">Target Audience</label>
        <div className="flex flex-wrap gap-2">
          {(['General Audience', 'Professionals', 'Entrepreneurs', 'Content Creators', 'Students', 'Tech Enthusiasts'] as TargetAudience[]).map(a => <ToggleChip key={a} selected={targetAudience === a} onSelected={() => updateContentSettings({ targetAudience: a })}>{a}</ToggleChip>)}
        </div>
      </Card>
      <Card>
        <label className="block text-sm font-medium text-brand-text-secondary mb-2">Content Focus</label>
        <div className="flex flex-wrap gap-2">
          {(['Share Information', 'Start Discussion', 'Share Opinion/Take', 'News/Update', 'Tips & Advice', 'Tell a Story'] as ContentFocus[]).map(f => <ToggleChip key={f} selected={contentFocus === f} onSelected={() => updateContentSettings({ contentFocus: f })}>{f}</ToggleChip>)}
        </div>
      </Card>
      <Card>
        <label className="block text-sm font-medium text-brand-text-secondary mb-2">Call to Action</label>
        <div className="flex flex-wrap gap-2">
          {(['Ask for Engagement', 'Encourage Sharing', 'Ask for Comments', 'Ask to Follow', 'Learn More', 'No Specific CTA'] as CallToAction[]).map(cta => <ToggleChip key={cta} selected={callToAction === cta} onSelected={() => updateContentSettings({ callToAction: cta })}>{cta}</ToggleChip>)}
        </div>
      </Card>
      <div className="flex justify-between items-center pt-4">
        <Button onClick={() => setStep('details')}>Back</Button>
        <Button variant="primary" className="w-full max-w-xs" onClick={handleGenerate} disabled={appState.isLoading}>
          {appState.isLoading ? <LoadingSpinner /> : <><SparklesIcon /> Generate Content</>}
        </Button>
      </div>
    </div>
  );
};

const ResultsView = () => {
    const { generatedPosts, campaignImage, resetState, isLoading } = useAppContext();

    const handlePost = (platform: string) => {
        alert(`Posting to ${platform} is a demo feature. In a real app, this would trigger the platform's API.`);
    };

    if (isLoading) {
        return <div className="flex flex-col items-center justify-center text-center h-96">
            <LoadingSpinner />
            <h2 className="text-2xl font-bold mt-4 gradient-text">Generating Your Content...</h2>
            <p className="text-brand-text-secondary mt-2">The AI is working its magic. This might take a moment.</p>
        </div>
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold gradient-text">Your Campaign is Ready!</h1>
                <p className="text-brand-text-secondary mt-2">Here's your AI-generated content, ready to be posted.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {generatedPosts.map((post, index) => (
                        <Card key={index}>
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2 text-xl font-bold text-brand-text-primary">
                                    <SocialIcon platform={post.platform} />
                                    {post.platform}
                                </div>
                                <Button size="sm" onClick={() => handlePost(post.platform)}>Post</Button>
                            </div>
                            <p className="text-brand-text-primary whitespace-pre-wrap mb-3">{post.content}</p>
                            <div className="flex flex-wrap gap-2">
                                {post.hashtags.map((tag, i) => (
                                    <span key={i} className="text-sm text-brand-accent-cyan">#{tag}</span>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
                <div>
                    <Card>
                        <h3 className="text-xl font-bold mb-4">Campaign Image</h3>
                        {campaignImage.url ? (
                            <img src={campaignImage.url} alt="Campaign" className="rounded-lg w-full" />
                        ) : (
                            <div className="h-64 bg-brand-surface-alt rounded-lg flex items-center justify-center text-brand-text-secondary">
                                No image was generated.
                            </div>
                        )}
                    </Card>
                </div>
            </div>
            <div className="text-center pt-4">
                <Button variant="primary" onClick={resetState}>
                    <SparklesIcon /> Create New Campaign
                </Button>
            </div>
        </div>
    );
};


// --- MAIN APP ---
export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-brand-bg text-brand-text-primary p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <header className="text-center mb-4">
            <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
              <span className="p-2 bg-brand-surface-alt rounded-lg"><SparklesIcon className="w-6 h-6 text-brand-accent-cyan" /></span>
              <span>AI Social Content Suite</span>
            </h1>
          </header>
          <MainContent />
        </div>
      </div>
    </AppProvider>
  );
}

const MainContent = () => {
  const { step, error, setError } = useAppContext();

  const renderStep = () => {
    switch (step) {
      case 'discover': return <DiscoverTopicsView />;
      case 'details': return <ProductDetailsStep />;
      case 'settings': return <ContentSettingsStep />;
      case 'results': return <ResultsView />;
      default: return <DiscoverTopicsView />;
    }
  };

  return (
    <main>
      {step !== 'results' && <Stepper />}
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg relative my-4 max-w-3xl mx-auto" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      )}
      {renderStep()}
    </main>
  );
};
