import { useState, useEffect } from "react";

export default function SupplyChainPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/supply-chain")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Se încarcă...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-2">🔗 Real-Time Supply Chain Network</h1>
      <p className="text-gray-400 mb-6">Cross-location intelligence · Transfer Suggestions · Supplier Scoring</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Alerte Stoc Critic", value: data?.criticalAlerts ?? 0, icon: "🚨", border: "border-red-500" },
          { label: "Transfer Suggestions", value: data?.transferSuggestions?.length ?? 0, icon: "🔄", border: "border-blue-500" },
          { label: "Furnizori Activi", value: data?.activeSuppliers ?? 0, icon: "🚚", border: "border-green-500" },
          { label: "Cost Savings Est.", value: `${(data?.estimatedSavings ?? 0).toFixed(0)} lei`, icon: "💰", border: "border-yellow-500" },
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
          <h2 className="text-lg font-semibold mb-4">🔄 Transfer Suggestions</h2>
          {(data?.transferSuggestions ?? []).length === 0 ? (
            <p className="text-gray-400 text-sm">Nicio sugestie de transfer</p>
          ) : (
            <div className="space-y-3">
              {(data?.transferSuggestions ?? []).map((t, i) => (
                <div key={i} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold">{t.product}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      t.priority === "high" ? "bg-red-900 text-red-300" : "bg-yellow-900 text-yellow-300"
                    }`}>{t.priority}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    <span className="text-green-400">{t.from}</span> → <span className="text-blue-400">{t.to}</span>
                  </div>
                  <div className="text-sm mt-1">Cantitate: <span className="text-white font-semibold">{t.quantity} {t.unit}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h2 className="text-lg font-semibold mb-4">🚚 Supplier Reliability</h2>
          {(data?.suppliers ?? []).map((s) => (
            <div key={s.name} className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="font-medium">{s.name}</span>
                <span className={`text-sm font-bold ${s.score >= 80 ? "text-green-400" : s.score >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                  {s.score}/100
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${s.score >= 80 ? "bg-green-500" : s.score >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${s.score}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">Delivery: {s.deliveryRate}% · Quality: {s.qualityScore}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">📊 Price Volatility Monitor</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-700">
            <tr>
              {["Ingredient", "Preț Curent", "Preț Anterior", "Variație", "Trend", "Alertă"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-gray-300">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data?.priceVolatility ?? []).map((p, i) => {
              const change = p.currentPrice - p.previousPrice;
              const pct = p.previousPrice > 0 ? (change / p.previousPrice * 100).toFixed(1) : 0;
              return (
                <tr key={i} className="border-t border-gray-700">
                  <td className="px-4 py-3 font-medium">{p.ingredient}</td>
                  <td className="px-4 py-3">{p.currentPrice.toFixed(2)} lei/{p.unit}</td>
                  <td className="px-4 py-3 text-gray-400">{p.previousPrice.toFixed(2)} lei/{p.unit}</td>
                  <td className={`px-4 py-3 font-bold ${change > 0 ? "text-red-400" : change < 0 ? "text-green-400" : "text-gray-400"}`}>
                    {change > 0 ? "+" : ""}{pct}%
                  </td>
                  <td className="px-4 py-3 text-lg">{change > 0 ? "📈" : change < 0 ? "📉" : "➡️"}</td>
                  <td className="px-4 py-3">
                    {Math.abs(Number(pct)) > 10 ? (
                      <span className="px-2 py-1 bg-red-900 text-red-300 rounded text-xs font-bold">⚠️ Alertă</span>
                    ) : (
                      <span className="text-gray-500 text-xs">Normal</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
