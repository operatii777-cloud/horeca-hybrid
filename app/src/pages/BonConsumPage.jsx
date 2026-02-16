import { useState, useEffect } from "react";

export default function BonConsumPage() {
  const [products, setProducts] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState({
    productId: "",
    quantity: 1,
    reason: "consum intern",
  });

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts).catch(() => {});
    fetch("/api/bon-consum").then((r) => r.json()).then(setVouchers).catch(() => {});
  }, []);

  const reasons = ["pierdere", "consum intern", "test"];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.productId) return;
    fetch("/api/bon-consum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: Number(form.productId),
        quantity: form.quantity,
        reason: form.reason,
      }),
    })
      .then((r) => r.json())
      .then((v) => {
        setVouchers((prev) => [v, ...prev]);
        setForm({ productId: "", quantity: 1, reason: "consum intern" });
      })
      .catch(() => {});
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🧾 Bon Consum</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Înregistrează Consum</h2>
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
            <select
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
            >
              {reasons.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold"
            >
              📉 Înregistrează
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Istoric Bonuri Consum</h2>
          {vouchers.length === 0 ? (
            <p className="text-gray-400">Niciun bon înregistrat</p>
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
                {vouchers.map((v) => (
                  <tr key={v.id} className="border-b border-gray-700/50">
                    <td className="py-2 font-semibold">{v.product?.name || "—"}</td>
                    <td className="py-2 text-red-400">-{v.quantity}</td>
                    <td className="py-2 text-gray-300">{v.reason}</td>
                    <td className="py-2 text-gray-400">
                      {new Date(v.createdAt).toLocaleString("ro-RO")}
                    </td>
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
