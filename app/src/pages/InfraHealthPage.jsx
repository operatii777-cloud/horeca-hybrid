import { useState, useEffect } from "react";

const STATUS_COLORS = {
  healthy: "text-green-400",
  degraded: "text-yellow-400",
  down: "text-red-400",
};
const STATUS_BG = {
  healthy: "bg-green-900/20 border-green-500/40",
  degraded: "bg-yellow-900/20 border-yellow-500/40",
  down: "bg-red-900/20 border-red-500/40",
};

export default function InfraHealthPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/infra-health")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Se încarcă...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-2">🛡️ Self-Healing Infrastructure</h1>
      <p className="text-gray-400 mb-6">Health Checks · Circuit Breakers · Auto-Scaling · Failover DB</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Servicii Healthy", value: `${data?.healthyCount ?? 0}/${data?.totalServices ?? 0}`, icon: "✅", border: "border-green-500" },
          { label: "Restarts Auto", value: data?.autoRestarts ?? 0, icon: "🔄", border: "border-blue-500" },
          { label: "Circuit Breakers", value: data?.openCircuitBreakers ?? 0, icon: "⚡", border: data?.openCircuitBreakers > 0 ? "border-red-500" : "border-gray-600" },
          { label: "Uptime", value: `${data?.uptime ?? 0}%`, icon: "🕐", border: data?.uptime >= 99.9 ? "border-green-500" : "border-yellow-500" },
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
          <h2 className="text-lg font-semibold mb-4">🔍 Service Health Status</h2>
          <div className="space-y-3">
            {(data?.services ?? []).map((s) => (
              <div key={s.name} className={`rounded-lg p-4 border ${STATUS_BG[s.status] ?? "bg-gray-700/30 border-gray-600"}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      s.status === "healthy" ? "bg-green-400" :
                      s.status === "degraded" ? "bg-yellow-400" : "bg-red-400"
                    }`} />
                    <span className="font-semibold">{s.name}</span>
                  </div>
                  <span className={`font-bold text-sm ${STATUS_COLORS[s.status] ?? "text-gray-400"}`}>
                    {s.status.toUpperCase()}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-400">
                  <span>Latency: {s.latency}ms</span>
                  <span>CPU: {s.cpu}%</span>
                  <span>Memory: {s.memory}%</span>
                </div>
                {s.lastRestart && (
                  <div className="text-xs text-yellow-400 mt-1">🔄 Restartat: {s.lastRestart}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h2 className="text-lg font-semibold mb-4">⚡ Circuit Breakers</h2>
            <div className="space-y-2">
              {(data?.circuitBreakers ?? []).map((cb) => (
                <div key={cb.service} className="flex justify-between items-center bg-gray-700/40 rounded-lg p-3">
                  <span className="font-medium">{cb.service}</span>
                  <span className={`px-3 py-1 rounded text-sm font-bold ${
                    cb.state === "closed" ? "bg-green-900 text-green-300" :
                    cb.state === "open" ? "bg-red-900 text-red-300" :
                    "bg-yellow-900 text-yellow-300"
                  }`}>{cb.state.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h2 className="text-lg font-semibold mb-4">📈 Auto-Scaling</h2>
            {(data?.scaling ?? []).map((s) => (
              <div key={s.service} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{s.service}</span>
                  <span className="text-sm text-gray-400">{s.instances} instances</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className={`h-2 rounded-full ${s.load > 80 ? "bg-red-500" : s.load > 60 ? "bg-yellow-500" : "bg-green-500"}`}
                    style={{ width: `${s.load}%` }} />
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Load: {s.load}%</div>
              </div>
            ))}
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h2 className="text-lg font-semibold mb-3">🗄️ Database Failover</h2>
            {(data?.databases ?? []).map((db) => (
              <div key={db.name} className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{db.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{db.region}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    db.role === "primary" ? "bg-blue-900 text-blue-300" : "bg-gray-700 text-gray-300"
                  }`}>{db.role}</span>
                  <span className={`w-2 h-2 rounded-full ${db.healthy ? "bg-green-400" : "bg-red-400"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
