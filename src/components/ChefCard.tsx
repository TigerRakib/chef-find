"use client";

import { useState } from "react";
import { Chef } from "@/data/chefs";
import { isFavorite, toggleFavorite } from "@/lib/storage";

interface ChefCardProps {
  chef: Chef;
  rank: number;
}

export function ChefCard({ chef, rank }: ChefCardProps) {
  const [favorited, setFavorited] = useState(() => isFavorite(chef.id));

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = toggleFavorite(chef.id);
    setFavorited(newState);
  };

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden">
      <div className="relative">
        <div
          className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md ${
            rank === 1
              ? "bg-gradient-to-br from-amber-400 to-amber-600"
              : rank === 2
              ? "bg-gradient-to-br from-gray-400 to-gray-500"
              : "bg-gradient-to-br from-orange-400 to-orange-600"
          }`}
        >
          #{rank}
        </div>

        <button
          onClick={handleFavorite}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
            favorited
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white"
          }`}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <svg className="w-4 h-4" fill={favorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 h-24 sm:h-28 flex items-center justify-center text-5xl sm:text-6xl">
          {chef.avatar}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
              {chef.name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">{chef.completedBookings} bookings completed</p>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-amber-700">{chef.rating}</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{chef.bio}</p>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cuisine</p>
          <div className="flex flex-wrap gap-1.5">
            {chef.cuisine.map((c) => (
              <span
                key={c}
                className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-medium"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Specialties</p>
          <div className="flex flex-wrap gap-1.5">
            {chef.specialty.map((s) => (
              <span
                key={s}
                className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs text-gray-400">Experience</p>
              <p className="text-sm font-semibold text-gray-900">{chef.experience} years</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs text-gray-400">Per Session</p>
              <p className="text-sm font-semibold text-amber-600">৳{chef.pricePerSession.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <button className="w-full bg-gray-900 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 active:scale-[0.98] min-h-[48px]">
          Book {chef.name.split(" ")[0]}
        </button>
      </div>
    </div>
  );
}
