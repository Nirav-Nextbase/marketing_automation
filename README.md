# Marketing Image Generation Platform

Web-based workflow for reconstructing detailed prompts from marketing imagery, applying creative edits, and producing updated renders via Vertex AI Gemini.

## Project Structure

- `backend/`: Node + Express orchestration API
- `frontend/`: Next.js React UI

## Prerequisites

- Node.js 20+
- Access to OpenAI API key (`OPENAI_API_KEY`)
- Google Cloud service account JSON for Vertex AI Gemini
- Cloudflare R2 / S3-compatible bucket credentials

## Environment Configuration

### Backend

1. Copy `backend/env.template` to `backend/.env` and fill in:
   - `OPENAI_API_KEY` – GPT for both prompt steps
   - `SYSTEM_PROMPT_IMAGE_UNDERSTAND` / `SYSTEM_PROMPT_PROMPT_EDITOR` – defaults prefilled
   - `S3_*` values – Cloudflare R2 bucket + public URL base
   - `GOOGLE_*` variables – Vertex AI project + `GOOGLE_APPLICATION_CREDENTIALS` pointing to the provided JSON file
   - `FAL_API_KEY` – enables automatic fallback to fal.ai when Vertex AI hits quota limits
2. Store the service-account JSON (`nano-banana-472210-869a1d498240.json`) inside `backend/` or supply an absolute path.

### Frontend

1. Copy `frontend/env.local.template` to `frontend/.env.local`.
2. Set `NEXT_PUBLIC_BACKEND_URL` to the reachable URL for the Express server (default `http://localhost:4000`).
3. The UI now exposes an aspect ratio selector; the chosen value is forwarded to fal.ai whenever the backend activates the fallback provider.

## Running Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

This starts the Express API on `PORT` (default 4000) with:

1. `/api/image-flow` – multipart endpoint orchestrating the entire pipeline
2. `/health` – readiness probe

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Next.js will proxy `/api/image-flow` requests to the backend via `NEXT_PUBLIC_BACKEND_URL`.

## Testing

### Backend Unit Tests

```bash
cd backend
npm run test
```

Vitest suites cover:

- `promptService` – GPT prompt reconstruction and editing helpers
- `geminiService` – Vertex AI response parsing
- `storageService` – S3 uploads + public URL composition

### Frontend Lint

```bash
cd frontend
npm run lint
```

## API Flow Summary

1. Uploads base image + optional reference images via Multer (memory storage).
2. Files stored in R2 via `storageService`.
3. GPT stage 1 (`systemprompt1`) → `prompt1`.
4. GPT stage 2 (`systemprompt2` + user instructions + references) → `prompt2`.
5. Vertex AI Gemini generates image using `prompt2` (auto-falling back to fal.ai Gemini 2.5 Flash Image whenever Vertex AI returns `RESOURCE_EXHAUSTED`). The chosen aspect ratio is forwarded to both providers, with a graceful fallback to `1:1` if a provider rejects the request.
6. Output stored in R2 and returned with prompt metadata + all asset URLs.

## Security Notes

- Never commit `.env` files or service-account JSON.
- Ensure HTTPS termination when deploying backend/frontend.
- Rotate S3 credentials periodically and scope to required buckets only.

