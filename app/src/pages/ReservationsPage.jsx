import { useState } from "react";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState({
    name: "",
    date: "",
    time: "",
    guests: 1,
    tableNr: 1,
    phone: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.date || !form.time) return;
    setReservations((prev) => [
      ...prev,
      { ...form, id: Date.now(), createdAt: new Date().toISOString() },
    ]);
    setForm({ name: "", date: "", time: "", guests: 1, tableNr: 1, phone: "" });
  };

  const removeReservation = (id) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">📅 Rezervări</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Adaugă Rezervare</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Nume client"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
            />
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
            />
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
            />
            <input
              type="number"
              min="1"
              placeholder="Nr. persoane"
              value={form.guests}
              onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
            />
            <input
              type="number"
              min="1"
              max="10"
              placeholder="Nr. masă"
              value={form.tableNr}
              onChange={(e) => setForm({ ...form, tableNr: Number(e.target.value) })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
            />
            <input
              type="tel"
              placeholder="Telefon"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold"
            >
              ➕ Adaugă
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Lista Rezervări</h2>
          {reservations.length === 0 ? (
            <p className="text-gray-400">Nicio rezervare</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="py-2">Nume</th>
                  <th className="py-2">Data</th>
                  <th className="py-2">Ora</th>
                  <th className="py-2">Pers.</th>
                  <th className="py-2">Masa</th>
                  <th className="py-2">Telefon</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id} className="border-b border-gray-700/50">
                    <td className="py-2 font-semibold">{r.name}</td>
                    <td className="py-2">{r.date}</td>
                    <td className="py-2">{r.time}</td>
                    <td className="py-2">{r.guests}</td>
                    <td className="py-2">{r.tableNr}</td>
                    <td className="py-2 text-gray-300">{r.phone}</td>
                    <td className="py-2">
                      <button
                        onClick={() => removeReservation(r.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
