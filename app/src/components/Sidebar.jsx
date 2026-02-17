import { useState } from "react";

/* ─── Menu structure mirroring restaurant-horeca-app KioskSidebar ─── */

const ADMIN_NAV = [
  {
    id: "operational",
    label: "Operațional",
    icon: "⚡",
    children: [
      { id: "dashboard", label: "Dashboard", icon: "📊" },
      { id: "pos", label: "POS Vânzare", icon: "🛒" },
      { id: "orders", label: "Comenzi Deschise", icon: "📦" },
      { id: "comanda-supervisor", label: "Preluare Comandă", icon: "📋" },
      { id: "table-plan", label: "Plan Mese", icon: "🗺️" },
      { id: "kds-kitchen", label: "KDS Bucătărie", icon: "👨‍🍳" },
      { id: "kds-bar", label: "KDS Bar", icon: "🍺" },
      { id: "scoreboard", label: "Scoreboard Bucătărie", icon: "🏆" },
      { id: "pontaj", label: "Pontaj (Time Clock)", icon: "⏱️" },
      { id: "staff-report", label: "Raport Ospătari Live", icon: "📋" },
    ],
  },
  {
    id: "front-desk",
    label: "Front Desk",
    icon: "🛎️",
    children: [
      { id: "reservations", label: "Rezervări", icon: "📅" },
      { id: "client-monitor", label: "Monitor Clienți", icon: "🖥️" },
    ],
  },
  {
    id: "gestiune",
    label: "Gestiune",
    icon: "📦",
    children: [
      { id: "products", label: "Catalog Produse", icon: "🛒" },
      { id: "recipes", label: "Rețetar & Fișe", icon: "📖" },
      { id: "recipe-verification", label: "Verificare Rețete", icon: "✓" },
      { id: "stock", label: "Stocuri", icon: "📊" },
      { id: "nir", label: "NIR", icon: "📥" },
      { id: "bon-consum", label: "Bon Consum", icon: "📄" },
      { id: "inventory", label: "Inventar", icon: "📋" },
      { id: "transfers", label: "Transferuri", icon: "🔄" },
      { id: "returs", label: "Retur", icon: "↩️" },
      { id: "waste", label: "Waste", icon: "🗑️" },
      { id: "suppliers", label: "Furnizori", icon: "🚚" },
      { id: "haccp", label: "HACCP & Igienizare", icon: "✅" },
      { id: "categories", label: "Categorii", icon: "🏷️" },
      { id: "departments", label: "Departamente", icon: "🏢" },
    ],
  },
  {
    id: "administrare",
    label: "Administrare",
    icon: "⚙️",
    children: [
      { id: "reports", label: "Raport Vânzări", icon: "💹" },
      { id: "advanced-reports", label: "Rapoarte Avansate", icon: "📊" },
      { id: "report-x", label: "Raport X", icon: "📈" },
      { id: "report-z", label: "Raport Z", icon: "📉" },
      { id: "shift-handover", label: "Jurnal Tură", icon: "📓" },
      { id: "orders", label: "Comenzi Deschise", icon: "📝" },
      { id: "order-history", label: "Istoric Comenzi", icon: "📜" },
      { id: "users", label: "Ospătari & Staff", icon: "👥" },
      { id: "utilities", label: "Utilități & Configurare", icon: "🔧" },
      { id: "settings", label: "Setări", icon: "⚙️" },
    ],
  },
  {
    id: "it-security",
    label: "IT & Securitate",
    icon: "🔒",
    children: [
      { id: "audit-log", label: "Audit Logs", icon: "🛡️" },
    ],
  },
  {
    id: "display",
    label: "Display",
    icon: "📺",
    children: [
      { id: "kiosk-self-service", label: "Self-Service Kiosk", icon: "🖱️" },
      { id: "feedback-terminal", label: "Feedback Terminal", icon: "😊" },
      { id: "tv-monitor", label: "TV Monitor Comenzi", icon: "📺" },
      { id: "menu-tv", label: "TV Meniu Digital", icon: "🎬" },
      { id: "customer-display", label: "Display Client (CDS)", icon: "🖥️" },
    ],
  },
  {
    id: "suport",
    label: "Suport",
    icon: "❓",
    children: [
      { id: "manual", label: "Manual Utilizare", icon: "📘" },
    ],
  },
];

const WAITER_NAV = [
  {
    id: "operational",
    label: "Operațional",
    icon: "⚡",
    children: [
      { id: "pos", label: "POS Vânzare", icon: "🛒" },
      { id: "comanda-supervisor", label: "Preluare Comandă", icon: "📋" },
      { id: "table-plan", label: "Plan Mese", icon: "🗺️" },
      { id: "orders", label: "Comenzi Deschise", icon: "📝" },
      { id: "order-history", label: "Istoric Comenzi", icon: "📜" },
    ],
  },
  {
    id: "display",
    label: "Display",
    icon: "📺",
    children: [
      { id: "kds-kitchen", label: "KDS Bucătărie", icon: "👨‍🍳" },
      { id: "kds-bar", label: "KDS Bar", icon: "🍺" },
      { id: "tv-monitor", label: "TV Monitor Comenzi", icon: "📺" },
    ],
  },
  {
    id: "suport",
    label: "Suport",
    icon: "❓",
    children: [
      { id: "manual", label: "Manual Utilizare", icon: "📘" },
    ],
  },
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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem("sidebarCollapsed");
    return stored === "true";
  });
  
  const navItems = user.role === "admin" ? ADMIN_NAV : WAITER_NAV;

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", newState.toString());
  };

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-56'} bg-gray-800 border-r border-gray-700 flex flex-col min-h-screen transition-all duration-300`}>
      {/* Brand */}
      <div className="px-4 py-4 border-b border-gray-700">
        {!isCollapsed ? (
          <>
            <h1 className="text-lg font-bold text-amber-400">HoReCa Hybrid</h1>
            <div className="text-xs text-gray-400 mt-1">
              {user.role === "admin" ? "👔 Admin" : "🍽️ Ospătar"}: {user.name}
            </div>
          </>
        ) : (
          <div className="text-center">
            <span className="text-2xl">🍽️</span>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <div className="px-2 py-2 border-b border-gray-700">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center px-2 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          title={isCollapsed ? "Extinde meniul" : "Restrânge meniul"}
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {!isCollapsed ? (
          navItems.map((item) => (
            <NavMenuItem
              key={item.id}
              item={item}
              activeView={activeView}
              onNavigate={onNavigate}
            />
          ))
        ) : (
          // Collapsed view - show only icons
          <div className="space-y-1">
            {navItems.map((section) => (
              <div key={section.id}>
                <div className="px-2 py-2 text-center text-2xl" title={section.label}>
                  {section.icon}
                </div>
                {section.children && section.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => onNavigate(child.id)}
                    className={`w-full flex items-center justify-center px-2 py-2 text-xl rounded-lg transition-colors ${
                      activeView === child.id
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                    }`}
                    title={child.label}
                  >
                    {child.icon}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-gray-700">
        <button
          onClick={onLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} px-3 py-2 text-sm text-red-400 hover:bg-red-900/30 rounded-lg transition-colors`}
          title="Ieșire"
        >
          <span>🚪</span>
          {!isCollapsed && <span>Ieșire</span>}
        </button>
      </div>
    </aside>
  );
}
