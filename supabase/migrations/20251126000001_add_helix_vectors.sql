BEGIN;

-- 1) Ensure vector extension exists
CREATE EXTENSION IF NOT EXISTS vector;

-- 2) Add embedding column (768 dims) to helix_knowledge_base if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS ( 
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'helix_knowledge_base' 
    AND column_name = 'embedding' 
  ) THEN 
    ALTER TABLE public.helix_knowledge_base ADD COLUMN embedding vector(768); 
  END IF; 
END;
$$;

-- 3) Create HNSW index on embedding using cosine (vector_cosine_ops)
DO $$ 
BEGIN 
  IF NOT EXISTS ( 
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE c.relname = 'idx_helix_kb_embedding_hnsw' 
    AND n.nspname = 'public' 
  ) THEN 
    CREATE INDEX idx_helix_kb_embedding_hnsw 
    ON public.helix_knowledge_base USING hnsw (embedding vector_cosine_ops) 
    WITH (m = 16, ef_construction = 200); 
  END IF; 
END;
$$;

-- 4) Create a search function to match a query embedding to the KB (cosine)
-- Returns id, user_id, content_text, content_type, token_count, metadata, embedding, similarity
CREATE OR REPLACE FUNCTION public.match_knowledge_base(query_embedding vector(768), limit_rows integer DEFAULT 5) 
RETURNS TABLE ( 
  id UUID, 
  user_id UUID, 
  content_text TEXT, 
  content_type TEXT, 
  token_count INT, 
  metadata JSONB, 
  embedding vector(768), 
  similarity DOUBLE PRECISION 
) 
LANGUAGE sql STABLE 
AS $$ 
  SELECT 
    id, 
    user_id, 
    content_text, 
    content_type, 
    token_count, 
    metadata, 
    embedding, 
    1 - (embedding <=> query_embedding) AS similarity 
  FROM public.helix_knowledge_base 
  WHERE embedding IS NOT NULL 
  ORDER BY embedding <=> query_embedding 
  LIMIT limit_rows;
$$;

COMMIT;
