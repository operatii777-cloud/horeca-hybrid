import { useState, useEffect } from "react";

export default function CustomerDisplayPage() {
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

  const latestOrder = orders[0];
  const readyCount = latestOrder ? (latestOrder.items || []).filter((i) => i.ready).length : 0;
  const totalCount = latestOrder ? (latestOrder.items || []).length : 0;
  const allReady = totalCount > 0 && readyCount === totalCount;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-400">🧾 Display Client</h1>
        <div className="text-2xl font-mono text-gray-300">
          {clock.toLocaleTimeString("ro-RO")}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        {!latestOrder ? (
          <div className="text-center">
            <div className="text-8xl mb-6">🛒</div>
            <div className="text-3xl text-gray-400">Bun venit!</div>
            <div className="text-xl text-gray-500 mt-2">
              Produsele comandate vor apărea aici
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl">
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
              <div className={`p-4 text-center ${
                latestOrder.status === "delivered" ? "bg-blue-600" :
                allReady ? "bg-green-600" : "bg-blue-600"
              }`}>
                <div className="text-xl">Comanda #{latestOrder.id}</div>
                <div className="text-lg text-blue-200">Masa {latestOrder.tableNr}</div>
                <div className="text-sm mt-1 opacity-80">
                  {latestOrder.status === "delivered" ? "✅ Livrată — Mulțumim!" :
                   allReady ? "🍽️ Gata de servire!" : "🔥 Se pregătește..."}
                </div>
              </div>

              {/* Progress bar */}
              <div className="px-6 pt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Progres pregătire</span>
                  <span>{readyCount}/{totalCount} gata</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 ${allReady ? "bg-green-500" : "bg-amber-500"}`}
                    style={{ width: `${totalCount > 0 ? (readyCount / totalCount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="p-6">
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="py-3 text-left text-xl">Produs</th>
                      <th className="py-3 text-center text-xl">Cant.</th>
                      <th className="py-3 text-center text-xl">Status</th>
                      <th className="py-3 text-right text-xl">Preț</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(latestOrder.items || []).map((item) => (
                      <tr key={item.id} className="border-b border-gray-700/50">
                        <td className="py-3 text-xl font-semibold">
                          {item.product?.name}
                        </td>
                        <td className="py-3 text-xl text-center">{item.quantity}</td>
                        <td className="py-3 text-center">
                          {item.ready ? (
                            <span className="text-green-400 text-xl">✅ Gata</span>
                          ) : (
                            <span className="text-yellow-400 text-xl">⏳</span>
                          )}
                        </td>
                        <td className="py-3 text-xl text-right">
                          {(item.price * item.quantity).toFixed(2)} lei
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-700/50 p-6 flex justify-between items-center">
                <span className="text-2xl font-semibold">TOTAL</span>
                <span className="text-4xl font-bold text-green-400">
                  {(latestOrder.total || 0).toFixed(2)} lei
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
