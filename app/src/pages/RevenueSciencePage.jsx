import { useState, useEffect } from "react";

const CATEGORY_COLORS = {
  star: "bg-yellow-900/40 border-yellow-500/50 text-yellow-300",
  plowhorse: "bg-blue-900/40 border-blue-500/50 text-blue-300",
  puzzle: "bg-purple-900/40 border-purple-500/50 text-purple-300",
  dog: "bg-red-900/40 border-red-500/50 text-red-300",
};
const CATEGORY_ICONS = { star: "⭐", plowhorse: "🐴", puzzle: "🧩", dog: "🐕" };

export default function RevenueSciencePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("engineering");

  useEffect(() => {
    fetch("/api/revenue-science")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Se încarcă...</div>;

  const tabs = [
    { id: "engineering", label: "Menu Engineering", icon: "📋" },
    { id: "elasticity", label: "Price Elasticity", icon: "📈" },
    { id: "margin", label: "Margin Tracker", icon: "💰" },
    { id: "abtest", label: "A/B Test Prețuri", icon: "🧪" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-2">🔬 Revenue Science Layer</h1>
      <p className="text-gray-400 mb-6">Menu Engineering · Elasticity · Margin Tracking · A/B Pricing</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Stars (High pop/margin)", value: data?.starCount ?? 0, icon: "⭐", border: "border-yellow-500" },
          { label: "Dogs (Low pop/margin)", value: data?.dogCount ?? 0, icon: "🐕", border: "border-red-500" },
          { label: "Avg Margin", value: `${(data?.avgMargin ?? 0).toFixed(1)}%`, icon: "💰", border: "border-green-500" },
          { label: "Revenue Azi", value: `${(data?.revenueToday ?? 0).toFixed(0)} lei`, icon: "📊", border: "border-blue-500" },
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
              activeTab === t.id ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === "engineering" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {["star", "plowhorse", "puzzle", "dog"].map((cat) => (
              <div key={cat} className={`rounded-xl p-3 border ${CATEGORY_COLORS[cat]}`}>
                <div className="text-2xl mb-1">{CATEGORY_ICONS[cat]}</div>
                <div className="font-semibold capitalize">{cat === "plowhorse" ? "Plowhorse" : cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
                <div className="text-2xl font-bold">{(data?.menuItems ?? []).filter((i) => i.category === cat).length}</div>
              </div>
            ))}
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr>
                  {["Produs", "Categorie", "Popularitate", "Margin %", "Revenue", "Recomandare"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-gray-300">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.menuItems ?? []).map((item, i) => (
                  <tr key={i} className="border-t border-gray-700">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        item.category === "star" ? "bg-yellow-900 text-yellow-300" :
                        item.category === "plowhorse" ? "bg-blue-900 text-blue-300" :
                        item.category === "puzzle" ? "bg-purple-900 text-purple-300" :
                        "bg-red-900 text-red-300"
                      }`}>
                        {CATEGORY_ICONS[item.category]} {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-700 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${item.popularity}%` }} />
                        </div>
                        <span className="text-xs">{item.popularity}%</span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 font-bold ${item.margin > 50 ? "text-green-400" : item.margin > 30 ? "text-yellow-400" : "text-red-400"}`}>
                      {item.margin.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-green-400">{item.revenue.toFixed(0)} lei</td>
                    <td className="px-4 py-3 text-xs text-gray-300">{item.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === "elasticity" && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                {["Produs", "Preț Curent", "Elasticitate", "Preț Optim", "Impact Revenue", "Acțiune"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.elasticity ?? []).map((e, i) => (
                <tr key={i} className="border-t border-gray-700">
                  <td className="px-4 py-3 font-medium">{e.name}</td>
                  <td className="px-4 py-3">{e.currentPrice.toFixed(2)} lei</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${e.elasticity < -1 ? "text-red-400" : e.elasticity < 0 ? "text-yellow-400" : "text-green-400"}`}>
                      {e.elasticity.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-blue-400 font-bold">{e.optimalPrice.toFixed(2)} lei</td>
                  <td className={`px-4 py-3 font-bold ${e.revenueImpact > 0 ? "text-green-400" : "text-red-400"}`}>
                    {e.revenueImpact > 0 ? "+" : ""}{e.revenueImpact.toFixed(0)} lei
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      e.action === "increase" ? "bg-green-900 text-green-300" :
                      e.action === "decrease" ? "bg-red-900 text-red-300" :
                      "bg-gray-700 text-gray-300"
                    }`}>{e.action}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "margin" && (
        <div className="space-y-4">
          {(data?.marginByCategory ?? []).map((cat) => (
            <div key={cat.name} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">{cat.name}</h3>
                <span className={`text-xl font-bold ${cat.margin > 40 ? "text-green-400" : cat.margin > 25 ? "text-yellow-400" : "text-red-400"}`}>
                  {cat.margin.toFixed(1)}% margin
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div className={`h-3 rounded-full ${cat.margin > 40 ? "bg-green-500" : cat.margin > 25 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${Math.min(cat.margin, 100)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Revenue: {cat.revenue.toFixed(0)} lei</span>
                <span>COGS: {cat.cogs.toFixed(0)} lei</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "abtest" && (
        <div className="space-y-4">
          {(data?.abTests ?? []).map((test, i) => (
            <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{test.product}</h3>
                  <div className="text-gray-400 text-sm">Durată: {test.duration}</div>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-bold ${
                  test.status === "running" ? "bg-blue-900 text-blue-300" :
                  test.status === "completed" ? "bg-green-900 text-green-300" :
                  "bg-gray-700 text-gray-300"
                }`}>{test.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {["A", "B"].map((variant) => (
                  <div key={variant} className={`rounded-lg p-4 border ${
                    test.winner === variant ? "border-green-500 bg-green-900/10" : "border-gray-600 bg-gray-700/30"
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-lg">Variant {variant}</span>
                      {test.winner === variant && <span className="text-green-400 text-sm">🏆 Winner</span>}
                    </div>
                    <div className="text-2xl font-bold">{test[`price${variant}`].toFixed(2)} lei</div>
                    <div className="text-sm text-gray-400 mt-1">
                      Conversii: {test[`conv${variant}`]}% · Revenue: {test[`rev${variant}`].toFixed(0)} lei
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
