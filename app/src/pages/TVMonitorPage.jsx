import { useState, useEffect } from "react";

export default function TVMonitorPage() {
  const [orders, setOrders] = useState([]);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const loadOrders = () => {
      fetch("/api/orders?status=open")
        .then((r) => r.json())
        .then(setOrders)
        .catch(() => {});
    };
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-400">📺 TV Monitor — Comenzi Active</h1>
        <div className="text-2xl font-mono text-gray-300">
          {clock.toLocaleTimeString("ro-RO")}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <div className="text-2xl text-gray-400">Nu există comenzi active</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map((order) => {
            const elapsed = Math.floor(
              (Date.now() - new Date(order.createdAt).getTime()) / 60000
            );
            const urgency =
              elapsed > 20 ? "border-red-500 bg-red-950/30" :
              elapsed > 10 ? "border-yellow-500 bg-yellow-950/20" :
              "border-green-500 bg-green-950/20";

            return (
              <div
                key={order.id}
                className={`rounded-xl border-2 p-4 ${urgency}`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xl font-bold">
                    Masa {order.tableNr}
                  </span>
                  <span className="text-sm text-gray-400">
                    #{order.id}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  {order.user?.name} · {elapsed} min
                </div>
                <div className="space-y-1.5">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="font-medium">
                        {item.quantity}× {item.product.name}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-gray-700 flex justify-between items-center">
                  <span className="text-lg font-bold text-green-400">
                    {order.total} Lei
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      elapsed > 20
                        ? "bg-red-700 text-white"
                        : elapsed > 10
                        ? "bg-yellow-700 text-white"
                        : "bg-green-700 text-white"
                    }`}
                  >
                    {elapsed > 20 ? "URGENT" : elapsed > 10 ? "ÎN AȘTEPTARE" : "NOU"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
