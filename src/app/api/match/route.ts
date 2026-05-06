import { NextRequest, NextResponse } from "next/server";
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

function parseBudgetRange(budget: string): [number, number] {
  const ranges: Record<string, [number, number]> = {
    "500-1000": [500, 1000],
    "1000-2000": [1000, 2000],
    "2000-5000": [2000, 5000],
    "5000+": [5000, 99999],
  };
  return ranges[budget] || [0, 99999];
}

function parseGuestCount(guests: string): [number, number] {
  const ranges: Record<string, [number, number]> = {
    "1-5": [1, 5],
    "6-15": [6, 15],
    "16-30": [16, 30],
    "30+": [30, 999],
  };
  return ranges[guests] || [1, 999];
}

function scoreChef(chef: Chef, request: MatchRequest): number {
  let score = 0;

  const cuisineMatch = chef.cuisine.some((c) =>
    c.toLowerCase().includes(request.cuisine.toLowerCase())
  );
  if (cuisineMatch) score += 40;

  const [minBudget, maxBudget] = parseBudgetRange(request.budget);
  if (chef.pricePerSession >= minBudget && chef.pricePerSession <= maxBudget) {
    score += 25;
  } else if (chef.pricePerSession < minBudget) {
    score += 10;
  }

  const [minGuests, maxGuests] = parseGuestCount(request.guests);
  const guestRange = maxGuests - minGuests;
  if (guestRange < 10 && chef.completedBookings > 100) score += 15;
  if (guestRange >= 20 && chef.specialty.some((s) =>
    s.toLowerCase().includes("large") || s.toLowerCase().includes("party") || s.toLowerCase().includes("catering")
  )) {
    score += 20;
  }

  if (request.specialRequest) {
    const lower = request.specialRequest.toLowerCase();
    chef.specialty.forEach((s) => {
      if (lower.includes(s.toLowerCase())) score += 15;
    });
    if (chef.bio.toLowerCase().includes(lower.split(" ")[0])) score += 10;
  }

  if (request.mealType.toLowerCase().includes("party") || request.mealType.toLowerCase().includes("catering")) {
    if (chef.specialty.some((s) =>
      s.toLowerCase().includes("party") || s.toLowerCase().includes("catering") || s.toLowerCase().includes("event")
    )) {
      score += 15;
    }
  }

  score += chef.rating * 2;

  return score;
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

    const scored = chefs.map((chef) => ({
      ...chef,
      matchScore: scoreChef(chef, body),
    }));

    const sorted = scored.sort((a, b) => b.matchScore - a.matchScore);
    return NextResponse.json(sorted.slice(0, 3));
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
