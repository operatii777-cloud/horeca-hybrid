import { useState } from "react";
import LoginPage from "./pages/LoginPage.jsx";
import Sidebar from "./components/Sidebar.jsx";
import SalesPage from "./pages/SalesPage.jsx";
import ManagementPage from "./pages/ManagementPage.jsx";
import TVMonitorPage from "./pages/TVMonitorPage.jsx";
import ManualPage from "./pages/ManualPage.jsx";
import OrderHistoryPage from "./pages/OrderHistoryPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import KDSKitchenPage from "./pages/KDSKitchenPage.jsx";
import KDSBarPage from "./pages/KDSBarPage.jsx";
import ScoreboardPage from "./pages/ScoreboardPage.jsx";
import PontajPage from "./pages/PontajPage.jsx";
import StaffReportPage from "./pages/StaffReportPage.jsx";
import TablePlanPage from "./pages/TablePlanPage.jsx";
import ReservationsPage from "./pages/ReservationsPage.jsx";
import ClientMonitorPage from "./pages/ClientMonitorPage.jsx";
import BonConsumPage from "./pages/BonConsumPage.jsx";
import WastePage from "./pages/WastePage.jsx";
import HACCPPage from "./pages/HACCPPage.jsx";
import ReportXPage from "./pages/ReportXPage.jsx";
import ReportZPage from "./pages/ReportZPage.jsx";
import ShiftHandoverPage from "./pages/ShiftHandoverPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import AuditLogPage from "./pages/AuditLogPage.jsx";
import KioskSelfServicePage from "./pages/KioskSelfServicePage.jsx";
import FeedbackTerminalPage from "./pages/FeedbackTerminalPage.jsx";
import MenuTVPage from "./pages/MenuTVPage.jsx";
import CustomerDisplayPage from "./pages/CustomerDisplayPage.jsx";
import ComandaQRPage from "./pages/ComandaQRPage.jsx";
import ComandaSupervisorPage from "./pages/ComandaSupervisorPage.jsx";
import RecipeVerificationPage from "./pages/RecipeVerificationPage.jsx";
import AdvancedReportsPage from "./pages/AdvancedReportsPage.jsx";
import UtilitiesPage from "./pages/UtilitiesPage.jsx";

const MANAGEMENT_VIEWS = [
  "products", "recipes", "suppliers", "nir", "transfers",
  "returs", "inventory", "stock", "categories", "departments", "users",
];

export default function App() {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState(null);

  // Standalone QR ordering page - no login required
  const path = window.location.pathname;
  if (path === "/comanda" || path === "/comanda.html") {
    return <ComandaQRPage />;
  }

  const handleLogout = () => {
    setUser(null);
    setActiveView(null);
  };

  const handleLogin = (u) => {
    setUser(u);
    setActiveView(u.role === "admin" ? "dashboard" : "pos");
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardPage />;
      case "table-plan":
        return <TablePlanPage />;
      case "kds-kitchen":
        return <KDSKitchenPage />;
      case "kds-bar":
        return <KDSBarPage />;
      case "scoreboard":
        return <ScoreboardPage />;
      case "pontaj":
        return <PontajPage />;
      case "staff-report":
        return <StaffReportPage />;
      case "reservations":
        return <ReservationsPage />;
      case "client-monitor":
        return <ClientMonitorPage />;
      case "bon-consum":
        return <BonConsumPage />;
      case "waste":
        return <WastePage />;
      case "haccp":
        return <HACCPPage />;
      case "report-x":
        return <ReportXPage />;
      case "report-z":
        return <ReportZPage />;
      case "shift-handover":
        return <ShiftHandoverPage />;
      case "settings":
        return <SettingsPage />;
      case "audit-log":
        return <AuditLogPage />;
      case "kiosk-self-service":
        return <KioskSelfServicePage />;
      case "feedback-terminal":
        return <FeedbackTerminalPage />;
      case "tv-monitor":
        return <TVMonitorPage />;
      case "menu-tv":
        return <MenuTVPage />;
      case "customer-display":
        return <CustomerDisplayPage />;
      case "comanda-supervisor":
        return <ComandaSupervisorPage user={user} />;
      case "recipe-verification":
        return <RecipeVerificationPage user={user} onLogout={handleLogout} />;
      case "advanced-reports":
        return <AdvancedReportsPage user={user} onLogout={handleLogout} />;
      case "utilities":
        return <UtilitiesPage user={user} onLogout={handleLogout} />;
      case "manual":
        return <ManualPage />;
      case "order-history":
        return <OrderHistoryPage />;
      case "pos":
      case "orders":
        return (
          <SalesPage
            user={user}
            onLogout={handleLogout}
            initialView={activeView === "orders" ? "orders" : "pos"}
            embedded
          />
        );
      case "reports":
        return <ManagementPage user={user} onLogout={handleLogout} initialTab="reports" embedded />;
      default:
        if (MANAGEMENT_VIEWS.includes(activeView)) {
          return <ManagementPage user={user} onLogout={handleLogout} initialTab={activeView} embedded />;
        }
        return <DashboardPage />;
    }
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
