import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        // API routes - never index
        "/api/",
        "/admin/",

        // Authenticated portal pages - never index
        "/dashboard",
        "/campaigns",
        "/analytics",
        "/settings",
        "/social-accounts",
        "/support",
        "/ai-studio",
        "/contentflow",
        "/helix",
        "/search",
        "/onboarding",

        // Auth callback only - login/signup use noindex meta tag instead
        "/oauth-success",

        // Utility/callback pages with dynamic tokens - never index
        "/connect/",
        "/data-deletion-status/",

        // Test/internal pages - never index
        "/test-button",
        "/test-twitter",
        "/test",
        "/clip",
      ],
    },
    sitemap: "https://getxelora.com/sitemap.xml",
  };
}
