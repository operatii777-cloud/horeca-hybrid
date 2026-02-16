import { useState, useEffect, useMemo } from "react";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data.filter((o) => o.status === "closed")))
      .catch(() => {});
  }, []);

  const totalSales = useMemo(
    () => orders.reduce((sum, o) => sum + o.total, 0),
    [orders]
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">📜 Istoric Comenzi</h2>
        <div className="text-sm text-gray-400">
          {orders.length} comenzi · Total:{" "}
          <span className="text-green-400 font-bold">{totalSales} Lei</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-500">Nu există comenzi închise.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-blue-400">
                    Masa {order.tableNr}
                  </span>
                  <span className="text-xs text-gray-400">#{order.id}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      order.payMethod === "CASH"
                        ? "bg-green-900/50 text-green-300"
                        : "bg-blue-900/50 text-blue-300"
                    }`}
                  >
                    {order.payMethod}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {order.closedAt
                    ? new Date(order.closedAt).toLocaleString("ro-RO")
                    : ""}
                </div>
              </div>
              <div className="space-y-1 mb-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}× {item.product.name}
                    </span>
                    <span className="text-gray-400">
                      {item.price * item.quantity} Lei
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-right font-bold text-green-400">
                {order.total} Lei
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
