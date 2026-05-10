import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import chefsData from "@/../public/data/chefs.json";
import promptData from "@/../public/data/prompt.json";

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

const chefs = chefsData as Chef[];
const prompt = promptData as { system: string; user: string };

export async function POST(request: NextRequest) {
  try {
    const body: MatchRequest = await request.json();

    if (!body.cuisine || !body.mealType || !body.guests || !body.budget) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI matching service is not configured. Please set a valid GEMINI_API_KEY." },
        { status: 503 }
      );
    }

    try {
      const openai = new OpenAI({
        apiKey,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      });

      const chefDescriptions = chefs.map(
        (c) =>
          `ID:${c.id} | ${c.name} | Cuisine: ${c.cuisine.join(", ")} | Experience: ${c.experience} yrs | Specialty: ${c.specialty.join(", ")} | Rating: ${c.rating}★ | Price: ${c.currency}${c.pricePerSession}/session | Bio: ${c.bio.replace(/[|"\\\n\r]/g, " ").trim()}`
      ).join("\n");

      const userMessage = prompt.user
        .replace("{{cuisine}}", body.cuisine)
        .replace("{{mealType}}", body.mealType)
        .replace("{{guests}}", body.guests)
        .replace("{{budget}}", body.budget)
        .replace("{{specialRequest}}", body.specialRequest || "None")
        .replace("{{chefs}}", chefDescriptions);

      let completion: OpenAI.Chat.Completions.ChatCompletion | null = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          completion = await openai.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
              { role: "system", content: prompt.system },
              { role: "user", content: userMessage },
            ],
            temperature: 0.3,
          });
          break;
        } catch (e) {
          if (attempt === 3 || !(e instanceof Error && e.message.includes("429"))) throw e;
          await new Promise((r) => setTimeout(r, attempt * 2000));
        }
      }

      if (!completion) {
        return NextResponse.json(
          { error: "AI matching service is temporarily unavailable. Please try again later." },
          { status: 503 }
        );
      }

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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Gemini API error:", message);
      const isRateLimit = message.includes("429");
      return NextResponse.json(
        { error: isRateLimit ? "Too many requests. Please wait a moment and try again." : `AI service error: ${message}` },
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
