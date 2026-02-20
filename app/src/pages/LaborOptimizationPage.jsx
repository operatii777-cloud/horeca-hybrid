import { useState, useEffect } from "react";

export default function LaborOptimizationPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/labor-optimization")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Se încarcă...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-2">👷 Labor Optimization AI</h1>
      <p className="text-gray-400 mb-6">Traffic Forecast · Smart Shifts · Overtime Risk · Burnout Detection</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Cost Labor %", value: `${data?.laborCostPct ?? 0}%`, icon: "💰", border: data?.laborCostPct > 35 ? "border-red-500" : "border-green-500" },
          { label: "Overtime Risk", value: data?.overtimeRisk ?? 0, icon: "⚠️", border: "border-yellow-500" },
          { label: "Burnout Alerts", value: data?.burnoutAlerts ?? 0, icon: "🔥", border: "border-orange-500" },
          { label: "Staff on Duty", value: data?.staffOnDuty ?? 0, icon: "👥", border: "border-blue-500" },
        ].map((c) => (
          <div key={c.label} className={`bg-gray-800 rounded-xl p-4 border ${c.border}`}>
            <div className="text-3xl mb-1">{c.icon}</div>
            <div className="text-gray-400 text-sm">{c.label}</div>
            <div className="text-2xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h2 className="text-lg font-semibold mb-4">📈 Traffic Forecast (15 min intervals)</h2>
          <div className="space-y-2">
            {(data?.trafficForecast ?? []).map((slot, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-gray-400 text-sm w-16">{slot.time}</span>
                <div className="flex-1 bg-gray-700 rounded-full h-4 relative overflow-hidden">
                  <div
                    className={`h-4 rounded-full ${slot.load > 80 ? "bg-red-500" : slot.load > 60 ? "bg-yellow-500" : "bg-green-500"}`}
                    style={{ width: `${slot.load}%` }}
                  />
                </div>
                <span className="text-sm w-12 text-right font-bold">{slot.load}%</span>
                <span className="text-sm text-gray-400 w-20">{slot.covers} covers</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h2 className="text-lg font-semibold mb-4">📅 Suggested Shifts</h2>
          <div className="space-y-3">
            {(data?.suggestedShifts ?? []).map((shift, i) => (
              <div key={i} className={`rounded-lg p-4 border ${
                shift.overtimeRisk ? "border-red-500/50 bg-red-900/10" :
                shift.burnoutRisk ? "border-orange-500/50 bg-orange-900/10" :
                "border-gray-600 bg-gray-700/30"
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold">{shift.name}</span>
                  <span className="text-sm text-gray-400">{shift.role}</span>
                </div>
                <div className="text-sm text-gray-300">{shift.startTime} – {shift.endTime}</div>
                <div className="flex gap-2 mt-2">
                  {shift.overtimeRisk && <span className="px-2 py-0.5 bg-red-900 text-red-300 rounded text-xs">⚠️ Overtime Risk</span>}
                  {shift.burnoutRisk && <span className="px-2 py-0.5 bg-orange-900 text-orange-300 rounded text-xs">🔥 Burnout Risk</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">🏆 Staff Performance Benchmarking</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-700">
            <tr>
              {["Angajat", "Locație", "Ore Lucrate", "Vânzări", "Avg Order", "Score", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-gray-300">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data?.staffBenchmark ?? []).map((s, i) => (
              <tr key={i} className="border-t border-gray-700">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 text-gray-400">{s.location}</td>
                <td className="px-4 py-3">{s.hoursWorked}h</td>
                <td className="px-4 py-3 text-green-400">{s.sales.toFixed(0)} lei</td>
                <td className="px-4 py-3">{s.avgOrder.toFixed(0)} lei</td>
                <td className="px-4 py-3">
                  <span className={`font-bold ${s.score >= 80 ? "text-green-400" : s.score >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                    {s.score}/100
                  </span>
                </td>
                <td className="px-4 py-3">
                  {s.burnout ? <span className="px-2 py-1 bg-orange-900 text-orange-300 rounded text-xs">🔥 Burnout</span>
                    : s.overtime ? <span className="px-2 py-1 bg-red-900 text-red-300 rounded text-xs">⚠️ Overtime</span>
                    : <span className="px-2 py-1 bg-green-900 text-green-300 rounded text-xs">✅ OK</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
