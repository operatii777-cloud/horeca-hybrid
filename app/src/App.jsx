import { useState } from "react";
import LoginPage from "./pages/LoginPage.jsx";
import SalesPage from "./pages/SalesPage.jsx";
import ManagementPage from "./pages/ManagementPage.jsx";

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => setUser(null);

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  if (user.role === "admin") {
    return <ManagementPage user={user} onLogout={handleLogout} />;
  }

  return <SalesPage user={user} onLogout={handleLogout} />;
}
