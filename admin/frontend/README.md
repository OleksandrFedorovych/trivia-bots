# Trivia Bots Admin Frontend

Next.js admin dashboard for managing Trivia Bots.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (create `.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## Deployment to Render.com

1. **Create a Web Service** in Render Dashboard (Next.js requires SSR)
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`
4. **Environment Variables**: Set in Render Dashboard
   - `NEXT_PUBLIC_API_URL` - Your backend API URL (e.g., `https://your-backend.onrender.com/api`)
   - `NODE_ENV=production`
   - `PORT` (automatically provided by Render)

**Note**: Next.js on Render runs as a Web Service (not Static Site) because it supports Server-Side Rendering.

## Project Structure

```
admin/frontend/
├── app/             # Next.js app directory
├── components/      # React components
├── public/          # Static assets
└── package.json     # Dependencies and scripts
```
