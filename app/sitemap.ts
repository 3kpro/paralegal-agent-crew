import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://getxelora.com";
  const lastModified = new Date();

  return [
    // Homepage (highest priority)
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    // Free wedge — high conversion page
    {
      url: `${baseUrl}/try`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    // Main public pages
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/demo`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/trend-gen`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    // Legal pages
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    // Utility pages (lower priority, but should be indexed)
    {
      url: `${baseUrl}/forgot-password`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/reset-password`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
