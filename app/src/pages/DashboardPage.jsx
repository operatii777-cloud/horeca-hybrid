import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState([]);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts).catch(() => {});
    fetch("/api/orders").then((r) => r.json()).then(setOrders).catch(() => {});
    fetch("/api/stock").then((r) => r.json()).then(setStock).catch(() => {});
  }, []);

  const today = new Date().toDateString();
  const openOrders = orders.filter((o) => o.status === "open" || o.status === "delivered");
  const closedToday = orders.filter(
    (o) => o.status === "closed" && o.closedAt && new Date(o.closedAt).toDateString() === today
  );
  const revenueToday = closedToday.reduce((s, o) => s + (o.total || 0), 0);

  const cards = [
    { label: "Total Produse", value: products.length, border: "border-blue-500", icon: "📦" },
    { label: "Comenzi Deschise", value: openOrders.length, border: "border-green-500", icon: "🟢" },
    { label: "Închise Azi", value: closedToday.length, border: "border-amber-500", icon: "✅" },
    { label: "Venit Azi", value: `${revenueToday.toFixed(2)} lei`, border: "border-red-500", icon: "💰" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">📊 Dashboard Operațional</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`bg-gray-800 rounded-xl shadow-lg p-6 border ${c.border}`}>
            <div className="text-4xl mb-2">{c.icon}</div>
            <div className="text-gray-400 text-sm">{c.label}</div>
            <div className="text-2xl font-bold mt-1">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Ultimele Comenzi Deschise</h2>
          {openOrders.length === 0 ? (
            <p className="text-gray-400">Nicio comandă deschisă</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="py-2">ID</th>
                  <th className="py-2">Masa</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Ora</th>
                </tr>
              </thead>
              <tbody>
                {openOrders.slice(0, 10).map((o) => (
                  <tr key={o.id} className="border-b border-gray-700/50">
                    <td className="py-2">#{o.id}</td>
                    <td className="py-2">{o.tableNr}</td>
                    <td className="py-2">{(o.total || 0).toFixed(2)} lei</td>
                    <td className="py-2">{new Date(o.createdAt).toLocaleTimeString("ro-RO")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Stoc Scăzut</h2>
          {stock.filter((s) => s.quantity < 5).length === 0 ? (
            <p className="text-gray-400">Niciun produs cu stoc scăzut</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="py-2">Produs</th>
                  <th className="py-2">Cantitate</th>
                </tr>
              </thead>
              <tbody>
                {stock.filter((s) => s.quantity < 5).map((s) => (
                  <tr key={s.id} className="border-b border-gray-700/50">
                    <td className="py-2">{s.product?.name || `#${s.productId}`}</td>
                    <td className="py-2 text-red-400 font-bold">{s.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
