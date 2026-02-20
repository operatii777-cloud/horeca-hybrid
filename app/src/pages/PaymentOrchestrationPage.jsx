import { useState, useEffect } from "react";

const PSP_COLORS = {
  stripe: "text-purple-400",
  adyen: "text-blue-400",
  worldline: "text-green-400",
  bnpl: "text-yellow-400",
};

export default function PaymentOrchestrationPage() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/payment-orchestration/stats").then((r) => r.json()),
      fetch("/api/payment-orchestration/transactions").then((r) => r.json()),
    ])
      .then(([s, t]) => { setStats(s); setTransactions(t); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Se încarcă...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-2">💳 Global Payment Orchestration</h1>
      <p className="text-gray-400 mb-6">Multi-PSP Router · Smart Routing · Fraud AI · BNPL · Gift Card Wallet</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Tranzacții", value: stats?.totalTransactions ?? 0, icon: "💰", border: "border-blue-500" },
          { label: "Succes Rate", value: `${stats?.successRate ?? 0}%`, icon: "✅", border: "border-green-500" },
          { label: "Fraud Detected", value: stats?.fraudDetected ?? 0, icon: "🚨", border: "border-red-500" },
          { label: "Avg Fee Saved", value: `${(stats?.avgFeeSaved ?? 0).toFixed(2)}%`, icon: "📉", border: "border-yellow-500" },
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
          <h2 className="text-lg font-semibold mb-4">PSP Performance</h2>
          {(stats?.pspStats ?? []).map((p) => (
            <div key={p.name} className="mb-4">
              <div className="flex justify-between mb-1">
                <span className={`font-semibold ${PSP_COLORS[p.name.toLowerCase()] ?? "text-white"}`}>{p.name}</span>
                <span className="text-sm text-gray-400">{p.share}% · {p.fee}% fee</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${p.share}%` }} />
              </div>
              <div className="text-xs text-gray-500 mt-1">Uptime: {p.uptime}% · Latency: {p.latency}ms</div>
            </div>
          ))}
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h2 className="text-lg font-semibold mb-4">Smart Routing Rules</h2>
          <div className="space-y-3 text-sm">
            {(stats?.routingRules ?? []).map((r, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-700/50 rounded-lg p-3">
                <span className="text-2xl">{r.icon}</span>
                <div>
                  <div className="font-medium">{r.condition}</div>
                  <div className="text-gray-400">→ {r.action}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Tranzacții Recente</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-700">
            <tr>
              {["ID", "Amount", "PSP", "Method", "Status", "Fraud Score", "Time"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-gray-300">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-t border-gray-700">
                <td className="px-4 py-3 font-mono text-blue-400">#{t.id}</td>
                <td className="px-4 py-3 font-semibold">{t.amount.toFixed(2)} {t.currency}</td>
                <td className={`px-4 py-3 font-medium ${PSP_COLORS[t.psp?.toLowerCase()] ?? "text-white"}`}>{t.psp}</td>
                <td className="px-4 py-3 text-gray-400">{t.method}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    t.status === "success" ? "bg-green-900 text-green-300" :
                    t.status === "failed" ? "bg-red-900 text-red-300" :
                    "bg-yellow-900 text-yellow-300"
                  }`}>{t.status}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`font-bold ${t.fraudScore > 70 ? "text-red-400" : t.fraudScore > 40 ? "text-yellow-400" : "text-green-400"}`}>
                    {t.fraudScore}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{new Date(t.createdAt).toLocaleTimeString("ro-RO")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
