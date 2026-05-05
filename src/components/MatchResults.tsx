"use client";

import { useState, useEffect } from "react";
import { Chef } from "@/data/chefs";
import { ChefCard } from "./ChefCard";
import { getFavorites } from "@/lib/storage";

interface MatchResultsProps {
  results: Chef[];
  loading: boolean;
  hasSearched: boolean;
}

export function MatchResults({ results, loading, hasSearched }: MatchResultsProps) {
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  if (loading) {
    return (
      <div className="mt-10 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 text-gray-500">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium">AI is finding your perfect match...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="h-24 sm:h-28 bg-gray-100 animate-pulse" />
              <div className="p-5 space-y-4">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-32 animate-pulse" />
                  </div>
                  <div className="h-7 bg-gray-100 rounded-full w-14 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-full animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-100 rounded-full w-16 animate-pulse" />
                  <div className="h-6 bg-gray-100 rounded-full w-20 animate-pulse" />
                </div>
                <div className="h-10 bg-gray-900 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hasSearched) return null;

  if (results.length === 0) {
    return (
      <div className="mt-10 text-center py-12">
        <div className="text-4xl mb-3">🥘</div>
        <h3 className="text-lg font-semibold text-gray-900">No matches found</h3>
        <p className="text-gray-500 text-sm mt-1">Try adjusting your preferences.</p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Top {results.length} Matches
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Based on your preferences, here are your best options
        </p>
        {favorites.length > 0 && (
          <p className="text-xs text-amber-600 mt-1">
            {favorites.length} chef{favorites.length > 1 ? "s" : ""} in favorites
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {results.map((chef, index) => (
          <ChefCard key={chef.id} chef={chef} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}
