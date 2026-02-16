import { useState, useEffect } from "react";

export default function ShiftHandoverPage() {
  const [handovers, setHandovers] = useState([]);
  const [form, setForm] = useState({
    notes: "",
    cashInDrawer: "",
    issues: "",
  });
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    fetch("/api/shift-handovers").then((r) => r.json()).then(setHandovers).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.notes && !form.cashInDrawer) return;
    fetch("/api/shift-handovers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((r) => r.json())
      .then((h) => {
        setHandovers((prev) => [h, ...prev]);
        setForm({ notes: "", cashInDrawer: "", issues: "" });
      })
      .catch(() => {});
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">🔄 Predare Schimb</h1>
        <div className="text-xl font-mono text-gray-300">
          {clock.toLocaleTimeString("ro-RO")}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Formular Predare</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Note schimb</label>
              <textarea
                rows={4}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
                placeholder="Note importante pentru schimbul următor..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Cash în sertar (lei)</label>
              <input
                type="number"
                step="0.01"
                value={form.cashInDrawer}
                onChange={(e) => setForm({ ...form, cashInDrawer: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Probleme / Observații</label>
              <textarea
                rows={3}
                value={form.issues}
                onChange={(e) => setForm({ ...form, issues: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
                placeholder="Probleme tehnice, reclamații, etc."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold"
            >
              ✅ Salvează Predare
            </button>
          </form>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Istoric Predări</h2>
          {handovers.length === 0 ? (
            <p className="text-gray-400">Nicio predare înregistrată</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {handovers.map((h) => (
                <div key={h.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="text-sm text-gray-400 mb-2">{new Date(h.createdAt).toLocaleString("ro-RO")}</div>
                  {h.notes && <p className="mb-1"><span className="text-gray-400">Note:</span> {h.notes}</p>}
                  {h.cashInDrawer && (
                    <p className="mb-1">
                      <span className="text-gray-400">Cash:</span>{" "}
                      <span className="text-green-400 font-bold">{h.cashInDrawer} lei</span>
                    </p>
                  )}
                  {h.issues && (
                    <p className="text-red-400 text-sm">⚠️ {h.issues}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
