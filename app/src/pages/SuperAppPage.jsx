import { useState, useEffect } from "react";

export default function SuperAppPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [user] = useState({ name: "Maria P.", points: 1240, tier: "Gold" });
  const [restaurants, setRestaurants] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/superapp")
      .then((r) => r.json())
      .then((d) => { setRestaurants(d.restaurants ?? []); setOffers(d.offers ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const tabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "reserve", label: "Rezervă", icon: "📅" },
    { id: "order", label: "Comandă", icon: "🛒" },
    { id: "loyalty", label: "Loyalty", icon: "⭐" },
    { id: "offers", label: "Oferte AI", icon: "🎯" },
    { id: "review", label: "Review", icon: "💬" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">📱 Hospitality SuperApp</h1>
        <div className="flex items-center gap-3 bg-gray-800 rounded-full px-4 py-2 border border-yellow-500/30">
          <span className="text-yellow-400">⭐ {user.tier}</span>
          <span className="font-bold">{user.points} pts</span>
          <span className="text-gray-300">{user.name}</span>
        </div>
      </div>
      <p className="text-gray-400 mb-6">Cross-brand · Rezervă · Comandă · Loyalty · Gamification</p>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
              activeTab === t.id ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === "home" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 rounded-2xl border border-purple-500/30 p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-2xl font-bold">Bun venit, {user.name}! 👋</div>
                <div className="text-gray-300 mt-1">Ai {user.points} puncte loyalty disponibile</div>
              </div>
              <div className="bg-yellow-500 text-black rounded-full px-4 py-2 font-bold">
                {user.tier}
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>Progress spre Platinum</span>
                <span>1240/2000 pts</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full" style={{ width: "62%" }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: "📅", label: "Rezervă acum", color: "from-blue-600 to-blue-800", tab: "reserve" },
              { icon: "🛒", label: "Comandă", color: "from-green-600 to-green-800", tab: "order" },
              { icon: "🎯", label: "Oferte AI", color: "from-orange-600 to-orange-800", tab: "offers" },
              { icon: "💬", label: "Review", color: "from-purple-600 to-purple-800", tab: "review" },
            ].map((action) => (
              <button key={action.tab} onClick={() => setActiveTab(action.tab)}
                className={`bg-gradient-to-br ${action.color} rounded-xl p-5 text-center hover:opacity-90 transition`}>
                <div className="text-4xl mb-2">{action.icon}</div>
                <div className="font-semibold">{action.label}</div>
              </button>
            ))}
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h2 className="text-lg font-semibold mb-4">🏪 Restaurante Partenere</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? <p className="text-gray-400">Se încarcă...</p> : restaurants.map((r) => (
                <div key={r.id} className="bg-gray-700/50 rounded-xl p-4 hover:bg-gray-700 transition cursor-pointer">
                  <div className="text-3xl mb-2">{r.icon}</div>
                  <div className="font-bold">{r.name}</div>
                  <div className="text-gray-400 text-sm">{r.cuisine} · {r.location}</div>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className="text-yellow-400">⭐ {r.rating.toFixed(1)}</span>
                    <span className="text-gray-400">{r.deliveryTime} min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "reserve" && (
        <div className="max-w-lg mx-auto bg-gray-800 rounded-2xl border border-gray-700 p-6">
          <h2 className="text-xl font-bold mb-5">📅 Rezervă o masă</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Restaurant</label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white">
                {restaurants.map((r) => <option key={r.id}>{r.icon} {r.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Data</label>
                <input type="date" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Ora</label>
                <input type="time" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Număr persoane</label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5, 6, "6+"].map((n) => (
                  <button key={n} className="flex-1 py-3 bg-gray-700 hover:bg-purple-700 rounded-lg font-bold transition">{n}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Cerințe speciale</label>
              <textarea className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white h-24" placeholder="Alergii, ocazie specială..."/>
            </div>
            <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg hover:opacity-90 transition">
              📅 Confirmă Rezervarea
            </button>
          </div>
        </div>
      )}

      {activeTab === "order" && (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-5">🛒 Comandă Online</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {restaurants.map((r) => (
              <div key={r.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-purple-500 transition cursor-pointer">
                <div className="text-4xl mb-2">{r.icon}</div>
                <div className="font-bold text-lg">{r.name}</div>
                <div className="text-gray-400 text-sm">{r.cuisine}</div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-gray-400 text-sm">🚚 {r.deliveryTime} min</span>
                  <span className="text-sm font-medium">Min: {r.minOrder} lei</span>
                </div>
                <button className="w-full mt-3 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg text-sm font-semibold transition">
                  Vezi Meniu →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "loyalty" && (
        <div className="max-w-lg mx-auto space-y-6">
          <div className="bg-gradient-to-br from-yellow-800/40 to-orange-800/40 rounded-2xl border border-yellow-500/30 p-6 text-center">
            <div className="text-6xl mb-3">⭐</div>
            <div className="text-5xl font-bold text-yellow-400">{user.points}</div>
            <div className="text-gray-300 text-lg">puncte loyalty</div>
            <div className="mt-2 text-yellow-400 font-bold text-xl">{user.tier} Member</div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h2 className="text-lg font-semibold mb-4">🎁 Recompense disponibile</h2>
            <div className="space-y-3">
              {[
                { reward: "Cafea Gratuită", points: 200, icon: "☕" },
                { reward: "Desert Gratuit", points: 500, icon: "🍰" },
                { reward: "Masă Gratuită 2 persoane", points: 1000, icon: "🍽️" },
                { reward: "Weekend Brunch VIP", points: 2000, icon: "🥂" },
              ].map((r) => (
                <div key={r.reward} className="flex items-center justify-between bg-gray-700/40 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{r.icon}</span>
                    <span className="font-medium">{r.reward}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold">{r.points} pts</div>
                    <button
                      disabled={user.points < r.points}
                      className={`text-xs mt-1 px-3 py-1 rounded ${user.points >= r.points ? "bg-yellow-600 hover:bg-yellow-500 text-white" : "bg-gray-600 text-gray-400 cursor-not-allowed"}`}
                    >
                      Revendică
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "offers" && (
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-xl font-bold mb-2">🎯 Oferte AI Personalizate</h2>
          <p className="text-gray-400 text-sm mb-4">Bazate pe istoricul tău și preferințe</p>
          {loading ? <p className="text-gray-400">Se generează oferte...</p> : offers.map((offer, i) => (
            <div key={i} className="bg-gradient-to-r from-gray-800 to-gray-800/80 rounded-xl border border-gray-700 p-5 hover:border-purple-500 transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-2xl mb-1">{offer.icon}</div>
                  <h3 className="font-bold text-lg">{offer.title}</h3>
                  <div className="text-gray-400 text-sm">{offer.description}</div>
                </div>
                <div className="text-right">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">-{offer.discount}%</div>
                  <div className="text-xs text-gray-400 mt-1">Expiră: {offer.expires}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg font-semibold transition">
                  🎯 Activează Oferta
                </button>
                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-sm">
                  +{offer.bonusPoints} pts
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "review" && (
        <div className="max-w-lg mx-auto bg-gray-800 rounded-2xl border border-gray-700 p-6">
          <h2 className="text-xl font-bold mb-5">💬 Lasă un review instant</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Restaurant</label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white">
                {restaurants.map((r) => <option key={r.id}>{r.icon} {r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Rating</label>
              <div className="flex gap-3 text-4xl">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} className="hover:scale-110 transition">{"⭐"}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Review</label>
              <textarea className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white h-28" placeholder="Experiența ta..."/>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Tip direct (opțional)</label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map((tip) => (
                  <button key={tip} className="flex-1 py-2 bg-gray-700 hover:bg-green-700 rounded-lg text-sm font-bold transition">
                    {tip} lei
                  </button>
                ))}
              </div>
            </div>
            <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg hover:opacity-90 transition">
              💬 Trimite Review (+50 pts)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
