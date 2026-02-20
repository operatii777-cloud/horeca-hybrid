import { useState, useEffect } from "react";

const RISK_COLORS = { low: "text-green-400", medium: "text-yellow-400", high: "text-red-400" };

export default function GuestIdentityPage() {
  const [guests, setGuests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/guests")
      .then((r) => r.json())
      .then((d) => { setGuests(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = guests.filter(
    (g) =>
      g.name?.toLowerCase().includes(search.toLowerCase()) ||
      g.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-2">🪪 Hospitality Digital Identity</h1>
      <p className="text-gray-400 mb-6">Universal Guest ID · Loyalty Wallet · GDPR · Risk Score</p>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Guests", value: guests.length, icon: "👥", border: "border-blue-500" },
          { label: "Active Loyalty", value: guests.filter((g) => g.loyaltyPoints > 0).length, icon: "⭐", border: "border-yellow-500" },
          { label: "GDPR Consented", value: guests.filter((g) => g.gdprConsent).length, icon: "✅", border: "border-green-500" },
          { label: "High Risk", value: guests.filter((g) => g.riskScore === "high").length, icon: "🚨", border: "border-red-500" },
        ].map((c) => (
          <div key={c.label} className={`bg-gray-800 rounded-xl p-4 border ${c.border}`}>
            <div className="text-3xl mb-1">{c.icon}</div>
            <div className="text-gray-400 text-sm">{c.label}</div>
            <div className="text-2xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-4">
        <input
          className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500"
          placeholder="Caută după nume sau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                {["Guest ID", "Nume", "Email", "Loyalty pts", "Vizite", "LTV", "Risk"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Se încarcă...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Niciun guest găsit</td></tr>
              ) : (
                filtered.map((g) => (
                  <tr
                    key={g.id}
                    className={`border-t border-gray-700 cursor-pointer hover:bg-gray-700/50 ${selected?.id === g.id ? "bg-gray-700/70" : ""}`}
                    onClick={() => setSelected(g)}
                  >
                    <td className="px-4 py-3 font-mono text-blue-400">#{g.id}</td>
                    <td className="px-4 py-3 font-semibold">{g.name}</td>
                    <td className="px-4 py-3 text-gray-400">{g.email}</td>
                    <td className="px-4 py-3 text-yellow-400">⭐ {g.loyaltyPoints ?? 0}</td>
                    <td className="px-4 py-3">{g.totalVisits ?? 0}</td>
                    <td className="px-4 py-3 text-green-400">{(g.lifetimeValue ?? 0).toFixed(0)} lei</td>
                    <td className={`px-4 py-3 font-bold ${RISK_COLORS[g.riskScore] ?? "text-gray-400"}`}>
                      {g.riskScore ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          {selected ? (
            <>
              <h2 className="text-xl font-bold mb-4">👤 {selected.name}</h2>
              <div className="space-y-3 text-sm">
                <Row label="Guest ID" value={`#${selected.id}`} />
                <Row label="Email" value={selected.email} />
                <Row label="Phone" value={selected.phone ?? "—"} />
                <Row label="Country" value={selected.country ?? "—"} />
                <Row label="Loyalty Points" value={`⭐ ${selected.loyaltyPoints ?? 0}`} />
                <Row label="Lifetime Value" value={`${(selected.lifetimeValue ?? 0).toFixed(2)} lei`} />
                <Row label="Total Visits" value={selected.totalVisits ?? 0} />
                <Row label="GDPR Consent" value={selected.gdprConsent ? "✅ Da" : "❌ Nu"} />
                <Row label="Risk Score" value={<span className={RISK_COLORS[selected.riskScore] ?? "text-gray-400"}>{selected.riskScore ?? "—"}</span>} />
                <Row label="Brands" value={(selected.brands ?? []).join(", ") || "—"} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Selectează un guest pentru detalii
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-gray-700 pb-2">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
