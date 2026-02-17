import { useState, useEffect } from "react";

/**
 * Utilities and Configuration Page
 * Backup, restore, sorting, configuration settings
 */
export default function UtilitiesPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("backup");
  const [settings, setSettings] = useState({});
  const [backupStatus, setBackupStatus] = useState("");
  const [sortStatus, setSortStatus] = useState("");

  const tabs = [
    { id: "backup", label: "Backup/Restaurare", icon: "💾" },
    { id: "sort", label: "Sortări", icon: "🔢" },
    { id: "config", label: "Configurare", icon: "⚙️" },
    { id: "maintenance", label: "Întreținere", icon: "🔧" },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      const settingsObj = {};
      data.forEach(s => {
        settingsObj[s.key] = s.value;
      });
      setSettings(settingsObj);
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  };

  const saveSetting = async (key, value) => {
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: String(value) })
      });
      setSettings({ ...settings, [key]: value });
    } catch (err) {
      console.error("Error saving setting:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-amber-400">Utilități & Configurare</h1>
          <span className="text-gray-400">|</span>
          <span className="text-gray-300">{user.name}</span>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-red-700 hover:bg-red-600 transition-colors"
        >
          Ieșire
        </button>
      </header>

      {/* Tab Navigation */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-amber-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === "backup" && <BackupTab status={backupStatus} setStatus={setBackupStatus} />}
        {activeTab === "sort" && <SortTab status={sortStatus} setStatus={setSortStatus} />}
        {activeTab === "config" && <ConfigTab settings={settings} saveSetting={saveSetting} />}
        {activeTab === "maintenance" && <MaintenanceTab />}
      </div>
    </div>
  );
}

function BackupTab({ status, setStatus }) {
  const [backupList, setBackupList] = useState([]);

  useEffect(() => {
    // In a real implementation, this would list available backups
    setBackupList([
      { name: "backup-2024-02-17.db", date: "2024-02-17 10:30", size: "2.5 MB" },
      { name: "backup-2024-02-16.db", date: "2024-02-16 18:45", size: "2.4 MB" },
    ]);
  }, []);

  const createBackup = async () => {
    setStatus("Creare backup în curs...");
    // Simulate backup creation
    setTimeout(() => {
      setStatus("✓ Backup creat cu succes!");
      setTimeout(() => setStatus(""), 3000);
    }, 2000);
  };

  const downloadDatabase = () => {
    // Download the SQLite database file
    window.location.href = "/api/backup/download";
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">💾 Creare Backup</h3>
        <p className="text-gray-400 text-sm mb-4">
          Creează o copie de siguranță a bazei de date. Aceasta include toate produsele, 
          rețetele, comenzile și setările aplicației.
        </p>
        <div className="flex gap-3">
          <button
            onClick={createBackup}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Creează Backup Nou
          </button>
          <button
            onClick={downloadDatabase}
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Descarcă Baza de Date
          </button>
        </div>
        {status && (
          <div className="mt-4 p-3 bg-gray-700 rounded-lg text-sm">
            {status}
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">📂 Backup-uri Disponibile</h3>
        {backupList.length === 0 ? (
          <p className="text-gray-400 text-sm">Nu există backup-uri disponibile</p>
        ) : (
          <div className="space-y-2">
            {backupList.map((backup, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-700 rounded-lg p-4">
                <div>
                  <div className="font-medium">{backup.name}</div>
                  <div className="text-sm text-gray-400">{backup.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-2">{backup.size}</div>
                  <button className="bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded text-xs font-medium">
                    Restaurează
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">⚠️ Notă Importantă</h3>
        <p className="text-gray-400 text-sm">
          Backup-urile automate sunt recomandate să fie programate zilnic. 
          Păstrați copiile de siguranță în locuri sigure, separate de serverul principal.
          La restaurare, toate datele curente vor fi înlocuite cu cele din backup.
        </p>
      </div>
    </div>
  );
}

function SortTab({ status, setStatus }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products").then(r => r.json()),
        fetch("/api/categories").then(r => r.json())
      ]);
      setProducts(productsRes);
      setCategories(categoriesRes);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  const sortProducts = async (by) => {
    setStatus(`Sortare produse după ${by}...`);
    // Simulate sorting
    setTimeout(() => {
      setStatus(`✓ Produse sortate cu succes după ${by}!`);
      setTimeout(() => setStatus(""), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">🔢 Sortare Produse</h3>
        <p className="text-gray-400 text-sm mb-4">
          Sortați produsele pentru a le organiza mai bine în interfața de vânzare.
          Total produse: {products.length}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => sortProducts("nume")}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg text-sm font-medium"
          >
            După Nume (A-Z)
          </button>
          <button
            onClick={() => sortProducts("preț")}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg text-sm font-medium"
          >
            După Preț
          </button>
          <button
            onClick={() => sortProducts("categorie")}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg text-sm font-medium"
          >
            După Categorie
          </button>
          <button
            onClick={() => sortProducts("popularitate")}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg text-sm font-medium"
          >
            După Popularitate
          </button>
        </div>
        {status && (
          <div className="mt-4 p-3 bg-gray-700 rounded-lg text-sm">
            {status}
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">📊 Sortare Categorii</h3>
        <p className="text-gray-400 text-sm mb-4">
          Reordonați categoriile pentru afișare. Total categorii: {categories.length}
        </p>
        <div className="space-y-2">
          {categories.map((cat, idx) => (
            <div key={cat.id} className="flex items-center gap-3 bg-gray-700 rounded-lg p-3">
              <div className="text-gray-400 font-mono">{idx + 1}</div>
              <div className="flex-1 font-medium">{cat.name}</div>
              <div className="flex gap-2">
                <button className="text-gray-400 hover:text-white text-sm">↑</button>
                <button className="text-gray-400 hover:text-white text-sm">↓</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConfigTab({ settings, saveSetting }) {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (key, value) => {
    setLocalSettings({ ...localSettings, [key]: value });
  };

  const handleSave = (key) => {
    saveSetting(key, localSettings[key]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">⚙️ Setări Generale</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Nume Restaurant</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={localSettings.restaurantName || ""}
                onChange={(e) => handleChange("restaurantName", e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                placeholder="Ex: Restaurant Baron"
              />
              <button
                onClick={() => handleSave("restaurantName")}
                className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Salvează
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">TVA (%)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={localSettings.tva || "19"}
                onChange={(e) => handleChange("tva", e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={() => handleSave("tva")}
                className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Salvează
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Valută</label>
            <div className="flex gap-2">
              <select
                value={localSettings.currency || "Lei"}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
              >
                <option value="Lei">Lei (RON)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="USD">Dolar (USD)</option>
              </select>
              <button
                onClick={() => handleSave("currency")}
                className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">🖨️ Configurare Imprimare</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Tip Imprimantă</label>
            <select
              value={localSettings.printerType || "thermal"}
              onChange={(e) => {
                handleChange("printerType", e.target.value);
                handleSave("printerType");
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="thermal">Imprimantă Termică (80mm)</option>
              <option value="a4">Imprimantă A4</option>
              <option value="network">Imprimantă de Rețea</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={localSettings.autoPrint === "true"}
                onChange={(e) => {
                  handleChange("autoPrint", e.target.checked ? "true" : "false");
                  handleSave("autoPrint");
                }}
                className="w-4 h-4"
              />
              <span className="text-gray-300">Imprimare automată la confirmare comandă</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">🔔 Notificări</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={localSettings.notifyLowStock === "true"}
              onChange={(e) => {
                handleChange("notifyLowStock", e.target.checked ? "true" : "false");
                handleSave("notifyLowStock");
              }}
              className="w-4 h-4"
            />
            <span className="text-gray-300">Notificare la stoc scăzut</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={localSettings.notifyNewOrders === "true"}
              onChange={(e) => {
                handleChange("notifyNewOrders", e.target.checked ? "true" : "false");
                handleSave("notifyNewOrders");
              }}
              className="w-4 h-4"
            />
            <span className="text-gray-300">Notificare la comenzi noi</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function MaintenanceTab() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    // Simulate loading database stats
    setStats({
      databaseSize: "3.2 MB",
      totalProducts: 150,
      totalOrders: 1234,
      totalRecipes: 45,
      lastBackup: "2024-02-17 10:30"
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">📊 Statistici Sistem</h3>
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-xs">Mărime Bază Date</div>
              <div className="text-xl font-bold mt-1">{stats.databaseSize}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-xs">Total Produse</div>
              <div className="text-xl font-bold mt-1">{stats.totalProducts}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-xs">Total Comenzi</div>
              <div className="text-xl font-bold mt-1">{stats.totalOrders}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-xs">Rețete</div>
              <div className="text-xl font-bold mt-1">{stats.totalRecipes}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 col-span-2">
              <div className="text-gray-400 text-xs">Ultimul Backup</div>
              <div className="text-xl font-bold mt-1">{stats.lastBackup}</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">🔧 Operații de Întreținere</h3>
        <div className="space-y-3">
          <button className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg text-sm font-medium text-left">
            🗑️ Curățare comenzi vechi (peste 90 zile)
          </button>
          <button className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg text-sm font-medium text-left">
            🔄 Recalculare stocuri
          </button>
          <button className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg text-sm font-medium text-left">
            ✅ Verificare integritate bază de date
          </button>
          <button className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg text-sm font-medium text-left">
            📈 Optimizare performanță
          </button>
        </div>
      </div>

      <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-red-400 mb-4">⚠️ Zona Periculoasă</h3>
        <p className="text-gray-400 text-sm mb-4">
          Aceste operații sunt ireversibile. Asigurați-vă că aveți un backup recent înainte de a continua.
        </p>
        <button className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-medium">
          🗑️ Resetare Completă Bază de Date
        </button>
      </div>
    </div>
  );
}
