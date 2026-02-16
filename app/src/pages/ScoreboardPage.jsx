import { useState, useEffect } from "react";

export default function ScoreboardPage() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/orders").then((r) => r.json()).then(setOrders).catch(() => {});
    fetch("/api/users").then((r) => r.json()).then(setUsers).catch(() => {});
  }, []);

  const waiterStats = users
    .map((u) => {
      const userOrders = orders.filter((o) => o.userId === u.id && o.status === "closed");
      const totalRevenue = userOrders.reduce((s, o) => s + (o.total || 0), 0);
      return { ...u, orderCount: userOrders.length, totalRevenue };
    })
    .filter((w) => w.orderCount > 0)
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🏆 Clasament Ospătari</h1>

      <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
        {waiterStats.length === 0 ? (
          <p className="text-gray-400">Nicio vânzare înregistrată</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="py-3 w-16">#</th>
                <th className="py-3">Ospătar</th>
                <th className="py-3 text-right">Comenzi</th>
                <th className="py-3 text-right">Venit Total</th>
              </tr>
            </thead>
            <tbody>
              {waiterStats.map((w, i) => (
                <tr key={w.id} className="border-b border-gray-700/50">
                  <td className="py-3">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </td>
                  <td className="py-3 font-semibold">{w.name}</td>
                  <td className="py-3 text-right">{w.orderCount}</td>
                  <td className="py-3 text-right font-bold text-green-400">
                    {w.totalRevenue.toFixed(2)} lei
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
