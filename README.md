# ChefFind

**AI-Powered Chef Matching Platform**

ChefFind is a simple web page that connects you with verified personal chefs for home dining experiences. Whether someone craving authentic Bengali fish curries, handmade Italian pasta, slow-smoked BBQ, or a Michelin-star fine dining experience ChefFind will make it more easier than before. ChefFind matches you with the perfect chef based on your cuisine preferences, dietary needs, budget, and occasion.

## Features

- **10 Sample Chefs** — Diverse global cuisines and specialized dietary expertise for complex matching
- **AI Matching** — Gemini-powered matching ranks chefs by cuisine fit, budget, guest count, and special requests
- **Persistent Preferences** — Default selections saved in LocalStorage for faster repeat searches
- **Search History** — Quick access to past searches with one-click re-use
- **Favorites System** — Save and manage your favorite chefs across sessions
- **Diverse Cuisines** — Bengali, Chinese, Italian, Continental, BBQ.
- **Flexible Pricing** — Options ranging from budget friendly family meals (৳500) to premium fine dining (৳10,000)
- **Responsive Design** — Mobile-first UI with safe-area support for notched phones
- **Modern UI** — Clean interface built with Next.js and Tailwind CSS

## Tech Stack

- Next.js 16 — React framework (App Router)
- Tailwind CSS 4 — Utility-first styling
- TypeScript — Type safety
- ESLint — Code quality
- Geist Font — Typography
- [Google Gemini API](https://ai.google.dev) — AI-powered chef matching (via OpenAI-compatible endpoint)

## Project Structure

```
chef-find/
├── src/
│   ├── app/
│   │   ├── api/match/route.ts   # Chef matching API endpoint
│   │   ├── layout.tsx            # Root layout with metadata
│   │   ├── page.tsx              # Home page
│   │   └── globals.css           # Global styles & Tailwind config
│   ├── components/
│   │   ├── ChefCard.tsx          # Individual chef display card with favorites
│   │   ├── ChefForm.tsx          # Search form with preferences & history
│   │   └── MatchResults.tsx      # Results grid with loading states
│   ├── data/
│   │   └── chefs.ts              # TypeScript Chef interface (types only)
│   └── lib/
│       └── storage.ts            # LocalStorage utilities for preferences, history, favorites
├── public/
│   └── data/
│       ├── chefs.json            # Chef data (10 chefs, editable without code changes)
│       └── prompt.json           # Gemini prompt templates for chef matching
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json
└── README.md
```

## Data Layer

### Chef Data (JSON)
Chef data is stored in `public/data/chefs.json` instead of being hardcoded in TypeScript. This allows:
- Easy updates without rebuilding the application
- Anyone can edit the chef list
- Clean separation of data and logic

To add or modify chefs, edit `public/data/chefs.json` directly.

### Prompt Template (JSON)
The Gemini prompt used for chef matching is stored in `public/data/prompt.json`. It contains two templates:

| Field   | Description |
| ------- | ----------- |
| `system` | System instruction setting the AI's role as a chef matching assistant |
| `user`   | User message template with placeholders (`{{cuisine}}`, `{{mealType}}`, `{{guests}}`, `{{budget}}`, `{{specialRequest}}`, `{{chefs}}`) |

You can customize the matching behavior by editing this file — modify scoring criteria, output format, or tone without changing code.

### LocalStorage (`src/lib/storage.ts`)
Client side persistence for user specific data:

| Feature            | Storage Key                | Description                              |
| ------------------ | -------------------------- | ---------------------------------------- |
| Preferences        | `cheffind_preferences`     | Default cuisine, meal type, guests, budget |
| Search History     | `cheffind_search_history`  | Last 20 searches with timestamps         |
| Favorites          | `cheffind_favorites`       | Array of favorite chef IDs               |

#### API

```ts
import { getPreferences, savePreferences, addToSearchHistory, getSearchHistory, toggleFavorite, isFavorite, getFavorites } from "@/lib/storage";

// Save user preferences
savePreferences({ defaultCuisine: "Italian", defaultBudget: "2000-5000" });

// Get preferences (loads saved defaults)
const prefs = getPreferences();

// Add search to history
addToSearchHistory({ cuisine: "Italian", mealType: "Dinner", guests: "1-5", budget: "2000-5000", specialRequest: "", resultIds: [1, 2, 3] });

// Get search history (last 20)
const history = getSearchHistory();

// Toggle favorite chef
const isNowFav = toggleFavorite(5); // true = added, false = removed

// Check if chef is favorited
const fav = isFavorite(5);

// Get all favorite chef IDs
const favIds = getFavorites();
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Environment Variables

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get a free API key at [Google AI Studio](https://aistudio.google.com/apikey).

### Installation

1. Clone the repository and navigate to the project directory:

```bash
cd chef-find
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command        | Description                  |
| -------------- | ---------------------------- |
| `npm run dev`  | Start development server     |
| `npm run build`| Build for production         |
| `npm run start`| Start production server      |
| `npm run lint` | Run ESLint                   |

## How Matching Works

The `/api/match` endpoint uses **Google Gemini** (via the OpenAI-compatible SDK) to intelligently match chefs:

1. Sends the user's request (cuisine, meal type, guests, budget, special requests) along with all available chef profiles to Gemini
2. Gemini evaluates each chef based on cuisine match, budget fit, specialty alignment, rating, and experience
3. Returns the top 3 most relevant chefs with a match score (0–100) and a brief reason for each recommendation

## API Reference

### `POST /api/match`

Find matching chefs based on user preferences.

**Request Body:**

```json
{
  "cuisine": "Bengali",
  "mealType": "Dinner",
  "guests": "1-5",
  "budget": "1000-2000",
  "specialRequest": "Birthday dinner, no beef"
}
```

**Response:**

```json
[
  {
    "id": 1,
    "name": "Rina Das",
    "avatar": "👩‍🍳",
    "cuisine": ["Bengali"],
    "experience": 8,
    "specialty": ["Traditional Bengali", "Fish Curries", "Festival Feasts"],
    "rating": 4.9,
    "pricePerSession": 1500,
    "bio": "Born in Kolkata...",
    "completedBookings": 142,
    "matchScore": 98,
    "matchReason": "Expert in traditional Bengali cuisine with extensive experience in fish curries and festival feasts."
  }
]
```

**Error Responses:**

| Status | Description |
| ------ | ----------- |
| `400`  | Missing required fields |
| `503`  | AI service unavailable (rate limit or API key issue) |
| `500`  | Internal server error |

## Deployment

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new):

```bash
npm run build
```

## License

MIT
