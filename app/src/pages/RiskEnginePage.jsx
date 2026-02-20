import { useState, useEffect } from "react";

const SEVERITY_COLORS = {
  critical: "bg-red-900/30 border-red-500 text-red-300",
  high: "bg-orange-900/30 border-orange-500 text-orange-300",
  medium: "bg-yellow-900/30 border-yellow-500 text-yellow-300",
  low: "bg-blue-900/30 border-blue-500 text-blue-300",
};

export default function RiskEnginePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("alerts");

  useEffect(() => {
    fetch("/api/risk-engine")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Se încarcă...</div>;

  const tabs = [
    { id: "alerts", label: "Alerte Active", icon: "🚨" },
    { id: "fraud", label: "Fraud Intern", icon: "🕵️" },
    { id: "refunds", label: "Refund Clusters", icon: "↩️" },
    { id: "reservations", label: "Rezervări Suspecte", icon: "📅" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-2">🎯 Predictive Risk Engine</h1>
      <p className="text-gray-400 mb-6">Fraud Intern · Shrinkage · Collusion · Refund Clusters · Fake Reservations</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Alerte Critice", value: data?.criticalAlerts ?? 0, icon: "🚨", border: "border-red-500" },
          { label: "Suspiciuni Fraud", value: data?.fraudSuspicions ?? 0, icon: "🕵️", border: "border-orange-500" },
          { label: "Refund Anomalii", value: data?.refundAnomalies ?? 0, icon: "↩️", border: "border-yellow-500" },
          { label: "Risk Score Mediu", value: `${data?.avgRiskScore ?? 0}`, icon: "📊", border: data?.avgRiskScore > 70 ? "border-red-500" : "border-green-500" },
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
              activeTab === t.id ? "bg-red-700 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === "alerts" && (
        <div className="space-y-3">
          {(data?.alerts ?? []).map((alert, i) => (
            <div key={i} className={`rounded-xl border p-5 ${SEVERITY_COLORS[alert.severity] ?? "bg-gray-800 border-gray-700"}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{
                    alert.type === "fraud" ? "🕵️" :
                    alert.type === "shrinkage" ? "📦" :
                    alert.type === "collusion" ? "🤝" :
                    alert.type === "refund" ? "↩️" :
                    "⚠️"
                  }</span>
                  <div>
                    <div className="font-bold">{alert.title}</div>
                    <div className="text-sm opacity-80">{alert.location} · {alert.time}</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded text-xs font-bold bg-gray-900/50">
                  {alert.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-sm opacity-90">{alert.description}</p>
              {alert.evidence && (
                <div className="mt-2 text-xs opacity-70">📋 {alert.evidence}</div>
              )}
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1 bg-gray-800/50 hover:bg-gray-800 rounded text-xs font-medium">
                  🔍 Investighează
                </button>
                <button className="px-3 py-1 bg-gray-800/50 hover:bg-gray-800 rounded text-xs font-medium">
                  ✅ Marchează rezolvat
                </button>
              </div>
            </div>
          ))}
          {(data?.alerts ?? []).length === 0 && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center text-gray-400">
              ✅ Nicio alertă activă
            </div>
          )}
        </div>
      )}

      {activeTab === "fraud" && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                {["Angajat", "Tip Suspiciune", "Locație", "Valoare", "Frecvență", "Risk Score", "Acțiune"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.fraudSuspects ?? []).map((s, i) => (
                <tr key={i} className="border-t border-gray-700">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-orange-400">{s.suspicionType}</td>
                  <td className="px-4 py-3 text-gray-400">{s.location}</td>
                  <td className="px-4 py-3">{s.value.toFixed(0)} lei</td>
                  <td className="px-4 py-3">{s.frequency}x</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold text-lg ${s.riskScore > 70 ? "text-red-400" : s.riskScore > 40 ? "text-yellow-400" : "text-green-400"}`}>
                      {s.riskScore}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="px-2 py-1 bg-red-900 text-red-300 rounded text-xs hover:bg-red-800">
                      🔍 Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "refunds" && (
        <div className="space-y-4">
          {(data?.refundClusters ?? []).map((cluster, i) => (
            <div key={i} className={`bg-gray-800 rounded-xl border p-5 ${
              cluster.anomalyScore > 70 ? "border-red-500/50" : "border-yellow-500/50"
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold">{cluster.title}</h3>
                  <div className="text-gray-400 text-sm">{cluster.location} · {cluster.period}</div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-xl ${cluster.anomalyScore > 70 ? "text-red-400" : "text-yellow-400"}`}>
                    Score: {cluster.anomalyScore}
                  </div>
                  <div className="text-xs text-gray-400">Anomalie</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="bg-gray-700/40 rounded p-2">
                  <div className="text-gray-400">Refunduri</div>
                  <div className="font-bold">{cluster.count}</div>
                </div>
                <div className="bg-gray-700/40 rounded p-2">
                  <div className="text-gray-400">Valoare Totală</div>
                  <div className="font-bold text-red-400">{cluster.totalValue.toFixed(0)} lei</div>
                </div>
                <div className="bg-gray-700/40 rounded p-2">
                  <div className="text-gray-400">Angajat Implicat</div>
                  <div className="font-bold text-orange-400">{cluster.employee}</div>
                </div>
              </div>
              <p className="text-sm text-gray-300 mt-3">{cluster.pattern}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "reservations" && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                {["Rezervare", "Client", "Data", "Nr. Persoane", "Semnale", "Risk Score", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.suspiciousReservations ?? []).map((r, i) => (
                <tr key={i} className="border-t border-gray-700">
                  <td className="px-4 py-3 font-mono text-blue-400">#{r.id}</td>
                  <td className="px-4 py-3">{r.guestName}</td>
                  <td className="px-4 py-3 text-gray-400">{r.date}</td>
                  <td className="px-4 py-3">{r.persons}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(r.signals ?? []).map((s, si) => (
                        <span key={si} className="px-1.5 py-0.5 bg-yellow-900/50 text-yellow-300 rounded text-xs">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${r.riskScore > 70 ? "text-red-400" : r.riskScore > 40 ? "text-yellow-400" : "text-green-400"}`}>
                      {r.riskScore}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      r.flagged ? "bg-red-900 text-red-300" : "bg-gray-700 text-gray-300"
                    }`}>{r.flagged ? "🚩 Flagged" : "Normal"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
