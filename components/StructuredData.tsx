/**
 * JSON-LD Structured Data for SEO
 * Helps search engines understand the product and display rich results
 */

export function StructuredData() {
  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "XELORA",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Content Marketing Software",
    "operatingSystem": "Web Browser",
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Plan",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "Pro Plan",
        "price": "29.99",
        "priceCurrency": "USD",
        "priceValidUntil": "2025-12-31",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "Premium Plan",
        "price": "79.99",
        "priceCurrency": "USD",
        "priceValidUntil": "2025-12-31",
        "availability": "https://schema.org/InStock"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "340",
      "bestRating": "5",
      "worstRating": "1"
    },
    "description": "AI-powered viral content prediction tool with 87% accuracy. Analyzes 1M+ viral posts to predict performance before you create content. Multi-platform content generation for social media marketing.",
    "featureList": [
      "Viral Score Prediction (87% accuracy)",
      "AI Content Generation",
      "Multi-Platform Optimization",
      "Trend Detection",
      "Real-Time Analytics",
      "Campaign Scheduling"
    ],
    "screenshot": "https://trendpulse.3kpro.services/og-image.png",
    "url": "https://trendpulse.3kpro.services",
    "creator": {
      "@type": "Organization",
      "name": "3K Pro Services",
      "url": "https://trendpulse.3kpro.services"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "3K Pro Services",
    "url": "https://trendpulse.3kpro.services",
    "logo": "https://trendpulse.3kpro.services/logo.png",
    "description": "AI-powered content marketing tools for creators and businesses. XELORA predicts viral content with 87% accuracy.",
    "sameAs": [
      "https://twitter.com/3kproservices",
      "https://linkedin.com/company/3kproservices"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "james.lawson@gmail.com"
    }
  };

  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "XELORA",
    "url": "https://trendpulse.3kpro.services",
    "description": "Predict viral content performance before creating it. AI analyzes 1M+ viral posts for accurate engagement predictions.",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "operatingSystem": "Any",
    "applicationCategory": "Marketing Software",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "0",
      "highPrice": "79.99",
      "priceCurrency": "USD",
      "offerCount": "3"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is XELORA?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "XELORA is an AI-powered tool that predicts viral content performance before you create it. Our Viral Score system analyzes 1M+ viral posts to give you a 0-100 score with 87% accuracy, helping you eliminate wasted time on content that flops."
        }
      },
      {
        "@type": "Question",
        "name": "How accurate is the Viral Score?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Viral Score has 87% accuracy based on testing against 50,000+ real posts. It combines data analysis (volume, multi-source validation, freshness) with AI content scoring (hook quality, emotional triggers, value proposition)."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need API keys to use XELORA?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. All new users automatically use our global API keys for campaign generation. There's no setup required - just sign up and start creating viral content immediately."
        }
      },
      {
        "@type": "Question",
        "name": "What platforms does XELORA support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "XELORA generates platform-optimized content for Twitter, LinkedIn, Instagram, Facebook, Reddit, and TikTok. Each platform gets content optimized for its specific format, character limits, and engagement patterns."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
