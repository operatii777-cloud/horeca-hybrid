import { useState, useEffect } from "react";

export default function ApiEconomyPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetch("/api/api-economy")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Se încarcă...</div>;

  const tabs = [
    { id: "overview", label: "Overview", icon: "🌐" },
    { id: "keys", label: "API Keys", icon: "🔑" },
    { id: "marketplace", label: "Marketplace", icon: "🛒" },
    { id: "docs", label: "Documentație", icon: "📚" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-2">🌐 API Economy Mode</h1>
      <p className="text-gray-400 mb-6">Developer Portal · API Monetization · Plugin Marketplace · Revenue Share</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active API Keys", value: data?.activeKeys ?? 0, icon: "🔑", border: "border-blue-500" },
          { label: "API Calls/Day", value: `${(data?.callsToday ?? 0).toLocaleString()}`, icon: "📡", border: "border-green-500" },
          { label: "Revenue API", value: `${(data?.apiRevenue ?? 0).toFixed(0)} lei`, icon: "💰", border: "border-yellow-500" },
          { label: "Plugins Active", value: data?.activePlugins ?? 0, icon: "🔌", border: "border-purple-500" },
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

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h2 className="text-lg font-semibold mb-4">📊 API Usage (Top Endpoints)</h2>
            <div className="space-y-3">
              {(data?.topEndpoints ?? []).map((e, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="font-mono text-sm text-blue-400">{e.endpoint}</span>
                    <span className="text-sm text-gray-400">{e.calls.toLocaleString()} calls</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(e.calls / Math.max(...(data?.topEndpoints ?? []).map(x => x.calls), 1)) * 100}%` }} />
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Avg latency: {e.latency}ms · Error rate: {e.errorRate}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h2 className="text-lg font-semibold mb-4">💰 Revenue Streams</h2>
            <div className="space-y-3">
              {(data?.revenueStreams ?? []).map((s, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-700/40 rounded-lg p-3">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-gray-400">{s.model}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-400">{s.revenue.toFixed(0)} lei</div>
                    <div className="text-xs text-gray-400">{s.share}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "keys" && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                {["Developer", "API Key", "Plan", "Calls Today", "Rate Limit", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.apiKeys ?? []).map((k, i) => (
                <tr key={i} className="border-t border-gray-700">
                  <td className="px-4 py-3 font-medium">{k.developer}</td>
                  <td className="px-4 py-3 font-mono text-blue-400 text-xs">{k.key}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      k.plan === "enterprise" ? "bg-purple-900 text-purple-300" :
                      k.plan === "pro" ? "bg-blue-900 text-blue-300" :
                      "bg-gray-700 text-gray-300"
                    }`}>{k.plan}</span>
                  </td>
                  <td className="px-4 py-3">{k.callsToday.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-400">{k.rateLimit}/min</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${k.active ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                      {k.active ? "ACTIV" : "SUSPENDAT"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "marketplace" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.plugins ?? []).map((p) => (
            <div key={p.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="text-3xl">{p.icon}</div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${p.installed ? "bg-green-900 text-green-300" : "bg-gray-700 text-gray-400"}`}>
                  {p.installed ? "Instalat" : "Disponibil"}
                </span>
              </div>
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-gray-400 text-sm mt-1">{p.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-yellow-400">⭐ {p.rating.toFixed(1)}</span>
                <span className="font-bold text-green-400">{p.price === 0 ? "Gratuit" : `${p.price} lei/lună`}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">{p.installs.toLocaleString()} instalări</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "docs" && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-bold mb-4">📚 API Documentation</h2>
          <div className="space-y-4">
            {(data?.endpoints ?? []).map((endpoint, i) => (
              <div key={i} className="border border-gray-700 rounded-lg overflow-hidden">
                <div className="flex items-center gap-3 p-4 bg-gray-700/50">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    endpoint.method === "GET" ? "bg-blue-900 text-blue-300" :
                    endpoint.method === "POST" ? "bg-green-900 text-green-300" :
                    endpoint.method === "PUT" ? "bg-yellow-900 text-yellow-300" :
                    "bg-red-900 text-red-300"
                  }`}>{endpoint.method}</span>
                  <span className="font-mono text-blue-400">{endpoint.path}</span>
                  <span className="text-gray-400 text-sm ml-auto">{endpoint.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
