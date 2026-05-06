"use client";

import { useState, useEffect } from "react";
import { Chef } from "@/data/chefs";
import { MatchResults } from "@/components/MatchResults";
import { savePreferences, addToSearchHistory, getSearchHistory, SearchHistory, getPreferences } from "@/lib/storage";

interface FormData {
  cuisine: string;
  mealType: string;
  guests: string;
  budget: string;
  specialRequest: string;
}

const defaultFormData: FormData = {
  cuisine: "",
  mealType: "",
  guests: "",
  budget: "",
  specialRequest: "",
};

export function ChefForm() {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [results, setResults] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const prefs = getPreferences();
    setFormData((prev) => ({
      cuisine: prefs.defaultCuisine || prev.cuisine,
      mealType: prefs.defaultMealType || prev.mealType,
      guests: prefs.defaultGuests || prev.guests,
      budget: prefs.defaultBudget || prev.budget,
      specialRequest: prev.specialRequest,
    }));
    setHistory(getSearchHistory());
    setHydrated(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setHasSearched(true);

    if (!formData.cuisine || !formData.mealType || !formData.guests || !formData.budget) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to find matching chefs. Please try again.");
      }

      const data = await response.json();
      setResults(data);

      savePreferences({
        defaultCuisine: formData.cuisine,
        defaultMealType: formData.mealType,
        defaultGuests: formData.guests,
        defaultBudget: formData.budget,
      });

      addToSearchHistory({
        cuisine: formData.cuisine,
        mealType: formData.mealType,
        guests: formData.guests,
        budget: formData.budget,
        specialRequest: formData.specialRequest,
        resultIds: data.map((c: Chef) => c.id),
      });

      setHistory(getSearchHistory());
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(defaultFormData);
    setResults([]);
    setError(null);
    setHasSearched(false);
  };

  const handleHistoryClick = (search: SearchHistory) => {
    setFormData({
      cuisine: search.cuisine,
      mealType: search.mealType,
      guests: search.guests,
      budget: search.budget,
      specialRequest: search.specialRequest,
    });
    setShowHistory(false);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Find Your Perfect <span className="text-amber-600">Chef</span>
        </h1>
        <p className="mt-2 text-gray-500 text-sm sm:text-base">
          Tell us what you need and we&apos;ll match you with the best home chef.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cuisine" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Cuisine Preference <span className="text-red-500">*</span>
            </label>
            <select
              id="cuisine"
              name="cuisine"
              value={formData.cuisine}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition text-base"
              required
            >
              <option value="" disabled>Select cuisine</option>
              <option value="Bengali">Bengali</option>
              <option value="Chinese">Chinese</option>
              <option value="Italian">Italian</option>
              <option value="Continental">Continental</option>
              <option value="BBQ">BBQ</option>
            </select>
          </div>

          <div>
            <label htmlFor="mealType" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Meal Type <span className="text-red-500">*</span>
            </label>
            <select
              id="mealType"
              name="mealType"
              value={formData.mealType}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition text-base"
              required
            >
              <option value="" disabled>Select meal type</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Party catering">Party Catering</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="guests" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Number of Guests <span className="text-red-500">*</span>
            </label>
            <select
              id="guests"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition text-base"
              required
            >
              <option value="" disabled>Select guests</option>
              <option value="1-5">1–5</option>
              <option value="6-15">6–15</option>
              <option value="16-30">16–30</option>
              <option value="30+">30+</option>
            </select>
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Budget per Session <span className="text-red-500">*</span>
            </label>
            <select
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition text-base"
              required
            >
              <option value="" disabled>Select budget</option>
              <option value="500-1000">500-1000 BDT</option>
              <option value="1000-2000">1000-2000 BDT</option>
              <option value="2000-5000">2000-5000 BDT</option>
              <option value="5000+">5000+ BDT</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="specialRequest" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Special Request
          </label>
          <textarea
            id="specialRequest"
            name="specialRequest"
            value={formData.specialRequest}
            onChange={handleChange}
            rows={3}
            placeholder='e.g. "Birthday dinner, no beef"'
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition text-base resize-none"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:bg-amber-300 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-amber-600/25 transition-all duration-200 text-base min-h-[48px]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Finding Chefs...
              </span>
            ) : (
              "Find Chefs"
            )}
          </button>
          {hydrated && history.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="px-5 py-3.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition min-h-[48px] flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </button>
          )}
          {hasSearched && (
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-3.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition min-h-[48px]"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {showHistory && history.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Recent Searches</h3>
            <span className="text-xs text-gray-400">{history.length} saved</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {history.map((search) => (
              <button
                key={search.id}
                onClick={() => handleHistoryClick(search)}
                className="w-full text-left p-4 hover:bg-amber-50 transition border-b border-gray-50 last:border-b-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {search.cuisine} · {search.mealType}
                    </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                       {search.guests} guests · {search.budget}
                       {search.specialRequest && ` · ${search.specialRequest}`}
                     </p>
                  </div>
                  <span className="text-xs text-gray-400">{formatTime(search.timestamp)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <MatchResults results={results} loading={loading} hasSearched={hasSearched} />
    </div>
  );
}
