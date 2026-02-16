import { useState, useEffect } from "react";

export default function PontajPage() {
  const [users, setUsers] = useState([]);
  const [clock, setClock] = useState(new Date());
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    fetch("/api/users").then((r) => r.json()).then(setUsers).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleClock = (userId) => {
    setAttendance((prev) => {
      const entry = prev[userId];
      if (!entry || entry.out) {
        return { ...prev, [userId]: { in: new Date(), out: null } };
      }
      return { ...prev, [userId]: { ...entry, out: new Date() } };
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">🕐 Pontaj</h1>
        <div className="text-3xl font-mono text-amber-400">
          {clock.toLocaleTimeString("ro-RO")}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const entry = attendance[u.id];
          const isIn = entry && !entry.out;

          return (
            <div
              key={u.id}
              className={`bg-gray-800 rounded-xl shadow-lg p-6 border ${
                isIn ? "border-green-500" : "border-gray-700"
              }`}
            >
              <div className="text-xl font-bold mb-2">{u.name}</div>
              <div className="text-sm text-gray-400 mb-3">{u.role}</div>
              {entry && (
                <div className="text-sm text-gray-300 mb-3">
                  <div>Intrare: {entry.in.toLocaleTimeString("ro-RO")}</div>
                  {entry.out && (
                    <div>Ieșire: {entry.out.toLocaleTimeString("ro-RO")}</div>
                  )}
                </div>
              )}
              <button
                onClick={() => toggleClock(u.id)}
                className={`w-full py-2 rounded-lg font-bold ${
                  isIn
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                } text-white`}
              >
                {isIn ? "🔴 Clock Out" : "🟢 Clock In"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
