import { useState, useEffect } from "react";

export default function TablePlanPage() {
  const [orders, setOrders] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    const load = () => {
      fetch("/api/orders?status=open")
        .then((r) => r.json())
        .then(setOrders)
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const tables = Array.from({ length: 10 }, (_, i) => i + 1);
  const occupiedMap = {};
  orders.forEach((o) => {
    if (o.tableNr) occupiedMap[o.tableNr] = o;
  });

  const selectedOrder = selectedTable ? occupiedMap[selectedTable] : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🗺️ Plan Mese</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-8">
        {tables.map((t) => {
          const occupied = !!occupiedMap[t];
          return (
            <button
              key={t}
              onClick={() => setSelectedTable(t)}
              className={`rounded-2xl shadow-lg p-8 text-center transition-all border-2 ${
                occupied
                  ? "bg-red-900/40 border-red-500 hover:bg-red-900/60"
                  : "bg-green-900/30 border-green-500 hover:bg-green-900/50"
              } ${selectedTable === t ? "ring-4 ring-white/50" : ""}`}
            >
              <div className="text-3xl font-bold mb-1">{t}</div>
              <div className="text-sm">{occupied ? "Ocupată" : "Liberă"}</div>
            </button>
          );
        })}
      </div>

      {selectedTable && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Masa {selectedTable}</h2>
              <button
                onClick={() => setSelectedTable(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
            {selectedOrder ? (
              <div>
                <div className="text-sm text-gray-400 mb-3">
                  Comanda #{selectedOrder.id} • {selectedOrder.user?.name || "—"}
                </div>
                <ul className="space-y-1 mb-4">
                  {(selectedOrder.items || []).map((item) => (
                    <li key={item.id} className="flex justify-between text-sm">
                      <span>{item.product?.name}</span>
                      <span>
                        x{item.quantity} — {(item.price * item.quantity).toFixed(2)} lei
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="text-right font-bold text-lg text-green-400">
                  Total: {(selectedOrder.total || 0).toFixed(2)} lei
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Masa este liberă.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
