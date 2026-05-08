import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

interface Chef {
  id: number;
  name: string;
  avatar: string;
  cuisine: string[];
  experience: number;
  specialty: string[];
  rating: number;
  pricePerSession: number;
  currency: string;
  bio: string;
  completedBookings: number;
}

interface MatchRequest {
  cuisine: string;
  mealType: string;
  guests: string;
  budget: string;
  specialRequest: string;
}

function loadChefs(): Chef[] {
  const filePath = path.join(process.cwd(), "public", "data", "chefs.json");
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

function buildPrompt(chefs: Chef[], request: MatchRequest): string {
  const chefDescriptions = chefs.map(
    (c) =>
      `ID:${c.id} | ${c.name} | Cuisine: ${c.cuisine.join(", ")} | Experience: ${c.experience} yrs | Specialty: ${c.specialty.join(", ")} | Rating: ${c.rating}★ | Price: ৳${c.pricePerSession}/session | Bio: ${c.bio}`
  ).join("\n");

  return `You are a chef matching assistant. Given a customer's request, select the most relevant chefs from the list below.

Customer Request:
- Cuisine Preference: ${request.cuisine}
- Meal Type: ${request.mealType}
- Number of Guests: ${request.guests}
- Budget: ${request.budget} BDT
- Special Request: ${request.specialRequest || "None"}

Available Chefs:
${chefDescriptions}

Return a JSON array of the top 3 most relevant chef IDs sorted by relevance (most relevant first). Include a "matchScore" (0-100) and a brief "matchReason" explaining why each chef is a good fit.

Format:
{"matches":[{"id":1,"matchScore":95,"matchReason":"..."},{"id":2,"matchScore":80,"matchReason":"..."}]}

Return ONLY valid JSON, no markdown, no extra text.`;
}

export async function POST(request: NextRequest) {
  try {
    const body: MatchRequest = await request.json();

    if (!body.cuisine || !body.mealType || !body.guests || !body.budget) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const chefs = loadChefs();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === "your-openai-api-key-here") {
      return NextResponse.json(
        { error: "AI matching service is not configured. Please set a valid OPENAI_API_KEY." },
        { status: 503 }
      );
    }

    try {
      const openai = new OpenAI({ apiKey });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a chef matching assistant. Always return valid JSON." },
          { role: "user", content: buildPrompt(chefs, body) },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        const matches: { id: number; matchScore: number }[] = parsed.matches || [];

        const scoredChefs = matches
          .map((m: { id: number; matchScore: number }) => {
            const chef = chefs.find((c) => c.id === m.id);
            if (!chef) return null;
            return { ...chef, matchScore: m.matchScore };
          })
          .filter((c): c is Chef & { matchScore: number } => c !== null);

        if (scoredChefs.length > 0) {
          return NextResponse.json(scoredChefs);
        }
      }
    } catch {
      return NextResponse.json(
        { error: "AI matching service is temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
