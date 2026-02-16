import { useState, useEffect } from "react";

export default function StaffReportPage() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/orders?status=open").then((r) => r.json()).then(setOrders).catch(() => {});
    fetch("/api/users").then((r) => r.json()).then(setUsers).catch(() => {});
  }, []);

  const waiterData = users.map((u) => {
    const userOrders = orders.filter((o) => o.userId === u.id);
    const totalValue = userOrders.reduce((s, o) => s + (o.total || 0), 0);
    return { ...u, openCount: userOrders.length, totalValue };
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">👥 Raport Live Ospătari</h1>

      <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="py-3">Ospătar</th>
              <th className="py-3">Rol</th>
              <th className="py-3 text-right">Comenzi Deschise</th>
              <th className="py-3 text-right">Valoare Totală</th>
            </tr>
          </thead>
          <tbody>
            {waiterData.map((w) => (
              <tr key={w.id} className="border-b border-gray-700/50">
                <td className="py-3 font-semibold">{w.name}</td>
                <td className="py-3 text-gray-400">{w.role}</td>
                <td className="py-3 text-right">{w.openCount}</td>
                <td className="py-3 text-right font-bold text-amber-400">
                  {w.totalValue.toFixed(2)} lei
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
