import { useState, useEffect } from "react";

export default function ClientMonitorPage() {
  const [orders, setOrders] = useState([]);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const load = () => {
      Promise.all([
        fetch("/api/orders?status=open").then((r) => r.json()),
        fetch("/api/orders?status=delivered").then((r) => r.json()),
      ])
        .then(([open, delivered]) => setOrders([...open, ...delivered]))
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-amber-400">📋 Status Comenzi</h1>
        <div className="text-3xl font-mono text-gray-300">
          {clock.toLocaleTimeString("ro-RO")}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-6">⏳</div>
            <div className="text-3xl text-gray-400">Nicio comandă în preparare</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => {
            const readyCount = (order.items || []).filter((i) => i.ready).length;
            const totalCount = (order.items || []).length;
            const allReady = totalCount > 0 && readyCount === totalCount;
            const delivered = order.status === "delivered";
            const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);

            return (
              <div key={order.id} className={`bg-gray-800 rounded-xl shadow-lg p-6 border-2 ${
                delivered ? "border-blue-500" : allReady ? "border-green-500" : "border-yellow-500"
              }`}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-3xl font-bold text-blue-400">
                      Comanda #{order.id}
                    </div>
                    <div className="text-xl text-gray-400 mt-1">
                      Masa {order.tableNr} • {elapsed} min
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      delivered ? "text-blue-400" : allReady ? "text-green-400" : "text-yellow-400"
                    }`}>
                      {delivered ? "✅ Livrată" : allReady ? "🍽️ Gata!" : "🔥 Se pregătește"}
                    </div>
                    <div className="text-sm text-gray-400">{readyCount}/{totalCount} gata</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-700 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${
                        allReady || delivered ? "bg-green-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${totalCount > 0 ? (readyCount / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <ul className="space-y-2">
                    {(order.items || []).map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between text-xl items-center"
                      >
                        <span className="flex items-center gap-2">
                          {item.ready ? (
                            <span className="text-green-400">✅</span>
                          ) : (
                            <span className="text-yellow-400">⏳</span>
                          )}
                          {item.product?.name}
                        </span>
                        <span className="font-bold">x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-gray-700 mt-4 pt-4 text-right">
                  <span className="text-3xl font-bold text-green-400">
                    {(order.total || 0).toFixed(2)} lei
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
