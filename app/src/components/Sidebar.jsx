import { useState } from "react";

const ADMIN_NAV = [
  {
    id: "gestiune",
    label: "Gestiune",
    icon: "📦",
    children: [
      { id: "products", label: "Produse", icon: "🛒" },
      { id: "recipes", label: "Rețete", icon: "📖" },
      { id: "suppliers", label: "Furnizori", icon: "🏭" },
      { id: "nir", label: "NIR", icon: "📥" },
      { id: "transfers", label: "Transfer", icon: "🔄" },
      { id: "returs", label: "Retur", icon: "↩️" },
      { id: "inventory", label: "Inventar", icon: "📋" },
      { id: "stock", label: "Stoc", icon: "📊" },
      { id: "categories", label: "Categorii", icon: "🏷️" },
      { id: "departments", label: "Departamente", icon: "🏢" },
      { id: "users", label: "Utilizatori", icon: "👥" },
    ],
  },
  {
    id: "vanzare",
    label: "Vânzare POS",
    icon: "💰",
    children: [
      { id: "pos", label: "Comandă Nouă", icon: "➕" },
      { id: "orders", label: "Comenzi Deschise", icon: "📝" },
      { id: "order-history", label: "Istoric Comenzi", icon: "📜" },
    ],
  },
  { id: "tv-monitor", label: "TV Monitor", icon: "📺" },
  {
    id: "rapoarte",
    label: "Rapoarte",
    icon: "📊",
    children: [
      { id: "reports", label: "Raport Vânzări", icon: "💹" },
    ],
  },
  { id: "manual", label: "Manual Instrucțiuni", icon: "📘" },
];

const WAITER_NAV = [
  {
    id: "vanzare",
    label: "Vânzare POS",
    icon: "💰",
    children: [
      { id: "pos", label: "Comandă Nouă", icon: "➕" },
      { id: "orders", label: "Comenzi Deschise", icon: "📝" },
      { id: "order-history", label: "Istoric Comenzi", icon: "📜" },
    ],
  },
  { id: "tv-monitor", label: "TV Monitor", icon: "📺" },
  { id: "manual", label: "Manual Instrucțiuni", icon: "📘" },
];

function NavMenuItem({ item, depth = 0, activeView, onNavigate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    const isChildActive = item.children.some((c) => c.id === activeView);
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            isChildActive
              ? "bg-blue-900/40 text-blue-300"
              : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
          }`}
          style={{ paddingLeft: `${12 + depth * 12}px` }}
        >
          <span className="text-base">{item.icon}</span>
          <span className="flex-1 text-left">{item.label}</span>
          <span
            className={`text-xs transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>
        {isExpanded && (
          <div className="mt-0.5 space-y-0.5">
            {item.children.map((child) => (
              <NavMenuItem
                key={child.id}
                item={child}
                depth={depth + 1}
                activeView={activeView}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => onNavigate(item.id)}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
        activeView === item.id
          ? "bg-blue-600 text-white font-medium"
          : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
      }`}
      style={{ paddingLeft: `${12 + depth * 12}px` }}
    >
      <span className="text-base">{item.icon}</span>
      <span>{item.label}</span>
    </button>
  );
}

export default function Sidebar({ user, activeView, onNavigate, onLogout }) {
  const navItems = user.role === "admin" ? ADMIN_NAV : WAITER_NAV;

  return (
    <aside className="w-56 bg-gray-800 border-r border-gray-700 flex flex-col min-h-screen">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-gray-700">
        <h1 className="text-lg font-bold text-amber-400">HoReCa Hybrid</h1>
        <div className="text-xs text-gray-400 mt-1">
          {user.role === "admin" ? "👔 Admin" : "🍽️ Ospătar"}: {user.name}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavMenuItem
            key={item.id}
            item={item}
            activeView={activeView}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
        >
          <span>🚪</span>
          <span>Ieșire</span>
        </button>
      </div>
    </aside>
  );
}
