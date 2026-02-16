import { useState, useEffect } from "react";

const CHECKLIST_ITEMS = [
  { id: 1, category: "Temperaturi", label: "Verificare temperatură frigider (0–4°C)" },
  { id: 2, category: "Temperaturi", label: "Verificare temperatură congelator (-18°C)" },
  { id: 3, category: "Temperaturi", label: "Verificare temperatură vitrină caldă (>65°C)" },
  { id: 4, category: "Curățenie", label: "Curățare suprafețe de lucru" },
  { id: 5, category: "Curățenie", label: "Curățare echipamente (grătar, friteuză, etc.)" },
  { id: 6, category: "Curățenie", label: "Curățare podea bucătărie" },
  { id: 7, category: "Curățenie", label: "Dezinfecție toalete" },
  { id: 8, category: "Igienă Personal", label: "Spălare mâini — verificare personal" },
  { id: 9, category: "Igienă Personal", label: "Echipament protecție purtat corespunzător" },
  { id: 10, category: "Igienă Personal", label: "Verificare stare sănătate personal" },
  { id: 11, category: "Depozitare", label: "Verificare separare produse crude/gătite" },
  { id: 12, category: "Depozitare", label: "Verificare etichetare și termen valabilitate" },
  { id: 13, category: "Dăunători", label: "Verificare capcane dăunători" },
];

export default function HACCPPage() {
  const [checks, setChecks] = useState({});
  const today = new Date().toISOString().slice(0, 10);
  const [date] = useState(today);

  useEffect(() => {
    fetch(`/api/haccp?date=${today}`)
      .then((r) => r.json())
      .then((data) => {
        const map = {};
        for (const c of data) {
          map[c.itemId] = c.checkedAt;
        }
        setChecks(map);
      })
      .catch(() => {});
  }, [today]);

  const toggleCheck = (id) => {
    const checkedAt = new Date().toLocaleTimeString("ro-RO");
    fetch("/api/haccp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, itemId: id, checkedAt }),
    })
      .then((r) => r.json())
      .then((result) => {
        setChecks((prev) => {
          if (result.removed) {
            const next = { ...prev };
            delete next[id];
            return next;
          }
          return { ...prev, [id]: result.checkedAt };
        });
      })
      .catch(() => {});
  };

  const categories = [...new Set(CHECKLIST_ITEMS.map((i) => i.category))];
  const completed = Object.values(checks).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">🧪 HACCP — Checklist Zilnic</h1>
        <div className="text-gray-400">Data: {new Date(date).toLocaleDateString("ro-RO")}</div>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-700 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Progres</span>
          <span className="font-bold">
            {completed} / {CHECKLIST_ITEMS.length}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 mt-2">
          <div
            className="bg-green-500 h-3 rounded-full transition-all"
            style={{ width: `${(completed / CHECKLIST_ITEMS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat} className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-amber-400">{cat}</h2>
            <div className="space-y-3">
              {CHECKLIST_ITEMS.filter((i) => i.category === cat).map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-700/50 p-2 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={!!checks[item.id]}
                    onChange={() => toggleCheck(item.id)}
                    className="w-5 h-5 rounded accent-green-500"
                  />
                  <span className={checks[item.id] ? "line-through text-gray-500" : ""}>
                    {item.label}
                  </span>
                  {checks[item.id] && (
                    <span className="ml-auto text-xs text-gray-500">{checks[item.id]}</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
