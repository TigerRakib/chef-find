import { ChefForm } from "@/components/ChefForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-gray-50">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧑‍🍳</span>
            <span className="text-xl font-bold text-gray-900">
              Chef<span className="text-amber-600">Find</span>
            </span>
          </div>
          <span className="text-xs text-gray-400 hidden sm:block">AI-Powered Chef Matching</span>
        </div>
      </header>

      <ChefForm />

      <footer className="max-w-2xl mx-auto px-4 py-8 text-center border-t border-gray-100 mt-12">
        <p className="text-xs text-gray-400">
          &copy; 2026 ChefFind. All chefs are verified and background-checked.
        </p>
      </footer>
    </main>
  );
}
