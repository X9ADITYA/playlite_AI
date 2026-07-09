# PlayLite AI

PlayLite AI is a production-oriented Next.js video learning platform with authentication, video uploads, AI summaries, transcript Q&A, recommendations, and learning tools.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- MongoDB with Mongoose
- JWT auth
- OpenAI integrations for summarization, Q&A, learning assets, search, translation, and creator tools
- Cloudinary or local fallback storage

## Setup

1. Copy `.env.example` to `.env.local` and fill in the values.
2. Install dependencies.
3. Start MongoDB locally or point `MONGODB_URI` at a managed cluster.
4. Run the app.

```bash
npm install
npm run dev
```

## Required Environment Variables

- `MONGODB_URI`
- `JWT_SECRET`
- `OPENAI_API_KEY` for live AI responses
- `CLOUDINARY_*` for production video storage

## Core API

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/video/upload`
- `GET /api/video/:id`
- `POST /api/video/:id/watch`
- `GET /api/videos`
- `POST /api/ai/summarize`
- `POST /api/ai/ask`
- `GET /api/recommendations`

## Advanced API

- `POST /api/ai/search`
- `POST /api/ai/learn`
- `POST /api/ai/translate`
- `POST /api/ai/creator-tools`

## Notes

- The app uses Cloudinary when configured and falls back to local file storage for development.
- AI features gracefully degrade to deterministic heuristics if the OpenAI key is missing.
- Recommendations use watch history, profile preferences, and tag overlap scoring.