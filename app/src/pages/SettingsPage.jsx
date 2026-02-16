import { useState, useEffect } from "react";

const DEFAULTS = {
  restaurantName: "Restaurant HoReCa",
  address: "",
  cui: "",
  tablesCount: "10",
  printerKitchen: "192.168.1.100",
  printerBar: "192.168.1.101",
  printerReceipt: "192.168.1.102",
  displayMode: "dark",
  language: "ro",
  autoRefresh: "5",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {});
  }, []);

  const handleSave = () => {
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })
      .then((r) => r.json())
      .then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      })
      .catch(() => {});
  };

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const Section = ({ title, children }) => (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-amber-400">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );

  const Field = ({ label, type = "text", value, onChange, ...props }) => (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
        {...props}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">⚙️ Setări</h1>
        {saved && (
          <span className="text-green-400 font-bold">✅ Salvat!</span>
        )}
      </div>

      <div className="max-w-3xl">
        <Section title="🏪 General">
          <Field
            label="Nume Restaurant"
            value={settings.restaurantName}
            onChange={(v) => update("restaurantName", v)}
          />
          <Field
            label="Adresă"
            value={settings.address}
            onChange={(v) => update("address", v)}
            placeholder="Str. Exemplu, Nr. 1, Oraș"
          />
          <Field
            label="CUI"
            value={settings.cui}
            onChange={(v) => update("cui", v)}
            placeholder="RO12345678"
          />
          <Field
            label="Număr Mese"
            type="number"
            min="1"
            value={settings.tablesCount}
            onChange={(v) => update("tablesCount", Number(v))}
          />
        </Section>

        <Section title="🖨️ Imprimare">
          <Field
            label="IP Imprimantă Bucătărie"
            value={settings.printerKitchen}
            onChange={(v) => update("printerKitchen", v)}
          />
          <Field
            label="IP Imprimantă Bar"
            value={settings.printerBar}
            onChange={(v) => update("printerBar", v)}
          />
          <Field
            label="IP Imprimantă Bon"
            value={settings.printerReceipt}
            onChange={(v) => update("printerReceipt", v)}
          />
        </Section>

        <Section title="🖥️ Display">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Temă</label>
            <select
              value={settings.displayMode}
              onChange={(e) => update("displayMode", e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Limbă</label>
            <select
              value={settings.language}
              onChange={(e) => update("language", e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
            >
              <option value="ro">Română</option>
              <option value="en">English</option>
            </select>
          </div>
          <Field
            label="Auto-refresh (secunde)"
            type="number"
            min="1"
            value={settings.autoRefresh}
            onChange={(v) => update("autoRefresh", Number(v))}
          />
        </Section>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-lg"
        >
          💾 Salvează Setări
        </button>
      </div>
    </div>
  );
}
