import { useState } from "react";
import LoginPage from "./pages/LoginPage.jsx";
import Sidebar from "./components/Sidebar.jsx";
import SalesPage from "./pages/SalesPage.jsx";
import ManagementPage from "./pages/ManagementPage.jsx";
import TVMonitorPage from "./pages/TVMonitorPage.jsx";
import ManualPage from "./pages/ManualPage.jsx";
import OrderHistoryPage from "./pages/OrderHistoryPage.jsx";

const MANAGEMENT_VIEWS = [
  "products", "recipes", "suppliers", "nir", "transfers",
  "returs", "inventory", "stock", "categories", "departments", "users",
];

export default function App() {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState(null);

  const handleLogout = () => {
    setUser(null);
    setActiveView(null);
  };

  const handleLogin = (u) => {
    setUser(u);
    setActiveView(u.role === "admin" ? "products" : "pos");
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (activeView === "tv-monitor") {
      return <TVMonitorPage />;
    }
    if (activeView === "manual") {
      return <ManualPage />;
    }
    if (activeView === "order-history") {
      return <OrderHistoryPage />;
    }
    if (activeView === "pos" || activeView === "orders") {
      return (
        <SalesPage
          user={user}
          onLogout={handleLogout}
          initialView={activeView === "orders" ? "orders" : "pos"}
          embedded
        />
      );
    }
    if (activeView === "reports") {
      return <ManagementPage user={user} onLogout={handleLogout} initialTab="reports" embedded />;
    }
    if (MANAGEMENT_VIEWS.includes(activeView)) {
      return <ManagementPage user={user} onLogout={handleLogout} initialTab={activeView} embedded />;
    }
    return <SalesPage user={user} onLogout={handleLogout} initialView="pos" embedded />;
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar
        user={user}
        activeView={activeView}
        onNavigate={setActiveView}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}
