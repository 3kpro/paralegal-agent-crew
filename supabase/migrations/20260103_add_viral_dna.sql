
-- Add viral_dna column to store Vertex AI psychometrics
ALTER TABLE viral_content_training 
ADD COLUMN IF NOT EXISTS viral_dna JSONB;
