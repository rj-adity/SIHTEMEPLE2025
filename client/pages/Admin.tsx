import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts";
import { useWebSocket } from "@/hooks/useWebSocket";

type StaffType = "Medical" | "Police" | "Volunteer";

const staffSeed = [
  { id: "m1", name: "Medical A", type: "Medical" as StaffType },
  { id: "m2", name: "Medical B", type: "Medical" as StaffType },
  { id: "p1", name: "Police A", type: "Police" as StaffType },
  { id: "p2", name: "Police B", type: "Police" as StaffType },
  { id: "v1", name: "Volunteer A", type: "Volunteer" as StaffType },
  { id: "v2", name: "Volunteer B", type: "Volunteer" as StaffType },
];

const zones = [
  "North Gate",
  "West Gate",
  "East Gate",
  "Parking Zone B",
] as const;

type Zone = (typeof zones)[number];

export default function Admin() {
  // WebSocket connection for real-time updates
  const { connected, simulateSurge } = useWebSocket({
    templeId: 'dwarka',
    onUpdate: (update) => {
      console.log('Admin received update:', update);
    }
  });

  const [available, setAvailable] = useState(staffSeed);
  const [placed, setPlaced] = useState<Record<Zone, typeof staffSeed>>({
    "North Gate": [],
    "West Gate": [],
    "East Gate": [],
    "Parking Zone B": [],
  });
  const [log, setLog] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] System ready`,
  ]);

  // ML Predictions state
  const [mlPredictions, setMlPredictions] = useState<any[]>([]);
  
  // Fetch ML predictions
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        
        const response = await fetch('/api/ml/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templeId: 'dwarka',
            date: dateStr,
            festivalMode: holiday
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setMlPredictions(data.predictions || []);
        }
      } catch (error) {
        console.error('Failed to fetch ML predictions:', error);
      }
    };
    
    fetchPredictions();
  }, [holiday]);

  function onDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDrop(e: React.DragEvent, zone: Zone) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const staff =
      available.find((s) => s.id === id) ||
      Object.values(placed)
        .flat()
        .find((s) => s.id === id);
    if (!staff) return;

    // Remove from wherever it is
    setAvailable((av) => av.filter((s) => s.id !== id));
    setPlaced((pl) => {
      const next: Record<Zone, typeof staffSeed> = { ...pl } as any;
      for (const key of zones) next[key] = next[key].filter((s) => s.id !== id);
      next[zone] = [...next[zone], staff];
      return next;
    });
    setLog((l) => [
      `[${new Date().toLocaleTimeString()}] ${staff.type} team dispatched to ${zone}`,
      ...l,
    ]);
  }

  function allowDrop(e: React.DragEvent) {
    e.preventDefault();
  }

  // Trigger surge simulation
  const handleSurgeSimulation = async () => {
    try {
      await fetch('/api/ml/simulate/surge/dwarka', { method: 'POST' });
      simulateSurge(); // Also trigger WebSocket surge
    } catch (error) {
      console.error('Failed to trigger surge:', error);
    }
  };

  // Chart data: 3 days (historical + predicted)
  const [holiday, setHoliday] = useState(false);
  const chart = useMemo(() => {
    // Use ML predictions if available, otherwise use synthetic data
    if (mlPredictions.length > 0) {
      return mlPredictions.map((pred, i) => ({
        t: `Pred ${String(pred.hour).padStart(2, "0")}:00`,
        v: pred.visitors,
        day: 0
      }));
    }
    
    // Fallback to synthetic data
    const arr: { t: string; v: number; day: number }[] = [];
    for (let d = -2; d <= 0; d++) {
      for (let h = 0; h < 24; h++) {
        const base =
          1500 +
          7000 * Math.sin((Math.PI * (h + 6)) / 24) ** 2 +
          (h > 17 && h < 21 ? 1500 : 0);
        const v = Math.round(base * (d === 0 ? (holiday ? 1.5 : 1.2) : 1));
        arr.push({
          t: `${d === 0 ? "Pred" : "Hist"} ${String(h).padStart(2, "0")}:00`,
          v,
          day: d,
        });
      }
    }
    return arr;
  }, [holiday, mlPredictions]);

  const maxVisitors = Math.max(
    ...chart.filter((d) => d.day === 0).map((d) => d.v),
  );
  const peakHour = chart
    .filter((d) => d.day === 0)
    .reduce((a, b) => (a.v > b.v ? a : b))
    .t.split(" ")[1];

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[hsl(var(--dark-navy))] text-[hsl(var(--cream))]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-20 py-8 grid md:grid-cols-2 gap-6">
        {/* Connection Status */}
        <div className="md:col-span-2 flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-sm">{connected ? 'Real-time Connected' : 'Offline Mode'}</span>
          </div>
          <button
            onClick={handleSurgeSimulation}
            className="px-4 py-2 rounded-[12px] bg-[hsl(var(--red-alert))] text-white font-semibold shadow hover:shadow-[0_0_18px_rgba(255,77,77,.6)] transition"
          >
            🚨 Simulate Crowd Surge
          </button>
        </div>

        {/* Left: Staff + Map */}
        <div className="space-y-4">
          <h2 className="font-heading text-2xl text-[hsl(var(--gold))]">
            Staff Management + Map
          </h2>

          {/* Available staff */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Drag-and-Drop Staff</h3>
            <div className="flex flex-wrap gap-3">
              {available.map((s) => (
                <div
                  key={s.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, s.id)}
                  className={
                    "cursor-grab active:cursor-grabbing select-none px-3 py-2 rounded-[12px] text-sm shadow border border-white/15 " +
                    (s.type === "Medical"
                      ? "bg-[hsl(var(--red-alert))] text-white"
                      : s.type === "Police"
                        ? "bg-[hsl(var(--royal))] text-white"
                        : "bg-white text-slate-800")
                  }
                  title={s.type}
                >
                  {s.name}
                </div>
              ))}
            </div>
          </div>

          {/* Map placeholder with zones */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Temple Campus Map</h3>
            <div className="relative h-72 bg-[rgba(255,255,255,.04)] rounded-lg overflow-hidden">
              <svg
                className="absolute inset-0 w-full h-full opacity-40"
                viewBox="0 0 600 300"
              >
                <rect
                  x="40"
                  y="40"
                  width="520"
                  height="220"
                  fill="none"
                  stroke="white"
                  strokeOpacity="0.2"
                />
                <circle
                  cx="300"
                  cy="150"
                  r="60"
                  fill="none"
                  stroke="white"
                  strokeOpacity="0.25"
                />
                <rect
                  x="60"
                  y="60"
                  width="120"
                  height="80"
                  fill="none"
                  stroke="white"
                  strokeOpacity="0.2"
                />
                <rect
                  x="420"
                  y="60"
                  width="120"
                  height="80"
                  fill="none"
                  stroke="white"
                  strokeOpacity="0.2"
                />
                <rect
                  x="240"
                  y="200"
                  width="120"
                  height="40"
                  fill="none"
                  stroke="white"
                  strokeOpacity="0.2"
                />
              </svg>
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-4 p-4">
                {zones.map((z) => (
                  <div
                    key={z}
                    onDrop={(e) => onDrop(e, z)}
                    onDragOver={allowDrop}
                    className="rounded-lg border border-white/20 bg-black/20 backdrop-blur-sm p-3"
                  >
                    <div className="font-semibold text-sm mb-2">{z}</div>
                    <div className="flex flex-wrap gap-2 min-h-[28px]">
                      {placed[z].map((s) => (
                        <span
                          key={s.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, s.id)}
                          className="px-2 py-1 rounded-md text-xs bg-white/80 text-slate-800 shadow"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Log Panel */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-h-48 overflow-auto">
            <h3 className="font-semibold mb-2">Action Log</h3>
            <ul className="space-y-1 text-sm opacity-90">
              {log.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: ML Prediction Panel */}
        <div className="relative">
          <h2 className="font-heading text-2xl text-[hsl(var(--gold))]">
            ML Prediction Panel
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-80">
                  3-day inflow (historical + predicted)
                </div>
                <label className="flex items-center gap-2 text-sm mt-1">
                  <input
                    type="checkbox"
                    checked={holiday}
                    onChange={(e) => setHoliday(e.target.checked)}
                  />
                  <span>Holiday Surge Mode ( +50% uplift )</span>
                </label>
              </div>
              <div className="text-right space-y-1">
                <div className="bg-white/10 rounded-lg px-3 py-2 text-sm">
                  Tomorrow’s Peak Hour:{" "}
                  <span className="font-semibold">{peakHour}</span>
                </div>
                <div className="bg-white/10 rounded-lg px-3 py-2 text-sm">
                  Expected Max Visitors:{" "}
                  <span className="font-semibold">
                    {maxVisitors.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="h-80 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart}>
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.08)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="t"
                    stroke="#FFFDF7AA"
                    tick={{ fontSize: 11 }}
                    hide
                  />
                  <YAxis stroke="#FFFDF7AA" tick={{ fontSize: 12 }} />
                  <ReTooltip
                    contentStyle={{
                      background: "#0A1D37",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#FFFDF7",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#FFD700"
                    fill="#FFD70022"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
