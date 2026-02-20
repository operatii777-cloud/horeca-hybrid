import { useState, useEffect } from "react";

export default function DarkKitchenPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("brands");

  useEffect(() => {
    fetch("/api/dark-kitchen")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Se încarcă...</div>;

  const tabs = [
    { id: "brands", label: "Virtual Brands", icon: "🏷️" },
    { id: "menus", label: "Ghost Menus", icon: "👻" },
    { id: "allocation", label: "Cost Allocation", icon: "💰" },
    { id: "performance", label: "Performance", icon: "📊" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-2">🌑 Dark Kitchen & Cloud Kitchen</h1>
      <p className="text-gray-400 mb-6">Virtual Brands · Ghost Menus · Cost Allocation · Delivery Analytics</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Virtual Brands", value: data?.brandCount ?? 0, icon: "🏷️", border: "border-purple-500" },
          { label: "Active Menus", value: data?.activeMenus ?? 0, icon: "📋", border: "border-blue-500" },
          { label: "Revenue Total", value: `${(data?.totalRevenue ?? 0).toFixed(0)} lei`, icon: "💰", border: "border-green-500" },
          { label: "Delivery Platforms", value: data?.platforms ?? 0, icon: "🛵", border: "border-yellow-500" },
        ].map((c) => (
          <div key={c.label} className={`bg-gray-800 rounded-xl p-4 border ${c.border}`}>
            <div className="text-3xl mb-1">{c.icon}</div>
            <div className="text-gray-400 text-sm">{c.label}</div>
            <div className="text-2xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === t.id ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === "brands" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.brands ?? []).map((b) => (
            <div key={b.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-2xl mb-1">{b.icon}</div>
                  <h3 className="text-lg font-bold">{b.name}</h3>
                  <div className="text-gray-400 text-sm">{b.cuisine}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${b.active ? "bg-green-900 text-green-300" : "bg-gray-700 text-gray-400"}`}>
                  {b.active ? "ACTIV" : "INACTIV"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-700/40 rounded-lg p-2">
                  <div className="text-gray-400">Revenue</div>
                  <div className="font-bold text-green-400">{b.revenue.toFixed(0)} lei</div>
                </div>
                <div className="bg-gray-700/40 rounded-lg p-2">
                  <div className="text-gray-400">Orders</div>
                  <div className="font-bold">{b.orders}</div>
                </div>
                <div className="bg-gray-700/40 rounded-lg p-2">
                  <div className="text-gray-400">Avg Order</div>
                  <div className="font-bold">{b.avgOrder.toFixed(0)} lei</div>
                </div>
                <div className="bg-gray-700/40 rounded-lg p-2">
                  <div className="text-gray-400">Rating</div>
                  <div className="font-bold text-yellow-400">⭐ {b.rating.toFixed(1)}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Platforms: {b.platforms.join(", ")}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "menus" && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                {["Brand", "Produs", "Preț", "Platform", "Status", "Comenzi"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.ghostMenuItems ?? []).map((item, i) => (
                <tr key={i} className="border-t border-gray-700">
                  <td className="px-4 py-3 text-purple-400 font-medium">{item.brand}</td>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.price.toFixed(2)} lei</td>
                  <td className="px-4 py-3 text-blue-400">{item.platform}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.active ? "bg-green-900 text-green-300" : "bg-gray-700 text-gray-400"}`}>
                      {item.active ? "activ" : "inactiv"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "allocation" && (
        <div className="space-y-4">
          {(data?.costAllocation ?? []).map((b) => (
            <div key={b.brand} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
              <h3 className="font-bold text-lg mb-4">{b.brand}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                {[
                  { label: "Revenue", value: `${b.revenue.toFixed(0)} lei`, color: "text-green-400" },
                  { label: "COGS", value: `${b.cogs.toFixed(0)} lei`, color: "text-red-400" },
                  { label: "Labor", value: `${b.laborCost.toFixed(0)} lei`, color: "text-yellow-400" },
                  { label: "Profit Margin", value: `${b.margin.toFixed(1)}%`, color: b.margin > 20 ? "text-green-400" : "text-red-400" },
                ].map((m) => (
                  <div key={m.label} className="bg-gray-700/40 rounded-lg p-3">
                    <div className="text-gray-400">{m.label}</div>
                    <div className={`font-bold text-xl ${m.color}`}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "performance" && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                {["Brand", "Orders", "Revenue", "Avg Order", "Rating", "Trend"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.brands ?? []).sort((a, b) => b.revenue - a.revenue).map((b) => (
                <tr key={b.id} className="border-t border-gray-700">
                  <td className="px-4 py-3 font-medium">{b.icon} {b.name}</td>
                  <td className="px-4 py-3">{b.orders}</td>
                  <td className="px-4 py-3 text-green-400 font-semibold">{b.revenue.toFixed(0)} lei</td>
                  <td className="px-4 py-3">{b.avgOrder.toFixed(0)} lei</td>
                  <td className="px-4 py-3 text-yellow-400">⭐ {b.rating.toFixed(1)}</td>
                  <td className="px-4 py-3 text-lg">{b.trend > 0 ? "📈" : b.trend < 0 ? "📉" : "➡️"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
