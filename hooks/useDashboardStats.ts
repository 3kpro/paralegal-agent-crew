import { useState, useEffect } from "react";

export interface DashboardStats {
  user: {
    id: string;
    full_name: string;
    subscription_tier: string;
    created_at: string;
    days_active: number;
  };
  stats: {
    campaigns_created: number;
    campaigns_created_trend: string | null;
    content_generated: number;
    platforms_connected: number;
    platforms: string[];
    total_viral_score: number | null;
    avg_viral_score: number | null;
  };
  progress: {
    first_campaign_created: boolean;
    first_content_generated: boolean;
    first_platform_connected: boolean;
    first_publish: boolean;
  };
  quick_wins: string[];
}

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/stats");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const stats = await response.json();
      setData(stats);
    } catch (err: any) {
      console.error("Failed to fetch dashboard stats:", err);
      setError(err.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { data, loading, error, refetch: fetchStats };
}
