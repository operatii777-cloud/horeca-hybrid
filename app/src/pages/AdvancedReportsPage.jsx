import { useState, useEffect } from "react";

/**
 * Advanced Reports Page
 * Provides detailed reports: stock, consumption, sales journal, etc.
 */
export default function AdvancedReportsPage({ user, onLogout }) {
  const [activeReport, setActiveReport] = useState("sales");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const reports = [
    { id: "sales", label: "Raport Vânzări", icon: "💰" },
    { id: "stock", label: "Stocuri Curente", icon: "📦" },
    { id: "consumption", label: "Consum Materii Prime", icon: "🔥" },
    { id: "inventory", label: "Inventar", icon: "📋" },
    { id: "nir", label: "Jurnal Intrări (NIR)", icon: "📥" },
    { id: "transfers", label: "Transferuri", icon: "🔄" },
    { id: "waste", label: "Deșeuri", icon: "🗑️" },
  ];

  useEffect(() => {
    loadReport(activeReport);
  }, [activeReport]);

  const loadReport = async (reportType) => {
    setLoading(true);
    try {
      let endpoint = "";
      switch (reportType) {
        case "sales":
          endpoint = "/api/reports/sales";
          break;
        case "stock":
          endpoint = "/api/stock";
          break;
        case "consumption":
          endpoint = "/api/reports/consumption";
          break;
        case "inventory":
          endpoint = "/api/inventory";
          break;
        case "nir":
          endpoint = "/api/nir";
          break;
        case "transfers":
          endpoint = "/api/transfers";
          break;
        case "waste":
          endpoint = "/api/waste";
          break;
        default:
          endpoint = "/api/reports/sales";
      }
      
      const response = await fetch(endpoint);
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Error loading report:", err);
      setData(null);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-amber-400">Rapoarte Avansate</h1>
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

      {/* Report Type Selector */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex gap-2 overflow-x-auto">
          {reports.map(report => (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeReport === report.id
                  ? "bg-amber-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {report.icon} {report.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Se încarcă raport...</div>
        ) : (
          <>
            {activeReport === "sales" && <SalesReport data={data} />}
            {activeReport === "stock" && <StockReport data={data} />}
            {activeReport === "consumption" && <ConsumptionReport data={data} />}
            {activeReport === "inventory" && <InventoryReport data={data} />}
            {activeReport === "nir" && <NIRReport data={data} />}
            {activeReport === "transfers" && <TransfersReport data={data} />}
            {activeReport === "waste" && <WasteReport data={data} />}
          </>
        )}
      </div>
    </div>
  );
}

function SalesReport({ data }) {
  if (!data) return <div className="text-gray-400">Nu sunt date disponibile</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-gray-400 text-sm">Total Vânzări</div>
          <div className="text-3xl font-bold text-green-400 mt-1">{data.totalSales || 0} Lei</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-gray-400 text-sm">Număr Comenzi</div>
          <div className="text-3xl font-bold text-blue-400 mt-1">{data.orderCount || 0}</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-gray-400 text-sm">Valoare Medie</div>
          <div className="text-3xl font-bold text-amber-400 mt-1">
            {data.orderCount > 0 ? Math.round(data.totalSales / data.orderCount) : 0} Lei
          </div>
        </div>
      </div>

      {data.byPayMethod && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Pe Metodă de Plată</h3>
          <div className="space-y-3">
            {Object.entries(data.byPayMethod).map(([method, total]) => (
              <div key={method} className="flex justify-between items-center">
                <span className="text-gray-300">{method || "Nedefinit"}</span>
                <span className="font-bold text-xl">{total} Lei</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StockReport({ data }) {
  if (!data || !Array.isArray(data)) return <div className="text-gray-400">Nu sunt date disponibile</div>;

  const lowStock = data.filter(item => item.quantity < 10);
  const totalValue = data.reduce((sum, item) => sum + (item.quantity * (item.product?.price || 0)), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-gray-400 text-sm">Total Produse</div>
          <div className="text-3xl font-bold text-blue-400 mt-1">{data.length}</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-gray-400 text-sm">Stoc Scăzut</div>
          <div className="text-3xl font-bold text-red-400 mt-1">{lowStock.length}</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-gray-400 text-sm">Valoare Totală</div>
          <div className="text-3xl font-bold text-green-400 mt-1">{Math.round(totalValue)} Lei</div>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-red-400 mb-4">⚠️ Stoc Scăzut</h3>
          <div className="space-y-2">
            {lowStock.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-gray-700 rounded-lg p-3">
                <div>
                  <div className="font-medium">{item.product?.name || "N/A"}</div>
                  <div className="text-sm text-gray-400">
                    Departament: {item.department?.name || "N/A"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-400">{item.quantity} {item.product?.unit}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Toate Stocurile</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {data.map(item => (
            <div key={item.id} className="flex justify-between items-center bg-gray-700 rounded-lg p-3">
              <div>
                <div className="font-medium">{item.product?.name || "N/A"}</div>
                <div className="text-sm text-gray-400">
                  {item.department?.name || "N/A"} • {item.product?.price || 0} Lei/{item.product?.unit}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{item.quantity} {item.product?.unit}</div>
                <div className="text-sm text-gray-400">
                  {Math.round(item.quantity * (item.product?.price || 0))} Lei
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConsumptionReport({ data }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">Consum Materii Prime</h3>
      <p className="text-gray-400">
        Raportul de consum va fi implementat pe baza comenzilor și rețetelor.
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Aceasta va calcula automat consumul de ingrediente pe baza rețetelor și vânzărilor.
      </p>
    </div>
  );
}

function InventoryReport({ data }) {
  if (!data || !Array.isArray(data)) return <div className="text-gray-400">Nu sunt date disponibile</div>;

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">Inventare Efectuate</h3>
      {data.length === 0 ? (
        <p className="text-gray-400">Nu există inventare înregistrate</p>
      ) : (
        <div className="space-y-3">
          {data.map(inv => (
            <div key={inv.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold">{inv.name}</div>
                  <div className="text-sm text-gray-400">
                    {new Date(inv.date).toLocaleDateString("ro-RO")}
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {inv.items?.length || 0} produse
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NIRReport({ data }) {
  if (!data || !Array.isArray(data)) return <div className="text-gray-400">Nu sunt date disponibile</div>;

  const totalValue = data.reduce((sum, nir) => {
    const nirTotal = (nir.items || []).reduce((s, item) => s + (item.quantity * item.price), 0);
    return sum + nirTotal;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-gray-400 text-sm">Total NIR-uri</div>
          <div className="text-3xl font-bold text-blue-400 mt-1">{data.length}</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-gray-400 text-sm">Valoare Totală</div>
          <div className="text-3xl font-bold text-green-400 mt-1">{Math.round(totalValue)} Lei</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Jurnal Intrări</h3>
        <div className="space-y-3">
          {data.map(nir => {
            const nirTotal = (nir.items || []).reduce((s, item) => s + (item.quantity * item.price), 0);
            return (
              <div key={nir.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold">NIR #{nir.number}</div>
                    <div className="text-sm text-gray-400">
                      {nir.supplier?.name || "N/A"} • {new Date(nir.date).toLocaleDateString("ro-RO")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-400">{Math.round(nirTotal)} Lei</div>
                    <div className="text-sm text-gray-400">{nir.items?.length || 0} produse</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TransfersReport({ data }) {
  if (!data || !Array.isArray(data)) return <div className="text-gray-400">Nu sunt date disponibile</div>;

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">Transferuri între Departamente</h3>
      {data.length === 0 ? (
        <p className="text-gray-400">Nu există transferuri înregistrate</p>
      ) : (
        <div className="space-y-3">
          {data.map(transfer => (
            <div key={transfer.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">
                    {transfer.fromDepartment?.name} → {transfer.toDepartment?.name}
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(transfer.date).toLocaleDateString("ro-RO")}
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {transfer.items?.length || 0} produse
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WasteReport({ data }) {
  if (!data || !Array.isArray(data)) return <div className="text-gray-400">Nu sunt date disponibile</div>;

  const totalWaste = data.length;
  const totalValue = data.reduce((sum, item) => 
    sum + (item.quantity * (item.product?.price || 0)), 0
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-gray-400 text-sm">Total Înregistrări</div>
          <div className="text-3xl font-bold text-red-400 mt-1">{totalWaste}</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-gray-400 text-sm">Pierderi Estimate</div>
          <div className="text-3xl font-bold text-red-400 mt-1">{Math.round(totalValue)} Lei</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Detalii Deșeuri</h3>
        <div className="space-y-3">
          {data.map(waste => (
            <div key={waste.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{waste.product?.name || "N/A"}</div>
                  <div className="text-sm text-gray-400">
                    Motiv: {waste.reason} • {waste.date}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-400">
                    {waste.quantity} {waste.product?.unit}
                  </div>
                  <div className="text-sm text-gray-400">
                    {Math.round(waste.quantity * (waste.product?.price || 0))} Lei
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
