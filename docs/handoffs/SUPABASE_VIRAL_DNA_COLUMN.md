# HANDOFF — Supabase: Add "Viral DNA" Column

## Application Context
We are implementing a "Viral DNA" feature where we use Google Vertex AI to analyze our scraped viral headlines and extract psychometric data (Hook Type, Emotion, Reading Level). 

To store this rich metadata, we need a new `JSONB` column on our existing training table.

## Action Required
Please execute the following SQL in the Supabase SQL Editor to schema update the `viral_content_training` table.

### SQL Command
```sql
-- Add viral_dna column to store Vertex AI psychometrics
ALTER TABLE viral_content_training 
ADD COLUMN IF NOT EXISTS viral_dna JSONB;

-- Comment for documentation
COMMENT ON COLUMN viral_content_training.viral_dna IS 'Stores psychometric analysis (Hook, Emotion, Logic) from Vertex AI';
```

## Verification
After running the SQL, you should be able to query the table and see the new column (currently null for all rows).

## Next Steps (After this is applied)
Once this column exists, we will run the `scripts/enrich-viral-data-vertex.ts` script to start processing the backlog and burning those free Google Cloud credits before they expire.
