import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
      setError("");
    }
  };

  const handleClear = () => {
    setPin("");
    setError("");
  };

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      setError("Introduceți 4 cifre");
      return;
    }
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        setError("PIN invalid");
        setPin("");
        return;
      }
      const user = await res.json();
      onLogin(user);
    } catch {
      setError("Eroare de conexiune");
    }
  };

  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          HoReCa Hybrid
        </h1>
        <p className="text-gray-400 text-center mb-6">Introduceți PIN-ul</p>

        {/* PIN display */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl font-bold ${
                pin.length > i
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-gray-600 text-gray-600"
              }`}
            >
              {pin.length > i ? "●" : ""}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-center mb-4 text-sm">{error}</p>
        )}

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {digits.map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(String(d))}
              className="h-14 rounded-xl bg-gray-700 text-white text-xl font-semibold hover:bg-gray-600 active:bg-blue-600 transition-colors"
            >
              {d}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-14 rounded-xl bg-red-700 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            Șterge
          </button>
          <button
            onClick={() => handleDigit("0")}
            className="h-14 rounded-xl bg-gray-700 text-white text-xl font-semibold hover:bg-gray-600 active:bg-blue-600 transition-colors"
          >
            0
          </button>
          <button
            onClick={handleSubmit}
            className="h-14 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-600 transition-colors"
          >
            OK
          </button>
        </div>

        <p className="text-gray-500 text-xs text-center mt-4">
          Admin: 0000 · Ospătar 1: 1111 · Ospătar 2: 2222
        </p>
      </div>
    </div>
  );
}
