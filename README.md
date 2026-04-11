# AdsLab Buyer Persona

Advanced AI-powered marketing strategy engine for niche analysis and buyer persona generation.

## Deployment on Vercel

1. **Push to GitHub**: Push this repository to your GitHub account.
2. **Import to Vercel**: Create a new project in Vercel and import your repository.
3. **Environment Variables**: Add the following environment variable in the Vercel project settings:
   - `VITE_GEMINI_API_KEY`: Your Google Gemini API Key.
4. **Build Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

## Local Development

1. Install dependencies: `npm install`
2. Create a `.env` file and add `VITE_GEMINI_API_KEY=your_key_here`
3. Start dev server: `npm run dev`
