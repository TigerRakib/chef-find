export interface UserPreferences {
  defaultCuisine: string;
  defaultMealType: string;
  defaultGuests: string;
  defaultBudget: string;
}

export interface SearchHistory {
  id: string;
  cuisine: string;
  mealType: string;
  guests: string;
  budget: string;
  specialRequest: string;
  timestamp: number;
  resultIds: number[];
}

const STORAGE_KEYS = {
  PREFERENCES: "cheffind_preferences",
  HISTORY: "cheffind_search_history",
  FAVORITES: "cheffind_favorites",
} as const;

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn("Failed to save to localStorage");
  }
}

export function getPreferences(): UserPreferences {
  return getFromStorage<UserPreferences>(STORAGE_KEYS.PREFERENCES, {
    defaultCuisine: "",
    defaultMealType: "",
    defaultGuests: "",
    defaultBudget: "",
  });
}

export function savePreferences(prefs: Partial<UserPreferences>): void {
  const current = getPreferences();
  setToStorage(STORAGE_KEYS.PREFERENCES, { ...current, ...prefs });
}

export function getSearchHistory(): SearchHistory[] {
  return getFromStorage<SearchHistory[]>(STORAGE_KEYS.HISTORY, []);
}

export function addToSearchHistory(search: Omit<SearchHistory, "id" | "timestamp">): void {
  const history = getSearchHistory();
  const newEntry: SearchHistory = {
    ...search,
    id: Date.now().toString(),
    timestamp: Date.now(),
  };
  const updated = [newEntry, ...history].slice(0, 20);
  setToStorage(STORAGE_KEYS.HISTORY, updated);
}

export function clearSearchHistory(): void {
  setToStorage(STORAGE_KEYS.HISTORY, []);
}

export function getFavorites(): number[] {
  return getFromStorage<number[]>(STORAGE_KEYS.FAVORITES, []);
}

export function toggleFavorite(chefId: number): boolean {
  const favorites = getFavorites();
  const index = favorites.indexOf(chefId);
  if (index > -1) {
    favorites.splice(index, 1);
    setToStorage(STORAGE_KEYS.FAVORITES, favorites);
    return false;
  } else {
    favorites.push(chefId);
    setToStorage(STORAGE_KEYS.FAVORITES, favorites);
    return true;
  }
}

export function isFavorite(chefId: number): boolean {
  return getFavorites().includes(chefId);
}
