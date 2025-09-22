import { Link, useNavigate } from "react-router-dom";

export default function Index({ lang = "en" as "en" | "gu" }: { lang?: "en" | "gu" }) {
  const navigate = useNavigate();
  return (
    <div
      className="relative min-h-[calc(100vh-4rem)]"
      style={{
        background:
          "linear-gradient(to bottom, #0A1D37 0%, rgba(0,74,173,0.9) 80%, #004AAD 100%)",
      }}
    >
      {/* 12-col grid with margins */}
      <div className="mx-auto max-w-[1440px] px-20 md:px-[80px] py-16 grid grid-cols-12 gap-6 min-h-[calc(100vh-4rem)] place-items-center">
        {/* Temple silhouette overlay */}
        <svg
          className="pointer-events-none absolute inset-0 mx-auto my-auto w-[900px] h-[900px] opacity-20 text-[hsl(var(--gold))]"
          viewBox="0 0 600 600"
          fill="currentColor"
          aria-hidden
        >
          <path d="M300 60l30 40h40l20 30h30l10 25h25l15 45h45l-10 30h-30l-15 220h-350l-15-220h-30l-10-30h45l15-45h25l10-25h30l20-30h40l30-40zM140 435h320v35H140z" />
        </svg>

        {/* Hero center */}
        <div className="col-span-12 relative z-10 text-center">
          <h1 className="font-heading text-[48px] leading-tight text-[hsl(var(--gold))] drop-shadow-sm">
            {lang === "en"
              ? "Dwarka-Inspired Smart Pilgrimage Management Platform"
              : "દ્વારકા-પ્રેરિત સ્માર્ટ યાત્રા વ્યવસ્થાપન પ્લેટફોર્મ"}
          </h1>
          <p className="mt-4 text-[20px] text-[hsl(var(--cream))] max-w-3xl mx-auto opacity-95">
            {lang === "en"
              ? "Safe, Predictive & Seamless Temple Experience for Millions"
              : "લાખો માટે સુરક્ષિત, અનુમાનિત અને સરળ મંદિર અનુભવ"}
          </p>
          <div className="mt-10 flex items-center justify-center gap-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 md:px-8 py-3 rounded-[12px] bg-[hsl(var(--gold))] text-[hsl(var(--royal))] font-semibold shadow-md hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] transform hover:scale-[1.05] transition-all"
            >
              {lang === "en" ? "Open Dashboard" : "ડેશબોર્ડ ખોલો"}
            </button>
            <button
              onClick={() => navigate("/dashboard?demo=ml")}
              className="px-6 md:px-8 py-3 rounded-[12px] border border-[hsl(var(--gold))] text-[hsl(var(--cream))] font-semibold hover:bg-[hsl(var(--gold))] hover:text-[hsl(var(--royal))] hover:shadow-[0_0_20px_rgba(255,215,0,0.35)] transform hover:scale-[1.05] transition-all"
            >
              {lang === "en" ? "Run ML Predictions Demo" : "એમએલ અનુમાન ડેમો ચલાવો"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
