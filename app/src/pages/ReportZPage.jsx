import { useState, useEffect } from "react";

export default function ReportZPage() {
  const [orders, setOrders] = useState([]);
  const [closed, setClosed] = useState(false);
  const [closedAt, setClosedAt] = useState(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => {});
  }, []);

  const closedOrders = orders.filter((o) => o.status === "closed");
  const today = new Date().toLocaleDateString("ro-RO");
  const totalCash = closedOrders
    .filter((o) => o.payMethod === "cash")
    .reduce((s, o) => s + (o.total || 0), 0);
  const totalCard = closedOrders
    .filter((o) => o.payMethod === "card")
    .reduce((s, o) => s + (o.total || 0), 0);
  const grandTotal = closedOrders.reduce((s, o) => s + (o.total || 0), 0);

  const handleClose = () => {
    setClosed(true);
    setClosedAt(new Date().toLocaleString("ro-RO"));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">📕 Raport Z (Închidere Zi)</h1>

      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <div className="text-center mb-6">
            <div className="text-gray-400 text-sm">Data</div>
            <div className="text-xl font-bold">{today}</div>
            {closed && (
              <div className="mt-2 text-green-400 text-sm">
                ✅ Zi închisă la: {closedAt}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-700">
              <span className="text-gray-300">💵 Cash</span>
              <span className="text-xl font-bold">{totalCash.toFixed(2)} lei</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-700">
              <span className="text-gray-300">💳 Card</span>
              <span className="text-xl font-bold">{totalCard.toFixed(2)} lei</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-700">
              <span className="text-gray-300">📦 Nr. Comenzi</span>
              <span className="text-xl font-bold">{closedOrders.length}</span>
            </div>
            <div className="flex justify-between items-center py-4 mt-2 bg-gray-700/50 rounded-lg px-4">
              <span className="text-lg font-semibold">TOTAL GENERAL</span>
              <span className="text-2xl font-bold text-green-400">
                {grandTotal.toFixed(2)} lei
              </span>
            </div>
          </div>

          {!closed && (
            <button
              onClick={handleClose}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold text-lg"
            >
              🔒 Închide Ziua
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
