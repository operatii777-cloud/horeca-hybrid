import { useState, useEffect } from "react";

export default function WastePage() {
  const [products, setProducts] = useState([]);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    productId: "",
    quantity: 1,
    reason: "",
    date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts).catch(() => {});
    fetch("/api/waste").then((r) => r.json()).then(setEntries).catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.productId || !form.reason) return;
    fetch("/api/waste", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: Number(form.productId),
        quantity: form.quantity,
        reason: form.reason,
        date: form.date,
      }),
    })
      .then((r) => r.json())
      .then((entry) => {
        setEntries((prev) => [entry, ...prev]);
        setForm({ productId: "", quantity: 1, reason: "", date: new Date().toISOString().slice(0, 10) });
      })
      .catch(() => {});
  };

  const summary = entries.reduce((acc, e) => {
    const name = e.product?.name || "—";
    acc[name] = (acc[name] || 0) + e.quantity;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🗑️ Evidență Pierderi / Waste</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Adaugă Pierdere</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <select
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
            >
              <option value="">— Selectează produs —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
              placeholder="Cantitate"
            />
            <input
              type="text"
              placeholder="Motiv pierdere"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
            />
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
            />
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold"
            >
              ➕ Înregistrează
            </button>
          </form>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Sumar pe Produs</h2>
          {Object.keys(summary).length === 0 ? (
            <p className="text-gray-400">Nicio pierdere</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(summary).map(([name, qty]) => (
                <li key={name} className="flex justify-between">
                  <span>{name}</span>
                  <span className="font-bold text-red-400">-{qty}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-3 bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Istoric Pierderi</h2>
          {entries.length === 0 ? (
            <p className="text-gray-400">Nicio înregistrare</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="py-2">Produs</th>
                  <th className="py-2">Cantitate</th>
                  <th className="py-2">Motiv</th>
                  <th className="py-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-gray-700/50">
                    <td className="py-2 font-semibold">{e.product?.name || "—"}</td>
                    <td className="py-2 text-red-400">-{e.quantity}</td>
                    <td className="py-2 text-gray-300">{e.reason}</td>
                    <td className="py-2 text-gray-400">{e.date}</td>
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
