import { useState, useEffect } from "react";

const PAY_METHODS = [
  { id: "CASH", label: "Cash", icon: "💵", color: "bg-green-700 hover:bg-green-600" },
  { id: "CARD", label: "Card", icon: "💳", color: "bg-blue-700 hover:bg-blue-600" },
  { id: "VOUCHER", label: "Voucher", icon: "🎫", color: "bg-purple-700 hover:bg-purple-600" },
  { id: "DISCOUNT", label: "Discount", icon: "🏷️", color: "bg-yellow-700 hover:bg-yellow-600" },
  { id: "PROTOCOL", label: "Protocol", icon: "📋", color: "bg-gray-600 hover:bg-gray-500" },
];

export default function TablePlanPage() {
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [clock, setClock] = useState(new Date());
  const [paySuccess, setPaySuccess] = useState(null);

  useEffect(() => {
    const load = () => {
      Promise.all([
        fetch("/api/orders?status=open").then((r) => r.json()),
        fetch("/api/orders?status=delivered").then((r) => r.json()),
      ])
        .then(([openOrders, deliveredOrders]) => {
          setOrders([...openOrders, ...deliveredOrders]);
        })
        .catch(() => {});
      fetch("/api/reservations").then((r) => r.json()).then(setReservations).catch(() => {});
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const closeOrder = async (orderId, payMethod) => {
    const order = orders.find((o) => o.id === orderId);
    const res = await fetch(`/api/orders/${orderId}/close`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payMethod }),
    });
    const closed = await res.json();
    setSelectedTable(null);
    setPaySuccess({ orderId, payMethod, total: closed.total || order?.total || 0, tableNr: closed.tableNr || order?.tableNr });
    setTimeout(() => setPaySuccess(null), 4000);
    // Reload orders
    Promise.all([
      fetch("/api/orders?status=open").then((r) => r.json()),
      fetch("/api/orders?status=delivered").then((r) => r.json()),
    ])
      .then(([openOrders, deliveredOrders]) => {
        setOrders([...openOrders, ...deliveredOrders]);
      })
      .catch(() => {});
  };

  const tables = Array.from({ length: 10 }, (_, i) => i + 1);

  const occupiedMap = {};
  orders.forEach((o) => {
    if (o.tableNr) occupiedMap[o.tableNr] = o;
  });

  const today = new Date().toISOString().slice(0, 10);
  const reservedTables = new Set(
    reservations
      .filter((r) => r.date === today)
      .map((r) => r.tableNr)
  );

  const selectedOrder = selectedTable ? occupiedMap[selectedTable] : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Payment success overlay */}
      {paySuccess && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-8 border-2 border-green-500 text-center max-w-sm">
            <div className="text-6xl mb-4">✅</div>
            <div className="text-2xl font-bold text-green-400 mb-2">Plată confirmată!</div>
            <div className="text-gray-300 mb-1">Comanda #{paySuccess.orderId} • Masa {paySuccess.tableNr}</div>
            <div className="text-3xl font-bold text-white mb-2">{paySuccess.total} Lei</div>
            <div className="text-sm text-gray-400">
              Metoda: {PAY_METHODS.find((p) => p.id === paySuccess.payMethod)?.icon}{" "}
              {PAY_METHODS.find((p) => p.id === paySuccess.payMethod)?.label}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">🗺️ Plan Mese</h1>
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-red-500 inline-block"></span> Ocupată</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-blue-500 inline-block"></span> Rezervată</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-green-500 inline-block"></span> Liberă</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-8">
        {tables.map((t) => {
          const occupied = !!occupiedMap[t];
          const reserved = !occupied && reservedTables.has(t);
          const order = occupiedMap[t];
          const elapsed = order
            ? Math.floor((clock.getTime() - new Date(order.createdAt).getTime()) / 60000)
            : 0;

          let bgClass, borderClass, statusText;
          if (occupied) {
            bgClass = "bg-red-900/40";
            borderClass = "border-red-500";
            statusText = "Ocupată";
          } else if (reserved) {
            bgClass = "bg-blue-900/40";
            borderClass = "border-blue-500";
            statusText = "Rezervată";
          } else {
            bgClass = "bg-green-900/30";
            borderClass = "border-green-500";
            statusText = "Liberă";
          }

          return (
            <button
              key={t}
              onClick={() => setSelectedTable(t)}
              className={`rounded-2xl shadow-lg p-6 text-center transition-all border-2 ${bgClass} ${borderClass} hover:opacity-80 ${
                selectedTable === t ? "ring-4 ring-white/50" : ""
              }`}
            >
              <div className="text-3xl font-bold mb-1">{t}</div>
              <div className="text-sm">{statusText}</div>
              {occupied && (
                <div className="mt-2 text-xs font-mono bg-black/30 rounded px-2 py-1">
                  ⏱️ {elapsed} min
                </div>
              )}
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
                <div className="text-sm text-gray-400 mb-1">
                  Comanda #{selectedOrder.id} • {selectedOrder.user?.name || "—"}
                </div>
                <div className="text-sm mb-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    selectedOrder.status === "delivered" ? "bg-blue-600" : "bg-yellow-600"
                  }`}>
                    {selectedOrder.status === "delivered" ? "Livrată" : "În pregătire"}
                  </span>
                  {selectedOrder.source && selectedOrder.source !== "pos" && (
                    <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-600">
                      {selectedOrder.source === "qr" ? "📱 QR" : "📋 Ospătar"}
                    </span>
                  )}
                </div>
                <ul className="space-y-1 mb-4">
                  {(selectedOrder.items || []).map((item) => (
                    <li key={item.id} className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        {item.ready ? <span className="text-green-400">✓</span> : <span className="text-yellow-400">⏳</span>}
                        {item.quantity}× {item.product?.name}
                      </span>
                      <span>
                        {(item.price * item.quantity).toFixed(2)} lei
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-gray-700 pt-3 mb-4">
                  <div className="flex justify-between font-bold text-lg text-green-400">
                    <span>Total:</span>
                    <span>{(selectedOrder.total || 0).toFixed(2)} lei</span>
                  </div>
                </div>
                
                {/* Payment section for delivered orders */}
                {selectedOrder.status === "delivered" && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-gray-300">💰 Încasare</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {PAY_METHODS.map((pm) => (
                        <button
                          key={pm.id}
                          onClick={() => closeOrder(selectedOrder.id, pm.id)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold ${pm.color} flex items-center justify-center gap-1`}
                        >
                          <span>{pm.icon}</span>
                          <span>{pm.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : reservedTables.has(selectedTable) ? (
              <div>
                <div className="text-blue-400 font-semibold mb-2">📅 Masă rezervată</div>
                {reservations
                  .filter((r) => r.date === today && r.tableNr === selectedTable)
                  .map((r) => (
                    <div key={r.id} className="bg-gray-700/50 rounded-lg p-3 mb-2">
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-sm text-gray-400">
                        {r.time} • {r.guests} persoane • {r.phone || "—"}
                      </div>
                    </div>
                  ))}
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
