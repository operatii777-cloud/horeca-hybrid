import { useState, useEffect } from "react";

export default function ReportXPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => {});
  }, []);

  const closed = orders.filter((o) => o.status === "closed");
  const totalCash = closed
    .filter((o) => o.payMethod === "cash")
    .reduce((s, o) => s + (o.total || 0), 0);
  const totalCard = closed
    .filter((o) => o.payMethod === "card")
    .reduce((s, o) => s + (o.total || 0), 0);
  const totalOther = closed
    .filter((o) => o.payMethod !== "cash" && o.payMethod !== "card")
    .reduce((s, o) => s + (o.total || 0), 0);
  const grandTotal = closed.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">📊 Raport X (Curent)</h1>

      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-6 text-center">Sumar Vânzări — Shift Curent</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-700">
              <span className="text-gray-300">💵 Cash</span>
              <span className="text-xl font-bold">{totalCash.toFixed(2)} lei</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-700">
              <span className="text-gray-300">💳 Card</span>
              <span className="text-xl font-bold">{totalCard.toFixed(2)} lei</span>
            </div>
            {totalOther > 0 && (
              <div className="flex justify-between items-center py-3 border-b border-gray-700">
                <span className="text-gray-300">📋 Altele</span>
                <span className="text-xl font-bold">{totalOther.toFixed(2)} lei</span>
              </div>
            )}
            <div className="flex justify-between items-center py-3 border-b border-gray-700">
              <span className="text-gray-300">📦 Nr. Comenzi</span>
              <span className="text-xl font-bold">{closed.length}</span>
            </div>
            <div className="flex justify-between items-center py-4 mt-2 bg-gray-700/50 rounded-lg px-4">
              <span className="text-lg font-semibold">TOTAL GENERAL</span>
              <span className="text-2xl font-bold text-green-400">
                {grandTotal.toFixed(2)} lei
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
