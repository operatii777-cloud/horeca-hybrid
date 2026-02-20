import { useState, useEffect } from "react";

export default function FranchisePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetch("/api/franchise")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Se încarcă...</div>;

  const tabs = [
    { id: "overview", label: "Overview", icon: "🏢" },
    { id: "compliance", label: "Compliance", icon: "✅" },
    { id: "royalty", label: "Royalty Calc", icon: "💰" },
    { id: "audit", label: "Audit", icon: "🔍" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-2">👑 Franchise Domination System</h1>
      <p className="text-gray-400 mb-6">Royalty Auto-Calc · Compliance Scoring · Brand Enforcement · KPI Automation</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Locații", value: data?.locationCount ?? 0, icon: "🏪", border: "border-blue-500" },
          { label: "Royalty Total", value: `${(data?.totalRoyalty ?? 0).toFixed(0)} lei`, icon: "💰", border: "border-green-500" },
          { label: "Avg Compliance", value: `${data?.avgCompliance ?? 0}%`, icon: "✅", border: data?.avgCompliance >= 90 ? "border-green-500" : "border-red-500" },
          { label: "Audit Pending", value: data?.auditPending ?? 0, icon: "🔍", border: "border-yellow-500" },
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
              activeTab === t.id ? "bg-orange-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.locations ?? []).map((loc) => (
            <div key={loc.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">{loc.name}</h3>
                  <div className="text-gray-400 text-sm">{loc.city} · {loc.franchisee}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  loc.complianceScore >= 90 ? "bg-green-900 text-green-300" :
                  loc.complianceScore >= 70 ? "bg-yellow-900 text-yellow-300" :
                  "bg-red-900 text-red-300"
                }`}>{loc.complianceScore}%</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Revenue</span>
                  <span className="text-green-400 font-semibold">{loc.revenue.toFixed(0)} lei</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Royalty</span>
                  <span className="text-yellow-400 font-semibold">{loc.royalty.toFixed(0)} lei</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">KPI Score</span>
                  <span className={`font-bold ${loc.kpiScore >= 80 ? "text-green-400" : loc.kpiScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                    {loc.kpiScore}/100
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "compliance" && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                {["Locație", "Brand Guidelines", "Food Safety", "Staff Training", "Cleanliness", "Overall", "Acțiune"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.complianceDetails ?? []).map((loc, i) => (
                <tr key={i} className="border-t border-gray-700">
                  <td className="px-4 py-3 font-medium">{loc.name}</td>
                  {["brandGuidelines", "foodSafety", "staffTraining", "cleanliness"].map((field) => (
                    <td key={field} className={`px-4 py-3 font-bold ${
                      loc[field] >= 90 ? "text-green-400" : loc[field] >= 70 ? "text-yellow-400" : "text-red-400"
                    }`}>{loc[field]}%</td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className={`h-2 rounded-full ${loc.overall >= 90 ? "bg-green-500" : loc.overall >= 70 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${loc.overall}%` }} />
                    </div>
                    <span className="text-xs">{loc.overall}%</span>
                  </td>
                  <td className="px-4 py-3">
                    {loc.overall < 70 ? (
                      <span className="px-2 py-1 bg-red-900 text-red-300 rounded text-xs font-bold">⚠️ Penalty</span>
                    ) : loc.overall >= 95 ? (
                      <span className="px-2 py-1 bg-green-900 text-green-300 rounded text-xs font-bold">🏆 Reward</span>
                    ) : (
                      <span className="text-gray-500 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "royalty" && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                {["Locație", "Revenue Brut", "Royalty %", "Royalty Calc", "Plătit", "Restant", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.royaltyCalc ?? []).map((r, i) => (
                <tr key={i} className="border-t border-gray-700">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">{r.revenue.toFixed(0)} lei</td>
                  <td className="px-4 py-3">{r.royaltyPct}%</td>
                  <td className="px-4 py-3 font-bold">{r.royaltyAmount.toFixed(0)} lei</td>
                  <td className="px-4 py-3 text-green-400">{r.paid.toFixed(0)} lei</td>
                  <td className={`px-4 py-3 font-bold ${r.outstanding > 0 ? "text-red-400" : "text-green-400"}`}>
                    {r.outstanding.toFixed(0)} lei
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      r.outstanding === 0 ? "bg-green-900 text-green-300" :
                      r.outstanding > 0 ? "bg-red-900 text-red-300" :
                      "bg-gray-700 text-gray-300"
                    }`}>{r.outstanding === 0 ? "✅ Plătit" : "⏳ Restant"}</span>
                  </td>
                </tr>
              ))}
              <tr className="border-t border-gray-600 bg-gray-700/50">
                <td className="px-4 py-3 font-bold">TOTAL</td>
                <td className="px-4 py-3 font-bold">{(data?.royaltyCalc ?? []).reduce((s, r) => s + r.revenue, 0).toFixed(0)} lei</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3 font-bold">{(data?.royaltyCalc ?? []).reduce((s, r) => s + r.royaltyAmount, 0).toFixed(0)} lei</td>
                <td className="px-4 py-3 text-green-400 font-bold">{(data?.royaltyCalc ?? []).reduce((s, r) => s + r.paid, 0).toFixed(0)} lei</td>
                <td className="px-4 py-3 text-red-400 font-bold">{(data?.royaltyCalc ?? []).reduce((s, r) => s + r.outstanding, 0).toFixed(0)} lei</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="space-y-4">
          {(data?.auditItems ?? []).map((a, i) => (
            <div key={i} className={`bg-gray-800 rounded-xl border p-5 ${
              a.status === "critical" ? "border-red-500/50" :
              a.status === "warning" ? "border-yellow-500/50" :
              a.status === "ok" ? "border-green-500/50" :
              "border-gray-700"
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{a.location}</h3>
                  <div className="text-gray-400 text-sm">{a.type} · {a.date}</div>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-bold ${
                  a.status === "critical" ? "bg-red-900 text-red-300" :
                  a.status === "warning" ? "bg-yellow-900 text-yellow-300" :
                  a.status === "ok" ? "bg-green-900 text-green-300" :
                  "bg-gray-700 text-gray-300"
                }`}>{a.status}</span>
              </div>
              <p className="text-gray-300 mt-3 text-sm">{a.findings}</p>
              {a.action && <div className="mt-2 text-sm text-blue-400">→ {a.action}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
