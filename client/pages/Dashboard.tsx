import { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { Car, MapPin } from "lucide-react";

function classNames(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export default function Dashboard() {
  // Live crowd simulation
  const [visitors, setVisitors] = useState(36500);
  const [occupancy, setOccupancy] = useState(72);
  const [crowdData, setCrowdData] = useState<{ t: string; v: number }[]>(
    Array.from({ length: 20 }).map((_, i) => ({ t: `${i}m`, v: 30000 + Math.random() * 10000 }))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setCrowdData((prev) => {
        const next = prev.slice(1);
        const v = Math.max(1000, Math.round((prev[prev.length - 1]?.v || 32000) + (Math.random() - 0.4) * 2500));
        next.push({ t: `${Number(prev[prev.length - 1]?.t.replace("m", "")) + 3}m`, v });
        return next;
      });
      setVisitors((v) => Math.max(1000, Math.round(v + (Math.random() - 0.4) * 2500)));
      setOccupancy((o) => Math.max(5, Math.min(98, Math.round(o + (Math.random() - 0.5) * 5))));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Queue stats
  const [queueLen, setQueueLen] = useState(1250);
  const [avgWait, setAvgWait] = useState(45);
  useEffect(() => {
    const id = setInterval(() => {
      setQueueLen((q) => Math.max(0, Math.round(q + (Math.random() - 0.5) * 150)));
      setAvgWait((w) => Math.max(5, Math.round(w + (Math.random() - 0.5) * 6)));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Predictions data (24h)
  const [festival, setFestival] = useState(false);
  const basePrediction = useMemo(() =>
    Array.from({ length: 24 }).map((_, h) => {
      const base = 2000 + 8000 * Math.sin((Math.PI * (h + 6)) / 24) ** 2 + (h > 18 && h < 22 ? 2000 : 0);
      return { hour: h, value: Math.round(base) };
    }), []);
  const prediction = useMemo(() => basePrediction.map(d => ({ ...d, value: festival ? Math.round(d.value * 2) : d.value })), [basePrediction, festival]);

  // Alerts feed
  const [alerts, setAlerts] = useState<{ icon: string; text: string; time: string }[]>([
    { icon: "⚠️", text: "Medical emergency at East Gate", time: "10:05 AM" },
    { icon: "🚓", text: "Crowd surge near Entry 3", time: "10:10 AM" },
  ]);
  useEffect(() => {
    const samples = [
      { icon: "⚠️", text: "Dehydration case near North Corridor", time: new Date().toLocaleTimeString() },
      { icon: "🚓", text: "Queue spillover at Ticket Counter", time: new Date().toLocaleTimeString() },
      { icon: "🛠️", text: "Barricade fix needed at West Gate", time: new Date().toLocaleTimeString() },
    ];
    const id = setInterval(() => {
      setAlerts((a) => [samples[Math.floor(Math.random() * samples.length)], ...a].slice(0, 10));
    }, 8000);
    return () => clearInterval(id);
  }, []);

  // Parking
  const [parking, setParking] = useState([
    { zone: "North", used: 180, total: 300 },
    { zone: "South", used: 240, total: 300 },
    { zone: "East", used: 280, total: 300 },
    { zone: "West", used: 120, total: 300 },
  ]);
  useEffect(() => {
    const id = setInterval(() => {
      setParking((ps) => ps.map((p) => ({ ...p, used: Math.min(p.total, Math.max(0, p.used + Math.round((Math.random() - 0.5) * 20))) })));
    }, 7000);
    return () => clearInterval(id);
  }, []);

  const occColor = occupancy < 60 ? "text-[hsl(var(--green-safe))]" : occupancy <= 80 ? "text-amber-400" : "text-[hsl(var(--red-alert))]";

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[hsl(var(--dark-navy))] text-[hsl(var(--cream))]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-20 py-8 grid grid-cols-10 gap-6">
        {/* Left Column 30% */}
        <div className="col-span-10 md:col-span-3 space-y-6">
          <div className="bg-white/5 rounded-xl p-5 shadow border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Live Crowd</h3>
              <span className="text-xs opacity-70">last ~60m</span>
            </div>
            <div className="text-3xl md:text-[36px] font-bold leading-none">
              <span className={classNames(occColor)}>{visitors.toLocaleString()}</span>
              <span className="ml-2 text-sm opacity-70">visitors</span>
            </div>
            <div className="mt-1 text-sm opacity-80">Occupancy: <span className={occColor}>{occupancy}%</span></div>
            <div className="h-36 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={crowdData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="t" stroke="#FFFDF7AA" tick={{ fontSize: 12 }} hide />
                  <YAxis stroke="#FFFDF7AA" hide />
                  <ReTooltip contentStyle={{ background: "#0A1D37", border: "1px solid rgba(255,255,255,0.15)", color: "#FFFDF7" }} />
                  <Line type="monotone" dataKey="v" stroke="#FFD700" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-5 shadow border border-white/10">
            <h3 className="font-semibold mb-2">Queue Stats</h3>
            <div className="text-sm opacity-90">Queue length: <span className="font-semibold">{queueLen.toLocaleString()} people</span></div>
            <div className="text-sm opacity-90">Avg wait: <span className="font-semibold">{avgWait} min</span></div>
            <div className="mt-4">
              <Progress value={Math.min(100, Math.round((queueLen / 2000) * 100))} className="h-3 bg-white/10" />
              <div className="mt-1 text-xs opacity-70">Updates every few seconds</div>
            </div>
          </div>
        </div>

        {/* Middle Column 40% */}
        <div className="col-span-10 md:col-span-4 space-y-4">
          <div className="bg-white/5 rounded-xl p-5 shadow border border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">24h Forecast</h3>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={festival} onChange={(e) => setFestival(e.target.checked)} />
                <span>Festival Mode Simulation</span>
              </label>
            </div>
            <div className="h-60 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prediction}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey={(d: any) => `${String(d.hour).padStart(2, "0")}:00`} stroke="#FFFDF7AA" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#FFFDF7AA" tick={{ fontSize: 12 }} />
                  <ReTooltip formatter={(v: any, _n: any, p: any) => [v, `Hour: ${String(p.payload.hour).padStart(2, "0")}:00 – Predicted Visitors`]} contentStyle={{ background: "#0A1D37", border: "1px solid rgba(255,255,255,0.15)", color: "#FFFDF7" }} />
                  <Bar dataKey="value" fill="#FFD700">
                    {prediction.map((entry, index) => (
                      <Cell key={`c-${index}`} fill={entry.value > 10000 ? "#FF4D4D" : "#FFD700"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column 30% */}
        <div className="col-span-10 md:col-span-3 space-y-4">
          <div className="bg-white rounded-xl p-4 shadow max-h-[280px] overflow-auto">
            <h3 className="font-semibold text-slate-800 mb-2">Alerts</h3>
            <ul className="space-y-3">
              {alerts.map((a, i) => (
                <li key={i} className="bg-slate-50 rounded-lg p-3 shadow-sm border border-slate-200 animate-[slide-in_0.3s_ease]">
                  <div className="flex items-center gap-2 text-slate-800"><span>{a.icon}</span><span>{a.text}</span></div>
                  <div className="text-xs text-slate-500 mt-1">{a.time}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <button className="w-full px-4 py-3 rounded-[12px] bg-[hsl(var(--red-alert))] text-white font-semibold shadow hover:shadow-[0_0_18px_rgba(255,77,77,.6)] transition">Dispatch Medical</button>
            <button className="w-full px-4 py-3 rounded-[12px] bg-[hsl(var(--royal))] text-white font-semibold shadow hover:shadow-[0_0_18px_rgba(0,74,173,.6)] transition">Dispatch Police</button>
          </div>
        </div>

        {/* Bottom Row full width */}
        <div className="col-span-10 bg-[hsl(var(--cream))] text-slate-800 rounded-xl p-5 shadow mt-2">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Parking Slots */}
            <div>
              <h3 className="font-semibold mb-3">Parking Slots</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {parking.map((p) => {
                  const occ = Math.round((p.used / p.total) * 100);
                  const color = occ < 60 ? "text-[hsl(var(--green-safe))]" : occ <= 80 ? "text-amber-500" : "text-red-500";
                  return (
                    <div key={p.zone} className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Car className="h-5 w-5 text-slate-500" />
                        <div className="font-medium">{p.zone}</div>
                      </div>
                      <div className="mt-1 text-sm">Available: <span className={color}>{p.total - p.used}</span> / {p.total}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Traffic Simulation */}
            <div>
              <h3 className="font-semibold mb-3">Traffic Simulation</h3>
              <div className="relative h-40 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                <div className="absolute inset-0 grid grid-cols-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border-r border-slate-200/60" />
                  ))}
                </div>
                {/* moving arrows */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="absolute left-0 top-[20%] h-1 w-full">
                    <div className="animate-[flow_5s_linear_infinite] h-1 w-24 bg-[hsl(var(--royal))] shadow-[0_0_10px_rgba(0,74,173,.4)]" style={{ animationDelay: `${i * 0.6}s` }} />
                  </div>
                ))}
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={`b-${i}`} className="absolute right-0 bottom-[20%] h-1 w-full">
                    <div className="animate-[flowR_6s_linear_infinite] h-1 w-24 bg-[hsl(var(--red-alert))] shadow-[0_0_10px_rgba(255,77,77,.4)]" style={{ animationDelay: `${i * 0.5}s` }} />
                  </div>
                ))}
                <div className="absolute inset-0 p-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600"><MapPin className="h-4 w-4" /> Map placeholder</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slide-in { from { transform: translateY(-6px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes flow { 0% { transform: translateX(-30%) } 100% { transform: translateX(130%) } }
        @keyframes flowR { 0% { transform: translateX(30%) } 100% { transform: translateX(-130%) } }
      `}</style>
    </div>
  );
}
