# AI Integration Setup

This project uses a combination of Google's Gemini and OpenRouter for AI text generation. This hybrid approach helps manage costs while maintaining high-quality outputs.

## Setup Instructions

1. Get your API keys:

   - Gemini API key: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - OpenRouter API key: Visit [OpenRouter](https://openrouter.ai/keys)

2. Configure your environment:
   - Copy `.env.local.example` to `.env.local`
   - Add your API keys to `.env.local`:
     ```
     GEMINI_API_KEY=your-gemini-api-key
     OPENROUTER_API_KEY=your-openrouter-api-key
     ```

## How it Works

The system alternates between Gemini and OpenRouter to optimize for both cost and quality:

- Gemini: Used for every third request (33% of requests)
- OpenRouter: Used for remaining requests (67% of requests)

### OpenRouter Models Used

We use the following models through OpenRouter:

1. mistralai/mistral-7b-instruct (primary)
2. gryphe/mythomist-7b (fallback)
3. nousresearch/nous-hermes-llama2-13b (fallback)

These models were chosen for their excellent performance/cost ratio.

## Monitoring Usage

The API response includes a `provider` field indicating which service was used:

```json
{
  "success": true,
  "description": "Generated text...",
  "provider": "gemini" // or "openrouter"
}
```
