import { useState, useEffect } from "react";

export default function ClientMonitorPage() {
  const [orders, setOrders] = useState([]);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const load = () => {
      fetch("/api/orders?status=open")
        .then((r) => r.json())
        .then(setOrders)
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentOrder = orders[0];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-amber-400">📋 Status Comandă</h1>
        <div className="text-3xl font-mono text-gray-300">
          {clock.toLocaleTimeString("ro-RO")}
        </div>
      </div>

      {!currentOrder ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-6">⏳</div>
            <div className="text-3xl text-gray-400">Nicio comandă în preparare</div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-gray-800 rounded-xl shadow-lg p-10 border border-gray-700 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="text-5xl font-bold text-blue-400">
                  Comanda #{currentOrder.id}
                </div>
                <div className="text-2xl text-gray-400 mt-2">
                  Masa {currentOrder.tableNr}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg text-gray-400">Status</div>
                <div className="text-2xl font-bold text-yellow-400 uppercase">
                  În preparare
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <ul className="space-y-3">
                {(currentOrder.items || []).map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between text-2xl"
                  >
                    <span>{item.product?.name}</span>
                    <span className="font-bold">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-gray-700 mt-6 pt-6 text-right">
              <span className="text-3xl font-bold text-green-400">
                {(currentOrder.total || 0).toFixed(2)} lei
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
