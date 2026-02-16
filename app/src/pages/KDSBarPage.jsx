import { useState, useEffect } from "react";

export default function KDSBarPage() {
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

  const barOrders = orders
    .map((o) => ({
      ...o,
      items: (o.items || []).filter((i) => {
        const dept = i.product?.department?.name;
        return (dept === "BAR" || dept === "BUFET") && !i.ready;
      }),
    }))
    .filter((o) => o.items.length > 0);

  const markReady = (orderId, itemId) => {
    fetch(`/api/orders/${orderId}/items/${itemId}/ready`, { method: "PUT" })
      .then((r) => r.json())
      .then(() => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  items: o.items.map((i) =>
                    i.id === itemId ? { ...i, ready: true } : i
                  ),
                }
              : o
          )
        );
      })
      .catch(() => {});
  };

  const markAllReady = (order) => {
    Promise.all(
      order.items.map((item) =>
        fetch(`/api/orders/${order.id}/items/${item.id}/ready`, { method: "PUT" })
      )
    ).then(() => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? {
                ...o,
                items: o.items.map((i) =>
                  order.items.find((oi) => oi.id === i.id) ? { ...i, ready: true } : i
                ),
              }
            : o
        )
      );
    }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-cyan-400">🍹 KDS Bar / Bufet</h1>
        <div className="text-2xl font-mono text-gray-300">
          {clock.toLocaleTimeString("ro-RO")}
        </div>
      </div>

      {barOrders.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <div className="text-2xl text-gray-400">Nicio comandă pentru bar</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {barOrders.map((order) => {
            const elapsed = Math.floor(
              (Date.now() - new Date(order.createdAt).getTime()) / 60000
            );
            const urgency =
              elapsed > 20
                ? "border-red-500 bg-red-950/30"
                : elapsed > 10
                ? "border-yellow-500 bg-yellow-950/20"
                : "border-green-500 bg-green-950/20";

            return (
              <div
                key={order.id}
                className={`rounded-xl shadow-lg p-4 border-2 ${urgency}`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold">Masa {order.tableNr}</span>
                  <span className="text-sm font-mono bg-gray-800 px-2 py-1 rounded">
                    {elapsed} min
                  </span>
                </div>
                <div className="text-sm text-gray-300 mb-1">
                  #{order.id} • {order.user?.name || "—"}
                </div>
                <ul className="mt-2 space-y-1">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between text-sm items-center">
                      <span>{item.product?.name}</span>
                      <span className="font-bold">x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => markAllReady(order)}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold"
                >
                  ✔ Gata
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
