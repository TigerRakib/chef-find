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

interface PromptTemplate {
  system: string;
  user: string;
}

function loadChefs(): Chef[] {
  const filePath = path.join(process.cwd(), "public", "data", "chefs.json");
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

function loadPrompt(): PromptTemplate {
  const filePath = path.join(process.cwd(), "public", "data", "prompt.json");
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

const prompt = loadPrompt();

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

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: userMessage },
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
