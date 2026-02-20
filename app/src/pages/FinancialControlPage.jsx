import { useState, useEffect } from "react";

export default function FinancialControlPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pl");

  useEffect(() => {
    fetch("/api/financial-control")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Se încarcă...</div>;

  const tabs = [
    { id: "pl", label: "P&L Live", icon: "📊" },
    { id: "ebitda", label: "EBITDA", icon: "💰" },
    { id: "cashflow", label: "Cash Flow", icon: "💵" },
    { id: "tax", label: "Tax Forecast", icon: "📋" },
  ];

  const formatMoney = (v) => `${v >= 0 ? "" : "-"}${Math.abs(v).toLocaleString("ro-RO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} lei`;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-2">🏦 Financial Control Layer</h1>
      <p className="text-gray-400 mb-6">P&L Auto · EBITDA Live · Cash Reconciliation · Tax Forecast · COGS</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Revenue Azi", value: formatMoney(data?.revenueToday ?? 0), icon: "💰", border: "border-green-500" },
          { label: "EBITDA Margin", value: `${(data?.ebitdaMargin ?? 0).toFixed(1)}%`, icon: "📊", border: data?.ebitdaMargin > 20 ? "border-green-500" : "border-red-500" },
          { label: "Cash Balance", value: formatMoney(data?.cashBalance ?? 0), icon: "💵", border: "border-blue-500" },
          { label: "Tax Liability", value: formatMoney(data?.taxLiability ?? 0), icon: "📋", border: "border-yellow-500" },
        ].map((c) => (
          <div key={c.label} className={`bg-gray-800 rounded-xl p-4 border ${c.border}`}>
            <div className="text-3xl mb-1">{c.icon}</div>
            <div className="text-gray-400 text-sm">{c.label}</div>
            <div className="text-xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === t.id ? "bg-green-700 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === "pl" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h2 className="text-lg font-semibold mb-4">📊 P&L – Luna Curentă</h2>
            <div className="space-y-2">
              {(data?.plStatement ?? []).map((line, i) => (
                <div key={i} className={`flex justify-between items-center py-2 ${
                  line.isHeader ? "border-t border-gray-600 mt-2 pt-3 font-bold text-white" :
                  line.isTotal ? "border-t-2 border-gray-500 mt-1 pt-3 font-bold text-xl" :
                  "text-sm"
                }`}>
                  <span className={line.indent ? "pl-4 text-gray-300" : line.isHeader ? "text-gray-200" : "text-gray-400"}>
                    {line.label}
                  </span>
                  <span className={`font-medium ${
                    line.isTotal ? (line.value >= 0 ? "text-green-400" : "text-red-400") :
                    line.negative ? "text-red-400" :
                    line.value > 0 ? "text-white" : "text-gray-400"
                  }`}>
                    {formatMoney(line.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h2 className="text-lg font-semibold mb-4">📈 COGS Breakdown</h2>
            <div className="space-y-3">
              {(data?.cogsBreakdown ?? []).map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{item.category}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold">{formatMoney(item.amount)}</span>
                      <span className="text-xs text-gray-400 ml-2">({item.pct.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className={`h-2 rounded-full ${item.pct > 35 ? "bg-red-500" : item.pct > 25 ? "bg-yellow-500" : "bg-green-500"}`}
                      style={{ width: `${Math.min(item.pct * 2, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "ebitda" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Revenue", value: data?.ebitda?.revenue ?? 0, color: "text-green-400" },
              { label: "EBIT", value: data?.ebitda?.ebit ?? 0, color: "text-blue-400" },
              { label: "EBITDA", value: data?.ebitda?.ebitda ?? 0, color: "text-purple-400" },
              { label: "EBITDA %", value: `${(data?.ebitdaMargin ?? 0).toFixed(1)}%`, color: data?.ebitdaMargin > 20 ? "text-green-400" : "text-red-400", isString: true },
            ].map((m) => (
              <div key={m.label} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                <div className="text-gray-400 text-sm mb-1">{m.label}</div>
                <div className={`text-2xl font-bold ${m.color}`}>{m.isString ? m.value : formatMoney(m.value)}</div>
              </div>
            ))}
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h2 className="text-lg font-semibold mb-4">📈 EBITDA Projection (12 luni)</h2>
            <div className="flex items-end gap-2 h-48">
              {(data?.ebitdaProjection ?? []).map((m, i) => {
                const maxVal = Math.max(...(data?.ebitdaProjection ?? []).map((x) => Math.abs(x.value)), 1);
                const pct = Math.abs(m.value) / maxVal * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs text-gray-500">{m.value >= 0 ? formatMoney(m.value) : ""}</div>
                    <div className={`w-full rounded-t ${m.projected ? "opacity-50" : ""} ${m.value >= 0 ? "bg-green-500" : "bg-red-500"}`}
                      style={{ height: `${pct}%` }} title={formatMoney(m.value)} />
                    <span className="text-xs text-gray-500">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "cashflow" && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h2 className="text-lg font-semibold mb-4">💵 Cash Flow Statement</h2>
            <div className="space-y-2">
              {(data?.cashFlowStatement ?? []).map((line, i) => (
                <div key={i} className={`flex justify-between py-2 ${line.isHeader ? "border-t border-gray-600 font-bold" : "text-sm"}`}>
                  <span className={line.indent ? "pl-4 text-gray-300" : line.isHeader ? "" : "text-gray-400"}>
                    {line.label}
                  </span>
                  <span className={`font-medium ${line.value >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {formatMoney(line.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h2 className="text-lg font-semibold mb-4">🏦 Cash Reconciliation AI</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Numerar Registru", value: data?.cashReconciliation?.register ?? 0 },
                { label: "Numerar Fizic", value: data?.cashReconciliation?.physical ?? 0 },
                { label: "Diferență", value: (data?.cashReconciliation?.physical ?? 0) - (data?.cashReconciliation?.register ?? 0) },
              ].map((r) => (
                <div key={r.label} className="bg-gray-700/40 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">{r.label}</div>
                  <div className={`text-2xl font-bold mt-1 ${r.label === "Diferență" && r.value !== 0 ? "text-red-400" : "text-white"}`}>
                    {formatMoney(r.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "tax" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h2 className="text-lg font-semibold mb-4">📋 Tax Liability Forecast</h2>
            <div className="space-y-3">
              {(data?.taxForecast ?? []).map((t, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-700/40 rounded-lg p-3">
                  <div>
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.dueDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatMoney(t.amount)}</div>
                    <div className={`text-xs ${t.status === "paid" ? "text-green-400" : t.status === "due" ? "text-red-400" : "text-yellow-400"}`}>
                      {t.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h2 className="text-lg font-semibold mb-4">📊 Accrual Tracking</h2>
            <div className="space-y-3">
              {(data?.accruals ?? []).map((a, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-700/40 rounded-lg p-3">
                  <div>
                    <div className="font-medium">{a.description}</div>
                    <div className="text-xs text-gray-400">{a.period}</div>
                  </div>
                  <div className={`font-bold ${a.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {formatMoney(a.amount)}
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
