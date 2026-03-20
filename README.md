# DXR Guideline Matcher

Maps DXR issues to SAP Fiori Design Guidelines. No API keys, no accounts, no cost.

## How it works

1. Panelist pastes a DXR issue description (Problem / Impact / Recommendation)
2. The engine extracts keywords, expands synonyms (DXR vocabulary → Fiori vocabulary), and scores all 524 guideline entries
3. Results are ranked using IDF-weighted scoring, bigram matching, and synonym expansion
4. Returns the top 10 matching guidelines with direct URLs

The matcher ignores DXR dimension tags entirely. It searches the full Fiori guidelines corpus every time, so cross-dimensional matches surface naturally.

## Deploy to Vercel

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "initial"
gh repo create dxr-guideline-matcher --public --push

# 2. Import at vercel.com and deploy
# No environment variables needed
```

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Updating the corpus

1. Open `https://main--builder-prospect--sapudex.aem.live/design-system/fiori-design-web/query-index.json?limit=10000`
2. Save the JSON file
3. Run the deduplication script (ask João or check the Claude project)
4. Replace `public/fiori-corpus.json`
5. Redeploy

## Stack

- Next.js 14 (App Router)
- Pure client-side matching (no server, no API keys)
- Vercel for hosting
