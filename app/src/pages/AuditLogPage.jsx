import { useState, useEffect } from "react";

export default function AuditLogPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => {});
  }, []);

  const timeline = orders
    .flatMap((o) => {
      const entries = [
        {
          timestamp: o.createdAt,
          user: o.user?.name || "—",
          action: "Comandă creată",
          details: `#${o.id} — Masa ${o.tableNr} — ${(o.total || 0).toFixed(2)} lei`,
        },
      ];
      if (o.status === "closed" && o.closedAt) {
        entries.push({
          timestamp: o.closedAt,
          user: o.user?.name || "—",
          action: "Comandă închisă",
          details: `#${o.id} — ${o.payMethod || "—"} — ${(o.total || 0).toFixed(2)} lei`,
        });
      }
      return entries;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">📜 Jurnal Audit</h1>

      <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
        {timeline.length === 0 ? (
          <p className="text-gray-400">Nicio acțiune înregistrată</p>
        ) : (
          <div className="space-y-3">
            {timeline.map((entry, i) => (
              <div
                key={i}
                className="flex items-start gap-4 border-b border-gray-700/50 pb-3"
              >
                <div className="text-sm text-gray-500 w-40 flex-shrink-0 font-mono">
                  {new Date(entry.timestamp).toLocaleString("ro-RO")}
                </div>
                <div className="flex-shrink-0 w-28">
                  <span className="text-sm bg-gray-700 px-2 py-1 rounded text-gray-300">
                    {entry.user}
                  </span>
                </div>
                <div>
                  <span
                    className={`text-sm font-semibold ${
                      entry.action.includes("închisă")
                        ? "text-green-400"
                        : "text-blue-400"
                    }`}
                  >
                    {entry.action}
                  </span>
                  <div className="text-sm text-gray-400">{entry.details}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
