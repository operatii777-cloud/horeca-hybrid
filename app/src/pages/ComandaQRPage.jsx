import { useState, useEffect } from "react";

const QR_PAY_OPTIONS = [
  { id: "CASH", label: "Cash la masă", icon: "💵" },
  { id: "CARD", label: "Card la masă", icon: "💳" },
  { id: "CARD_POS", label: "Card la casă", icon: "🏧" },
];

const SOCIAL_LINKS = [
  { id: "facebook", label: "Facebook", icon: "📘", url: "https://facebook.com" },
  { id: "instagram", label: "Instagram", icon: "📸", url: "https://instagram.com" },
  { id: "tiktok", label: "TikTok", icon: "🎵", url: "https://tiktok.com" },
];

export default function ComandaQRPage({ tableNr: propTable }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [ordered, setOrdered] = useState(false);
  const [screen, setScreen] = useState("menu"); // "menu" | "tracking" | "bill" | "reserve" | "menu-pdf"
  const [activeOrder, setActiveOrder] = useState(null);
  const [billRequested, setBillRequested] = useState(false);
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [splitMode, setSplitMode] = useState(false);
  const [currentPerson, setCurrentPerson] = useState("Persoana 1");
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(true);
  // Reservation state
  const [resName, setResName] = useState("");
  const [resDate, setResDate] = useState("");
  const [resTime, setResTime] = useState("");
  const [resGuests, setResGuests] = useState(2);
  const [resPhone, setResPhone] = useState("");
  const [resSent, setResSent] = useState(false);

  const [tableNr] = useState(() => {
    if (propTable) return propTable;
    const params = new URLSearchParams(window.location.search);
    return Number(params.get("table")) || 1;
  });

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts).catch(() => {});
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {});
    loadActiveOrder();
  }, []);

  useEffect(() => {
    if (screen === "tracking" || screen === "bill") {
      const interval = setInterval(loadActiveOrder, 3000);
      return () => clearInterval(interval);
    }
  }, [screen]);

  const loadActiveOrder = () => {
    fetch("/api/orders?status=open")
      .then((r) => r.json())
      .then((orders) => {
        const tableOrder = orders.find((o) => o.tableNr === tableNr && o.source === "qr");
        if (tableOrder) {
          setActiveOrder(tableOrder);
          if (screen === "menu" && !ordered) setScreen("tracking");
        } else {
          fetch("/api/orders?status=delivered")
            .then((r) => r.json())
            .then((delivered) => {
              const dOrder = delivered.find((o) => o.tableNr === tableNr && o.source === "qr");
              if (dOrder) {
                setActiveOrder(dOrder);
                if (screen === "menu" && !ordered) setScreen("tracking");
              } else {
                setActiveOrder(null);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  };

  const filtered = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  const addToCart = (product) => {
    setCart((prev) => {
      const key = splitMode ? `${product.id}-${currentPerson}` : `${product.id}`;
      const existing = prev.find((i) => (splitMode ? `${i.productId}-${i.personLabel}` : `${i.productId}`) === key);
      if (existing) {
        return prev.map((i) =>
          (splitMode ? `${i.productId}-${i.personLabel}` : `${i.productId}`) === key
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1, personLabel: splitMode ? currentPerson : "" }];
    });
  };

  const removeFromCart = (productId, personLabel) => {
    setCart((prev) => {
      const key = splitMode ? `${productId}-${personLabel}` : `${productId}`;
      const existing = prev.find((i) => (splitMode ? `${i.productId}-${i.personLabel}` : `${i.productId}`) === key);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          (splitMode ? `${i.productId}-${i.personLabel}` : `${i.productId}`) === key
            ? { ...i, quantity: i.quantity - 1 }
            : i
        );
      }
      return prev.filter((i) => (splitMode ? `${i.productId}-${i.personLabel}` : `${i.productId}`) !== key);
    });
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const persons = [...new Set(cart.filter((i) => i.personLabel).map((i) => i.personLabel))];

  const handleOrder = () => {
    if (cart.length === 0) return;
    const orderItems = cart.map((i) => ({
      productId: i.productId, quantity: i.quantity, price: i.price, personLabel: i.personLabel || "",
    }));

    if (activeOrder && activeOrder.status === "open") {
      fetch(`/api/orders/${activeOrder.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: orderItems }),
      })
        .then((r) => r.json())
        .then((updated) => {
          setActiveOrder(updated);
          setOrdered(true);
          setCart([]);
          setOrderNotes("");
          setTimeout(() => { setOrdered(false); setScreen("tracking"); }, 3000);
        })
        .catch(() => {});
    } else {
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNr, userId: 1, source: "qr", notes: orderNotes, items: orderItems }),
      })
        .then((r) => r.json())
        .then((newOrder) => {
          setActiveOrder(newOrder);
          setOrdered(true);
          setCart([]);
          setOrderNotes("");
          setTimeout(() => { setOrdered(false); setScreen("tracking"); }, 3000);
        })
        .catch(() => {});
    }
  };

  const handleRequestBill = (payPref) => {
    if (!activeOrder) return;
    fetch(`/api/orders/${activeOrder.id}/request-bill`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferredPayment: payPref }),
    })
      .then((r) => r.json())
      .then(() => setBillRequested(true))
      .catch(() => {});
  };

  const handleCallWaiter = () => {
    fetch("/api/call-waiter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableNr, type: "call" }),
    })
      .then((r) => r.json())
      .then(() => {
        setWaiterCalled(true);
        setTimeout(() => setWaiterCalled(false), 5000);
      })
      .catch(() => {});
  };

  const handleReservation = () => {
    if (!resName || !resDate || !resTime) return;
    fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: resName, date: resDate, time: resTime, guests: resGuests, tableNr, phone: resPhone }),
    })
      .then((r) => r.json())
      .then(() => {
        setResSent(true);
        setTimeout(() => { setResSent(false); setScreen("menu"); }, 3000);
      })
      .catch(() => {});
  };

  // Dynamic theme
  const bg = darkTheme ? "bg-gray-900" : "bg-gray-100";
  const text = darkTheme ? "text-white" : "text-gray-900";
  const cardBg = darkTheme ? "bg-gray-800" : "bg-white";
  const cardBorder = darkTheme ? "border-gray-700" : "border-gray-300";
  const mutedText = darkTheme ? "text-gray-400" : "text-gray-500";
  const inputBg = darkTheme ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900";

  const readyCount = activeOrder ? (activeOrder.items || []).filter((i) => i.ready).length : 0;
  const totalItems = activeOrder ? (activeOrder.items || []).length : 0;
  const allReady = totalItems > 0 && readyCount === totalItems;

  /* ─── Hamburger Menu overlay ─── */
  const renderHamburgerMenu = () => (
    <div className="fixed inset-0 bg-black/80 z-50 flex">
      <div className={`w-80 ${cardBg} ${text} h-full flex flex-col shadow-2xl`}>
        <div className={`p-4 border-b ${cardBorder} flex justify-between items-center`}>
          <h2 className="text-xl font-bold text-amber-400">☰ Meniu</h2>
          <button onClick={() => setMenuOpen(false)} className="text-2xl hover:text-red-400">✕</button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-3">
          <button onClick={() => { setScreen("menu"); setMenuOpen(false); }}
            className={`w-full text-left p-3 rounded-xl ${cardBg} border ${cardBorder} hover:border-blue-500`}>
            🍽️ Meniu Restaurant
          </button>
          {activeOrder && (
            <button onClick={() => { setScreen("tracking"); setMenuOpen(false); }}
              className={`w-full text-left p-3 rounded-xl ${cardBg} border ${cardBorder} hover:border-blue-500`}>
              📋 Comanda mea
            </button>
          )}
          <button onClick={() => { handleCallWaiter(); setMenuOpen(false); }}
            className={`w-full text-left p-3 rounded-xl ${cardBg} border ${cardBorder} hover:border-amber-500`}>
            🔔 Cheamă ospătarul
          </button>
          {activeOrder && (
            <button onClick={() => { setScreen("bill"); setMenuOpen(false); }}
              className={`w-full text-left p-3 rounded-xl ${cardBg} border ${cardBorder} hover:border-green-500`}>
              🧾 Cere nota de plată
            </button>
          )}
          <button onClick={() => { setScreen("reserve"); setMenuOpen(false); }}
            className={`w-full text-left p-3 rounded-xl ${cardBg} border ${cardBorder} hover:border-purple-500`}>
            📅 Fă o rezervare
          </button>
          <button onClick={() => { setScreen("menu-pdf"); setMenuOpen(false); }}
            className={`w-full text-left p-3 rounded-xl ${cardBg} border ${cardBorder} hover:border-cyan-500`}>
            📄 Meniu PDF
          </button>
          <div className={`border-t ${cardBorder} pt-3`}>
            <div className={`text-xs ${mutedText} uppercase mb-2 font-semibold`}>Opțiuni</div>
            <button onClick={() => setDarkTheme(!darkTheme)}
              className={`w-full text-left p-3 rounded-xl ${cardBg} border ${cardBorder} hover:border-yellow-500`}>
              {darkTheme ? "☀️ Tema Luminoasă" : "🌙 Tema Întunecată"}
            </button>
            <button onClick={() => { setSplitMode(!splitMode); setMenuOpen(false); }}
              className={`w-full text-left p-3 rounded-xl ${cardBg} border ${cardBorder} hover:border-indigo-500 mt-2`}>
              {splitMode ? "👥 Mod Separat: ACTIV" : "👤 Comandă împreună (standard)"}
            </button>
          </div>
          <div className={`border-t ${cardBorder} pt-3`}>
            <div className={`text-xs ${mutedText} uppercase mb-2 font-semibold`}>Social Media</div>
            <div className="flex gap-3 justify-center">
              {SOCIAL_LINKS.map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                  className={`w-14 h-14 rounded-xl ${cardBg} border ${cardBorder} hover:border-blue-400 flex items-center justify-center text-2xl`}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          <div className={`border-t ${cardBorder} pt-3`}>
            <div className={`text-xs ${mutedText} uppercase mb-2 font-semibold`}>Despre</div>
            <p className={`text-sm ${mutedText}`}>
              HoReCa Hybrid POS — Sistem digital de comenzi. Scanați codul QR de pe masă
              pentru a plasa comanda direct din telefonul dumneavoastră.
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1" onClick={() => setMenuOpen(false)} />
    </div>
  );

  /* ─── Reservation screen ─── */
  if (screen === "reserve") {
    return (
      <div className={`min-h-screen ${bg} ${text} flex flex-col`}>
        {menuOpen && renderHamburgerMenu()}
        <div className={`${cardBg} p-4 border-b ${cardBorder} flex items-center justify-between`}>
          <button onClick={() => setScreen("menu")} className={`${mutedText} text-xl`}>← Înapoi</button>
          <h1 className="text-xl font-bold text-amber-400">📅 Rezervare</h1>
          <div className="bg-blue-600 px-3 py-1 rounded-lg font-bold text-white">Masa {tableNr}</div>
        </div>
        <div className="flex-1 p-4 max-w-lg mx-auto w-full">
          {resSent ? (
            <div className="bg-green-900/40 border-2 border-green-500 rounded-xl p-8 text-center mt-8">
              <div className="text-5xl mb-3">✅</div>
              <div className="text-2xl font-bold text-green-400">Rezervare confirmată!</div>
              <div className={`mt-2 ${mutedText}`}>Vă așteptăm!</div>
            </div>
          ) : (
            <div className={`${cardBg} rounded-xl border ${cardBorder} p-5 space-y-4`}>
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Nume *</label>
                <input value={resName} onChange={(e) => setResName(e.target.value)}
                  className={`w-full p-3 rounded-lg border ${cardBorder} ${inputBg}`} placeholder="Numele dvs." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Data *</label>
                  <input type="date" value={resDate} onChange={(e) => setResDate(e.target.value)}
                    className={`w-full p-3 rounded-lg border ${cardBorder} ${inputBg}`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Ora *</label>
                  <input type="time" value={resTime} onChange={(e) => setResTime(e.target.value)}
                    className={`w-full p-3 rounded-lg border ${cardBorder} ${inputBg}`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Persoane</label>
                  <input type="number" min="1" max="20" value={resGuests} onChange={(e) => setResGuests(Number(e.target.value))}
                    className={`w-full p-3 rounded-lg border ${cardBorder} ${inputBg}`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Telefon</label>
                  <input value={resPhone} onChange={(e) => setResPhone(e.target.value)}
                    className={`w-full p-3 rounded-lg border ${cardBorder} ${inputBg}`} placeholder="07..." />
                </div>
              </div>
              <button onClick={handleReservation} disabled={!resName || !resDate || !resTime}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 font-bold text-lg text-white">
                📅 Confirmă Rezervarea
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ─── Menu PDF screen ─── */
  if (screen === "menu-pdf") {
    return (
      <div className={`min-h-screen ${bg} ${text} flex flex-col`}>
        {menuOpen && renderHamburgerMenu()}
        <div className={`${cardBg} p-4 border-b ${cardBorder} flex items-center justify-between`}>
          <button onClick={() => setScreen("menu")} className={`${mutedText} text-xl`}>← Înapoi</button>
          <h1 className="text-xl font-bold text-amber-400">📄 Meniu PDF</h1>
          <div className="bg-blue-600 px-3 py-1 rounded-lg font-bold text-white">Masa {tableNr}</div>
        </div>
        <div className="flex-1 p-4 max-w-lg mx-auto w-full">
          <div className={`${cardBg} rounded-xl border ${cardBorder} p-8 text-center`}>
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-bold mb-2">Meniul Restaurantului</h2>
            <p className={`${mutedText} mb-6`}>Vizualizați meniul complet al restaurantului.</p>
            <div className="space-y-3 text-left">
              {categories.map((c) => (
                <div key={c.id} className={`p-3 rounded-lg border ${cardBorder}`}>
                  <div className="font-bold mb-2">{c.name}</div>
                  <div className="space-y-1">
                    {products.filter((p) => p.categoryId === c.id).map((p) => (
                      <div key={p.id} className="flex justify-between text-sm">
                        <span>{p.name}</span>
                        <span className="text-green-400 font-bold">{p.price?.toFixed(2)} lei</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {categories.length === 0 && <p className={mutedText}>Nu sunt categorii disponibile.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Tracking screen ─── */
  if (screen === "tracking" && activeOrder) {
    return (
      <div className={`min-h-screen ${bg} ${text} flex flex-col`}>
        {menuOpen && renderHamburgerMenu()}
        <div className={`${cardBg} p-4 border-b ${cardBorder} flex items-center justify-between`}>
          <button onClick={() => setMenuOpen(true)} className="text-2xl">☰</button>
          <h1 className="text-2xl font-bold text-amber-400">📱 Comanda Mea</h1>
          <div className="bg-blue-600 px-4 py-1.5 rounded-lg font-bold text-lg text-white">Masa {tableNr}</div>
        </div>

        {waiterCalled && (
          <div className="mx-4 mt-3 bg-green-900/50 border border-green-500 rounded-xl p-3 text-center text-green-400 font-bold animate-pulse">
            🔔 Ospătarul a fost chemat! Vine la masa dvs.
          </div>
        )}

        <div className="flex-1 p-4 max-w-lg mx-auto w-full">
          <div className={`${cardBg} rounded-xl border ${cardBorder} p-4 mb-4`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold">Comanda #{activeOrder.id}</span>
              <span className={`text-xs px-3 py-1 rounded-full font-bold text-white ${
                activeOrder.status === "delivered" ? "bg-blue-600" :
                allReady ? "bg-green-600" : "bg-yellow-600"
              }`}>
                {activeOrder.status === "delivered" ? "✅ Livrată" :
                 allReady ? "🍽️ Gata de servire" : "🔥 Se pregătește"}
              </span>
            </div>
            {activeOrder.notes && (
              <div className={`text-sm ${mutedText} mb-3 italic`}>📝 {activeOrder.notes}</div>
            )}
            <div className="mb-4">
              <div className={`flex justify-between text-xs ${mutedText} mb-1`}>
                <span>Pregătire</span>
                <span>{readyCount}/{totalItems} produse gata</span>
              </div>
              <div className={`w-full ${darkTheme ? "bg-gray-700" : "bg-gray-200"} rounded-full h-3`}>
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${allReady ? "bg-green-500" : "bg-amber-500"}`}
                  style={{ width: `${totalItems > 0 ? (readyCount / totalItems) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              {(activeOrder.items || []).map((item) => (
                <div key={item.id} className={`flex items-center justify-between ${darkTheme ? "bg-gray-700/50" : "bg-gray-100"} rounded-lg p-3`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${item.ready ? "text-green-400" : "text-yellow-400"}`}>
                      {item.ready ? "✅" : "⏳"}
                    </span>
                    <div>
                      <div className="font-medium text-sm">{item.product?.name}</div>
                      <div className={`text-xs ${mutedText}`}>
                        x{item.quantity}
                        {item.personLabel && <span className="ml-2 text-blue-400">({item.personLabel})</span>}
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm ${mutedText}`}>{(item.price * item.quantity).toFixed(2)} lei</span>
                </div>
              ))}
            </div>
            <div className={`border-t ${cardBorder} mt-4 pt-3 flex justify-between text-lg font-bold`}>
              <span>Total:</span>
              <span className="text-green-400">{(activeOrder.total || 0).toFixed(2)} lei</span>
            </div>
          </div>

          {/* Person totals for split orders */}
          {(activeOrder.items || []).some((i) => i.personLabel) && (
            <div className={`${cardBg} rounded-xl border ${cardBorder} p-4 mb-4`}>
              <div className="text-sm font-bold mb-2">👥 Total per persoană:</div>
              {[...new Set((activeOrder.items || []).filter((i) => i.personLabel).map((i) => i.personLabel))].map((person) => {
                const personTotal = (activeOrder.items || [])
                  .filter((i) => i.personLabel === person)
                  .reduce((s, i) => s + i.price * i.quantity, 0);
                return (
                  <div key={person} className="flex justify-between text-sm py-1">
                    <span>{person}</span>
                    <span className="text-green-400 font-bold">{personTotal.toFixed(2)} lei</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-3">
            <button onClick={handleCallWaiter}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 font-bold text-lg text-white">
              🔔 Cheamă ospătarul
            </button>
            <button onClick={() => setScreen("menu")}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-lg text-white">
              ➕ Adaugă produse
            </button>
            {!billRequested ? (
              <button onClick={() => setScreen("bill")}
                className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 font-bold text-lg text-white">
                🧾 Cere nota de plată
              </button>
            ) : (
              <div className="bg-green-900/40 border-2 border-green-500 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">✅</div>
                <div className="font-bold text-green-400">Nota a fost cerută!</div>
                <div className={`text-sm ${mutedText}`}>Ospătarul vine la masă</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ─── Bill request screen ─── */
  if (screen === "bill" && activeOrder) {
    return (
      <div className={`min-h-screen ${bg} ${text} flex flex-col`}>
        {menuOpen && renderHamburgerMenu()}
        <div className={`${cardBg} p-4 border-b ${cardBorder} flex items-center justify-between`}>
          <button onClick={() => setScreen("tracking")} className={`${mutedText} text-xl`}>← Înapoi</button>
          <h1 className="text-xl font-bold text-amber-400">🧾 Nota de plată</h1>
          <div className="bg-blue-600 px-3 py-1 rounded-lg font-bold text-white">Masa {tableNr}</div>
        </div>
        <div className="flex-1 p-4 max-w-lg mx-auto w-full">
          <div className={`${cardBg} rounded-xl border ${cardBorder} p-5 mb-6`}>
            <div className="text-center mb-4">
              <div className="text-lg font-bold">Comanda #{activeOrder.id}</div>
              <div className={`text-sm ${mutedText}`}>Masa {tableNr}</div>
            </div>
            <div className={`border-t ${cardBorder} pt-3 space-y-2`}>
              {(activeOrder.items || []).map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}× {item.product?.name}
                    {item.personLabel && <span className="text-blue-400 text-xs ml-1">({item.personLabel})</span>}
                  </span>
                  <span>{(item.price * item.quantity).toFixed(2)} lei</span>
                </div>
              ))}
            </div>
            {/* Person totals */}
            {(activeOrder.items || []).some((i) => i.personLabel) && (
              <div className={`border-t ${cardBorder} mt-3 pt-3`}>
                <div className="text-xs font-bold mb-1">Per persoană:</div>
                {[...new Set((activeOrder.items || []).filter((i) => i.personLabel).map((i) => i.personLabel))].map((person) => {
                  const personTotal = (activeOrder.items || [])
                    .filter((i) => i.personLabel === person)
                    .reduce((s, i) => s + i.price * i.quantity, 0);
                  return (
                    <div key={person} className="flex justify-between text-sm">
                      <span className="text-blue-400">{person}</span>
                      <span>{personTotal.toFixed(2)} lei</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className={`border-t ${cardBorder} mt-4 pt-3 flex justify-between text-xl font-bold`}>
              <span>TOTAL:</span>
              <span className="text-green-400">{(activeOrder.total || 0).toFixed(2)} lei</span>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-3 text-center">Cum doriți să plătiți?</h3>
            <div className="space-y-3">
              {QR_PAY_OPTIONS.map((opt) => (
                <button key={opt.id} onClick={() => handleRequestBill(opt.id)}
                  className={`w-full py-4 rounded-xl ${cardBg} hover:border-blue-500 border-2 ${cardBorder} font-bold text-lg transition-all flex items-center justify-center gap-3`}>
                  <span className="text-2xl">{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
          {billRequested && (
            <div className="bg-green-900/40 border-2 border-green-500 rounded-xl p-6 text-center">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-xl font-bold text-green-400 mb-1">Nota a fost cerută!</div>
              <div className={mutedText}>Ospătarul vine la masă pentru încasare</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ─── Menu/ordering screen (main) ─── */
  return (
    <div className={`min-h-screen ${bg} ${text} flex flex-col`}>
      {menuOpen && renderHamburgerMenu()}
      <div className={`${cardBg} p-4 border-b ${cardBorder} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuOpen(true)} className="text-2xl">☰</button>
          <h1 className="text-2xl font-bold text-amber-400">📱 Comanda Online</h1>
        </div>
        <div className="flex items-center gap-2">
          {activeOrder && (
            <button onClick={() => setScreen("tracking")}
              className="bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg font-bold text-sm text-white">
              📋 Vezi comanda
            </button>
          )}
          <div className="bg-blue-600 px-4 py-1.5 rounded-lg font-bold text-lg text-white">Masa {tableNr}</div>
        </div>
      </div>

      {waiterCalled && (
        <div className="mx-4 mt-3 bg-green-900/50 border border-green-500 rounded-xl p-3 text-center text-green-400 font-bold animate-pulse">
          🔔 Ospătarul a fost chemat! Vine la masa dvs.
        </div>
      )}

      {ordered && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center p-8">
            <div className="text-8xl mb-6">✅</div>
            <div className="text-4xl font-bold text-green-400">Comanda a fost trimisă!</div>
            <div className="text-xl text-gray-400 mt-2">Vă redirecționăm la statusul comenzii...</div>
          </div>
        </div>
      )}

      {/* Split mode indicator */}
      {splitMode && (
        <div className={`${cardBg} border-b ${cardBorder} px-4 py-2 flex items-center gap-2`}>
          <span className="text-sm font-bold">👥 Mod Separat:</span>
          <div className="flex gap-1 flex-wrap">
            {["Persoana 1", "Persoana 2", "Persoana 3", "Persoana 4"].map((p) => (
              <button key={p} onClick={() => setCurrentPerson(p)}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  currentPerson === p ? "bg-blue-600 text-white" : `${darkTheme ? "bg-gray-700" : "bg-gray-200"} ${mutedText}`
                }`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row">
        <div className="flex-1 p-4 overflow-auto">
          {/* Quick action bar */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            <button onClick={handleCallWaiter}
              className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 font-semibold whitespace-nowrap text-sm text-white">
              🔔 Cheamă ospătar
            </button>
            <button onClick={() => setScreen("reserve")}
              className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 font-semibold whitespace-nowrap text-sm text-white">
              📅 Rezervare
            </button>
            <button onClick={() => setScreen("menu-pdf")}
              className={`px-4 py-2 rounded-lg ${darkTheme ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} font-semibold whitespace-nowrap text-sm`}>
              📄 Meniu PDF
            </button>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                !selectedCategory ? "bg-blue-600 text-white" : `${darkTheme ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`
              }`}>
              Toate
            </button>
            {categories.map((c) => (
              <button key={c.id} onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                  selectedCategory === c.id ? "bg-blue-600 text-white" : `${darkTheme ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`
                }`}>
                {c.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((p) => (
              <button key={p.id} onClick={() => addToCart(p)}
                className={`${cardBg} rounded-xl shadow-lg p-4 border ${cardBorder} hover:border-blue-500 transition-all text-left`}>
                <div className="font-bold mb-1">{p.name}</div>
                <div className="text-lg text-green-400 font-bold">{p.price?.toFixed(2)} lei</div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className={`w-full md:w-80 ${cardBg} border-t md:border-t-0 md:border-l ${cardBorder} p-4 flex flex-col`}>
          <h2 className="text-xl font-bold mb-2">🛒 Coșul meu</h2>
          {splitMode && <div className={`text-xs ${mutedText} mb-2`}>Comandă activă: <span className="text-blue-400 font-bold">{currentPerson}</span></div>}

          <div className="flex-1 overflow-y-auto space-y-2">
            {cart.length === 0 ? (
              <p className={`${mutedText} text-center mt-6`}>Selectați produse din meniu</p>
            ) : (
              <>
                {splitMode && persons.length > 0 ? (
                  persons.map((person) => (
                    <div key={person}>
                      <div className="text-xs font-bold text-blue-400 mt-2 mb-1">{person}</div>
                      {cart.filter((i) => i.personLabel === person).map((item) => (
                        <div key={`${item.productId}-${item.personLabel}`}
                          className={`flex items-center justify-between ${darkTheme ? "bg-gray-700/50" : "bg-gray-100"} rounded-lg p-3`}>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate">{item.name}</div>
                            <div className={`text-sm ${mutedText}`}>{item.quantity} × {item.price.toFixed(2)} lei</div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button onClick={() => removeFromCart(item.productId, item.personLabel)}
                              className="w-7 h-7 rounded bg-red-700 hover:bg-red-600 text-xs font-bold text-white">−</button>
                            <button onClick={() => { setCurrentPerson(item.personLabel); addToCart({ id: item.productId, name: item.name, price: item.price }); }}
                              className="w-7 h-7 rounded bg-green-700 hover:bg-green-600 text-xs font-bold text-white">+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  cart.map((item) => (
                    <div key={item.productId}
                      className={`flex items-center justify-between ${darkTheme ? "bg-gray-700/50" : "bg-gray-100"} rounded-lg p-3`}>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{item.name}</div>
                        <div className={`text-sm ${mutedText}`}>{item.quantity} × {item.price.toFixed(2)} lei</div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button onClick={() => removeFromCart(item.productId, item.personLabel)}
                          className="w-7 h-7 rounded bg-red-700 hover:bg-red-600 text-xs font-bold text-white">−</button>
                        <button onClick={() => addToCart({ id: item.productId, name: item.name, price: item.price })}
                          className="w-7 h-7 rounded bg-green-700 hover:bg-green-600 text-xs font-bold text-white">+</button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>

          {/* Notes */}
          <div className={`border-t ${cardBorder} pt-3 mt-3`}>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="📝 Mențiuni: alergii, preferințe..."
              rows={2}
              className={`w-full p-2 rounded-lg border ${cardBorder} ${inputBg} text-sm resize-none mb-3`}
            />
            <div className="flex justify-between text-xl font-bold mb-4">
              <span>Total:</span>
              <span className="text-green-400">{total.toFixed(2)} lei</span>
            </div>
            <button onClick={handleOrder} disabled={cart.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-4 rounded-lg font-bold text-xl">
              {activeOrder ? "➕ Adaugă la comandă" : "📤 Trimite Comanda"}
            </button>
          </div>
        </div>
      </div>

      {/* Social footer */}
      <div className={`${cardBg} border-t ${cardBorder} p-3 flex items-center justify-center gap-4`}>
        {SOCIAL_LINKS.map((s) => (
          <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
            className={`flex items-center gap-1 text-sm ${mutedText} hover:text-blue-400`}>
            {s.icon} {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}
