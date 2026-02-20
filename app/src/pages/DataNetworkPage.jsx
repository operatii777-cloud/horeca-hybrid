import { useState, useEffect } from "react";

export default function DataNetworkPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("benchmarks");

  useEffect(() => {
    fetch("/api/data-network")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Se încarcă...</div>;

  const tabs = [
    { id: "benchmarks", label: "Benchmarks", icon: "📊" },
    { id: "trends", label: "Food Trends", icon: "🌿" },
    { id: "costs", label: "Cost Trends", icon: "💹" },
    { id: "peak", label: "Peak Hours", icon: "⏰" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-2">🌐 Global Data Network Effect</h1>
      <p className="text-gray-400 mb-6">Industry Benchmarks · Food Trends · Peak Hours · Cost Intel</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Locații în Rețea", value: data?.networkLocations ?? 0, icon: "🏪", border: "border-blue-500" },
          { label: "Tranzacții Analizate", value: `${(data?.analyzedTransactions ?? 0).toLocaleString()}`, icon: "📊", border: "border-green-500" },
          { label: "Avg Industry Margin", value: `${data?.industryAvgMargin ?? 0}%`, icon: "💰", border: "border-yellow-500" },
          { label: "Trends Detectate", value: data?.trendsDetected ?? 0, icon: "📈", border: "border-purple-500" },
        ].map((c) => (
          <div key={c.label} className={`bg-gray-800 rounded-xl p-4 border ${c.border}`}>
            <div className="text-3xl mb-1">{c.icon}</div>
            <div className="text-gray-400 text-sm">{c.label}</div>
            <div className="text-2xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === t.id ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === "benchmarks" && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                {["Metric", "Tu", "Industrie Avg", "Top 10%", "vs Industrie"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.benchmarks ?? []).map((b, i) => {
                const diff = b.yours - b.industryAvg;
                const pct = b.industryAvg > 0 ? (diff / b.industryAvg * 100).toFixed(1) : 0;
                return (
                  <tr key={i} className="border-t border-gray-700">
                    <td className="px-4 py-3 font-medium">{b.metric}</td>
                    <td className="px-4 py-3 font-bold">{b.yours}{b.unit}</td>
                    <td className="px-4 py-3 text-gray-400">{b.industryAvg}{b.unit}</td>
                    <td className="px-4 py-3 text-green-400">{b.top10}{b.unit}</td>
                    <td className={`px-4 py-3 font-bold ${
                      b.higherIsBetter
                        ? (diff > 0 ? "text-green-400" : "text-red-400")
                        : (diff < 0 ? "text-green-400" : "text-red-400")
                    }`}>
                      {diff > 0 ? "+" : ""}{pct}%
                      {b.higherIsBetter ? (diff > 0 ? " ✅" : " ⚠️") : (diff < 0 ? " ✅" : " ⚠️")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "trends" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data?.foodTrends ?? []).map((trend, i) => (
            <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-2xl mb-1">{trend.icon}</div>
                  <h3 className="font-bold text-lg">{trend.name}</h3>
                  <div className="text-gray-400 text-sm">{trend.category}</div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-2xl ${trend.growth > 0 ? "text-green-400" : "text-red-400"}`}>
                    {trend.growth > 0 ? "+" : ""}{trend.growth}%
                  </div>
                  <div className="text-xs text-gray-400">vs. luna trecută</div>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className={`h-2 rounded-full ${trend.popularity > 70 ? "bg-green-500" : trend.popularity > 40 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${trend.popularity}%` }} />
              </div>
              <div className="text-xs text-gray-400 mt-1">Popularitate: {trend.popularity}%</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "costs" && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                {["Ingredient", "Preț Curent", "Preț Acum 30 zile", "Variație", "Forecast", "Acțiune"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.ingredientCostTrends ?? []).map((item, i) => {
                const change = item.currentCost - item.previousCost;
                const pct = item.previousCost > 0 ? (change / item.previousCost * 100).toFixed(1) : 0;
                return (
                  <tr key={i} className="border-t border-gray-700">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3">{item.currentCost.toFixed(2)} lei/{item.unit}</td>
                    <td className="px-4 py-3 text-gray-400">{item.previousCost.toFixed(2)} lei/{item.unit}</td>
                    <td className={`px-4 py-3 font-bold ${change > 0 ? "text-red-400" : change < 0 ? "text-green-400" : "text-gray-400"}`}>
                      {change > 0 ? "+" : ""}{pct}%
                    </td>
                    <td className={`px-4 py-3 ${item.forecast === "up" ? "text-red-400" : item.forecast === "down" ? "text-green-400" : "text-gray-400"}`}>
                      {item.forecast === "up" ? "📈 Creștere" : item.forecast === "down" ? "📉 Scădere" : "➡️ Stabil"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-300">{item.action}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "peak" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h2 className="text-lg font-semibold mb-4">⏰ Peak Hours by Day</h2>
            <div className="space-y-3">
              {(data?.peakHours ?? []).map((day, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{day.day}</span>
                    <span className="text-gray-400 text-sm">Peak: {day.peakHour}</span>
                  </div>
                  <div className="flex gap-1">
                    {day.hourlyLoad.map((load, h) => (
                      <div key={h} className="flex-1 flex flex-col items-center">
                        <div className={`w-full rounded-sm ${load > 80 ? "bg-red-500" : load > 60 ? "bg-yellow-500" : load > 30 ? "bg-green-500" : "bg-gray-700"}`}
                          style={{ height: `${Math.max(load * 0.6, 4)}px` }} title={`${h}:00 - ${load}%`} />
                        {h % 4 === 0 && <span className="text-xs text-gray-600">{h}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h2 className="text-lg font-semibold mb-4">🌍 Peak Hours by Region</h2>
            <div className="space-y-3">
              {(data?.peakByRegion ?? []).map((r, i) => (
                <div key={i} className="bg-gray-700/40 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{r.region}</span>
                    <span className="text-blue-400 font-bold">{r.peakHour}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Avg covers: {r.avgCovers} · Avg check: {r.avgCheck.toFixed(0)} lei
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
