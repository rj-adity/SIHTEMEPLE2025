import { useEffect, useMemo, useState } from "react";

export type Ticket = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  date: string; // yyyy-mm-dd
  slot: string; // e.g., 06:00–08:00
  count: number;
  amount: number; // total
};

function saveTicket(t: Ticket) {
  const key = "e_darshan_tickets";
  const arr = JSON.parse(localStorage.getItem(key) || "[]");
  arr.unshift(t);
  localStorage.setItem(key, JSON.stringify(arr.slice(0, 50)));
}

export function readTickets(): Ticket[] {
  const key = "e_darshan_tickets";
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

export default function TicketPurchase({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: (t: Ticket) => void; }) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [date, setDate] = useState(today);
  const [slot, setSlot] = useState("06:00–08:00");
  const [count, setCount] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const pricePer = 100; // INR per devotee

  useEffect(() => {
    if (!open) {
      // reset when closing
      setDate(today);
      setSlot("06:00–08:00");
      setCount(1);
      setName("");
      setPhone("");
      setEmail("");
      setProcessing(false);
    }
  }, [open, today]);

  const amount = Math.max(0, count) * pricePer;

  function valid() {
    return name.trim().length > 2 && /\d{10}/.test(phone) && count >= 1 && date;
  }

  async function handlePay() {
    if (!valid()) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1600));
    const t: Ticket = {
      id: `DWK-${Date.now().toString(36).toUpperCase()}`,
      name: name.trim(),
      phone,
      email: email || undefined,
      date,
      slot,
      count,
      amount,
    };
    saveTicket(t);
    onSuccess(t);
    setProcessing(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[92vw] max-w-[560px] bg-[hsl(var(--dark-navy))] text-[hsl(var(--cream))] border border-white/10 rounded-2xl shadow-2xl p-6">
        <h3 className="font-heading text-xl text-[hsl(var(--gold))]">E‑Darshan Ticket</h3>
        <div className="text-xs opacity-80 -mt-1 mb-4">ઈ‑દર્શન ટિકિટ</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="text-sm">
            <span className="block mb-1 opacity-90">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-[hsl(var(--gold))]" min={today} />
          </label>
          <label className="text-sm">
            <span className="block mb-1 opacity-90">Time Slot</span>
            <select value={slot} onChange={(e) => setSlot(e.target.value)} className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-[hsl(var(--gold))]">
              {[
                "06:00–08:00",
                "08:00–10:00",
                "10:00–12:00",
                "12:00–14:00",
                "14:00–16:00",
                "16:00–18:00",
              ].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="block mb-1 opacity-90">Devotees</span>
            <input type="number" min={1} value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value)))} className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-[hsl(var(--gold))]" />
          </label>
          <div className="text-sm bg-white/5 border border-white/10 rounded-lg p-3">
            <div>Price per person: ₹{pricePer}</div>
            <div className="font-semibold mt-1">Total: ₹{amount.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <label className="text-sm col-span-1 sm:col-span-2">
            <span className="block mb-1 opacity-90">Full Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-[hsl(var(--gold))]" />
          </label>
          <label className="text-sm">
            <span className="block mb-1 opacity-90">Phone</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit" className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-[hsl(var(--gold))]" />
          </label>
          <label className="text-sm">
            <span className="block mb-1 opacity-90">Email (optional)</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-[hsl(var(--gold))]" />
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-[12px] border border-white/20 text-[hsl(var(--cream))] hover:bg-white/10">Cancel</button>
          <button
            onClick={handlePay}
            disabled={!valid() || processing}
            className="px-5 py-2 rounded-[12px] bg-[hsl(var(--gold))] text-[hsl(var(--royal))] font-semibold shadow hover:shadow-[0_0_16px_rgba(255,215,0,.45)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {processing ? "Processing…" : `Pay ₹${amount.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
