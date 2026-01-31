/**
 * Viral Benchmarks Library
 *
 * NOTE: This file is server-only. Do not import in client components.
 * Uses server-side Supabase client for database queries.
 */

import { createClient } from '@/lib/supabase/server';

export interface ViralBenchmark {
  id: string;
  title: string;
  score: number;
  url: string;
  similarity?: number;
}

/**
 * Finds proven viral hooks from our benchmark database that are semantically similar
 * to the user's current draft.
 * 
 * Uses full-text search (or vector search if enabled later) to find matches.
 */
export async function findSimilarViralHooks(topic: string, limit: number = 3): Promise<ViralBenchmark[]> {
  const supabase = await createClient();
  
  // Clean the topic for text search
  const cleanTerm = topic.replace(/[^\w\s]/g, '').trim().split(/\s+/).join(' | ');

  // Query the benchmark table
  // Note: Using simple text search for V1. Vector embeddings would be the V2 upgrade.
  const { data, error } = await supabase
    .from('viral_content_training')
    .select('id, title, score, url')
    .textSearch('title', cleanTerm)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching viral benchmarks:', error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    title: item.title,
    score: item.score,
    url: item.url
  }));
}

/**
 * Validates if a hook structure is "Proven" by checking against our database.
 * Returns a score boost (0-100) if a high-performing match exists.
 */
export async function getBenchmarkScore(title: string): Promise<number> {
  const benchmarks = await findSimilarViralHooks(title, 5);
  
  if (benchmarks.length === 0) return 0;
  
  // Calculate a "Confidence Score"
  // If we have highly upvoted posts (score > 1000) that match the keyword,
  // we are confident this TOPIC is viral.
  const maxScore = Math.max(...benchmarks.map(b => b.score));
  
  if (maxScore > 10000) return 20; // Massive hit exists
  if (maxScore > 1000) return 10; // Proven hit exists
  return 5; // Some traction exists
}
