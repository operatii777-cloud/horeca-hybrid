import { useState, useEffect, useRef } from "react";

export default function WarRoomPage() {
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);
  const REFRESH_INTERVAL_MS = 30000;

  const loadData = () => {
    Promise.all([
      fetch("/api/war-room").then((r) => r.json()),
      fetch("/api/war-room/alerts").then((r) => r.json()),
    ])
      .then(([d, a]) => { setData(d); setAlerts(a); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    intervalRef.current = setInterval(loadData, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Se încarcă...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">🎯 HQ War Room</h1>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm font-medium">LIVE</span>
          <span className="text-gray-400 text-sm ml-2">Auto-refresh {REFRESH_INTERVAL_MS / 1000}s</span>
        </div>
      </div>
      <p className="text-gray-400 mb-6">Control Center Live · {data?.locationCount ?? 0} Locații Monitorizate</p>

      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${
              a.severity === "critical" ? "bg-red-900/30 border-red-500" :
              a.severity === "warning" ? "bg-yellow-900/30 border-yellow-500" :
              "bg-blue-900/30 border-blue-500"
            }`}>
              <span className="text-2xl">{a.severity === "critical" ? "🚨" : a.severity === "warning" ? "⚠️" : "ℹ️"}</span>
              <div className="flex-1">
                <span className="font-semibold">{a.location}</span>
                <span className="text-gray-300 ml-2">{a.message}</span>
              </div>
              <span className="text-gray-400 text-xs">{a.time}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Comenzi Live", value: data?.liveOrders ?? 0, icon: "📦", border: "border-blue-500" },
          { label: "Timp Prep Mediu", value: `${data?.avgPrepTime ?? 0}min`, icon: "⏱️", border: data?.avgPrepTime > 15 ? "border-red-500" : "border-green-500" },
          { label: "Revenue Azi", value: `${(data?.revenueToday ?? 0).toFixed(0)} lei`, icon: "💰", border: "border-yellow-500" },
          { label: "SLA Delivery", value: `${data?.slaRate ?? 0}%`, icon: "🚀", border: data?.slaRate < 90 ? "border-red-500" : "border-green-500" },
          { label: "Refund Spike", value: data?.refundSpike ? "⚠️ Da" : "✅ Nu", icon: "↩️", border: data?.refundSpike ? "border-red-500" : "border-gray-600" },
        ].map((c) => (
          <div key={c.label} className={`bg-gray-800 rounded-xl p-4 border ${c.border}`}>
            <div className="text-3xl mb-1">{c.icon}</div>
            <div className="text-gray-400 text-xs">{c.label}</div>
            <div className="text-xl font-bold mt-1">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold">📍 Status Locații Live</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                {["Locație", "Comenzi", "Prep Avg", "Revenue", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.locations ?? []).map((loc) => (
                <tr key={loc.id} className="border-t border-gray-700">
                  <td className="px-4 py-3 font-medium">{loc.name}</td>
                  <td className="px-4 py-3">{loc.openOrders}</td>
                  <td className={`px-4 py-3 font-bold ${loc.avgPrepTime > 15 ? "text-red-400" : "text-green-400"}`}>
                    {loc.avgPrepTime}min
                  </td>
                  <td className="px-4 py-3 text-green-400">{loc.revenue.toFixed(0)} lei</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      loc.status === "ok" ? "bg-green-900 text-green-300" :
                      loc.status === "warning" ? "bg-yellow-900 text-yellow-300" :
                      "bg-red-900 text-red-300"
                    }`}>{loc.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h2 className="text-lg font-semibold mb-4">📊 Revenue Trend (ore)</h2>
          <div className="flex items-end gap-2 h-40">
            {(data?.revenueTrend ?? []).map((h, i) => {
              const maxVal = Math.max(...(data?.revenueTrend ?? []).map((x) => x.value), 1);
              const pct = (h.value / maxVal) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-blue-500/80 rounded-t" style={{ height: `${pct}%` }} title={`${h.value} lei`} />
                  <span className="text-xs text-gray-500">{h.hour}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
