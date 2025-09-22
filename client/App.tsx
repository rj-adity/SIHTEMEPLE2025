import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import { useState } from "react";

const queryClient = new QueryClient();

function FooterBar({
  lang,
  setLang,
}: {
  lang: "en" | "gu";
  setLang: (l: "en" | "gu") => void;
}) {
  return (
    <footer className="h-16 w-full bg-[hsl(var(--dark-navy))] text-[hsl(var(--cream))] flex items-center justify-between px-6 border-t border-white/10">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-[hsl(var(--gold))]" />
        <div className="text-sm opacity-80">Dwarka Smart Pilgrimage</div>
      </div>
      <div className="flex items-center gap-6">
        <nav className="hidden md:flex items-center gap-4 text-sm opacity-80">
          <Link to="/" className="hover:opacity-100 transition-opacity">
            Home
          </Link>
          <Link
            to="/dashboard"
            className="hover:opacity-100 transition-opacity"
          >
            Dashboard
          </Link>
          <Link to="/admin" className="hover:opacity-100 transition-opacity">
            Admin
          </Link>
        </nav>
        <div className="bg-white/10 rounded-xl p-1 flex text-xs">
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 rounded-lg transition-all ${
              lang === "en"
                ? "bg-[hsl(var(--gold))] text-[hsl(var(--royal))] shadow"
                : "text-white"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("gu")}
            className={`px-3 py-1 rounded-lg transition-all ${
              lang === "gu"
                ? "bg-[hsl(var(--gold))] text-[hsl(var(--royal))] shadow"
                : "text-white"
            }`}
          >
            ગુજરાતી
          </button>
        </div>
      </div>
    </footer>
  );
}

const App = () => {
  const [lang, setLang] = useState<"en" | "gu">("en");
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index lang={lang} />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <FooterBar lang={lang} setLang={setLang} />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
