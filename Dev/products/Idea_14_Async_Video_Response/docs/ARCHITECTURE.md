# Technical Architecture - ReplyClip

## Data Flow
```
[Browser Recording] → [Upload to S3] → [FFmpeg Processing] → [CDN Distribution]
                                              ↓
[Video Player] ← [Thread API] ← [PostgreSQL] ← [Deepgram Transcription]
                                                      ↓
                                              [Claude Summary]
```

## Core Entities
- Thread (id, title, participants, created_at)
- Video (id, thread_id, author_id, s3_key, duration, transcript)
- Reply (id, video_id, parent_video_id, timestamp_ref)
