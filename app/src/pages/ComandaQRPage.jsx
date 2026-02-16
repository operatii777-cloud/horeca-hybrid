import { useState, useEffect } from "react";

const QR_PAY_OPTIONS = [
  { id: "CASH", label: "Cash la masă", icon: "💵" },
  { id: "CARD", label: "Card la masă", icon: "💳" },
  { id: "CARD_POS", label: "Card la casă", icon: "🏧" },
];

export default function ComandaQRPage({ tableNr: propTable }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [ordered, setOrdered] = useState(false);
  const [screen, setScreen] = useState("menu"); // "menu" | "tracking" | "bill"
  const [activeOrder, setActiveOrder] = useState(null);
  const [billRequested, setBillRequested] = useState(false);
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
          if (screen === "menu" && !ordered) {
            setScreen("tracking");
          }
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
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.productId !== productId);
    });
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleOrder = () => {
    if (cart.length === 0) return;

    if (activeOrder && activeOrder.status === "open") {
      fetch(`/api/orders/${activeOrder.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        }),
      })
        .then((r) => r.json())
        .then((updated) => {
          setActiveOrder(updated);
          setOrdered(true);
          setCart([]);
          setTimeout(() => { setOrdered(false); setScreen("tracking"); }, 3000);
        })
        .catch(() => {});
    } else {
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNr,
          userId: 1,
          source: "qr",
          items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        }),
      })
        .then((r) => r.json())
        .then((newOrder) => {
          setActiveOrder(newOrder);
          setOrdered(true);
          setCart([]);
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
      .then(() => {
        setBillRequested(true);
      })
      .catch(() => {});
  };

  const readyCount = activeOrder ? (activeOrder.items || []).filter((i) => i.ready).length : 0;
  const totalItems = activeOrder ? (activeOrder.items || []).length : 0;
  const allReady = totalItems > 0 && readyCount === totalItems;

  // Tracking screen
  if (screen === "tracking" && activeOrder) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-amber-400">📱 Comanda Mea</h1>
          <div className="bg-blue-600 px-4 py-1.5 rounded-lg font-bold text-lg">Masa {tableNr}</div>
        </div>

        <div className="flex-1 p-4 max-w-lg mx-auto w-full">
          {/* Order status */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold">Comanda #{activeOrder.id}</span>
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                activeOrder.status === "delivered" ? "bg-blue-600" :
                allReady ? "bg-green-600" : "bg-yellow-600"
              }`}>
                {activeOrder.status === "delivered" ? "✅ Livrată" :
                 allReady ? "🍽️ Gata de servire" : "🔥 Se pregătește"}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Pregătire</span>
                <span>{readyCount}/{totalItems} produse gata</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${allReady ? "bg-green-500" : "bg-amber-500"}`}
                  style={{ width: `${totalItems > 0 ? (readyCount / totalItems) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Items with status */}
            <div className="space-y-2">
              {(activeOrder.items || []).map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${item.ready ? "text-green-400" : "text-yellow-400"}`}>
                      {item.ready ? "✅" : "⏳"}
                    </span>
                    <div>
                      <div className="font-medium text-sm">{item.product?.name}</div>
                      <div className="text-xs text-gray-400">x{item.quantity}</div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-300">{(item.price * item.quantity).toFixed(2)} lei</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-700 mt-4 pt-3 flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-green-400">{(activeOrder.total || 0).toFixed(2)} lei</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setScreen("menu")}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-lg"
            >
              ➕ Adaugă produse
            </button>

            {!billRequested ? (
              <button
                onClick={() => setScreen("bill")}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 font-bold text-lg"
              >
                🧾 Cere nota de plată
              </button>
            ) : (
              <div className="bg-green-900/40 border-2 border-green-500 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">✅</div>
                <div className="font-bold text-green-400">Nota a fost cerută!</div>
                <div className="text-sm text-gray-400">Ospătarul vine la masă</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Bill request screen
  if (screen === "bill" && activeOrder) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
          <button onClick={() => setScreen("tracking")} className="text-gray-400 hover:text-white text-xl">← Înapoi</button>
          <h1 className="text-xl font-bold text-amber-400">🧾 Nota de plată</h1>
          <div className="bg-blue-600 px-3 py-1 rounded-lg font-bold">Masa {tableNr}</div>
        </div>

        <div className="flex-1 p-4 max-w-lg mx-auto w-full">
          {/* Receipt summary */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 mb-6">
            <div className="text-center mb-4">
              <div className="text-lg font-bold">Comanda #{activeOrder.id}</div>
              <div className="text-sm text-gray-400">Masa {tableNr}</div>
            </div>

            <div className="border-t border-gray-700 pt-3 space-y-2">
              {(activeOrder.items || []).map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity}× {item.product?.name}</span>
                  <span>{(item.price * item.quantity).toFixed(2)} lei</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-700 mt-4 pt-3 flex justify-between text-xl font-bold">
              <span>TOTAL:</span>
              <span className="text-green-400">{(activeOrder.total || 0).toFixed(2)} lei</span>
            </div>
          </div>

          {/* Payment preference */}
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-3 text-center">Cum doriți să plătiți?</h3>
            <div className="space-y-3">
              {QR_PAY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleRequestBill(opt.id)}
                  className="w-full py-4 rounded-xl bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 hover:border-blue-500 font-bold text-lg transition-all flex items-center justify-center gap-3"
                >
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
              <div className="text-gray-400">Ospătarul vine la masă pentru încasare</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Menu/ordering screen
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-400">📱 Comanda Online</h1>
        <div className="flex items-center gap-2">
          {activeOrder && (
            <button
              onClick={() => setScreen("tracking")}
              className="bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg font-bold text-sm"
            >
              📋 Vezi comanda
            </button>
          )}
          <div className="bg-blue-600 px-4 py-1.5 rounded-lg font-bold text-lg">
            Masa {tableNr}
          </div>
        </div>
      </div>

      {ordered && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center p-8">
            <div className="text-8xl mb-6">✅</div>
            <div className="text-4xl font-bold text-green-400">Comanda a fost trimisă!</div>
            <div className="text-xl text-gray-400 mt-2">Vă redirecționăm la statusul comenzii...</div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Product selection */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                !selectedCategory
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Toate
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                  selectedCategory === c.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-700 hover:border-blue-500 transition-all text-left"
              >
                <div className="font-bold mb-1">{p.name}</div>
                <div className="text-lg text-green-400 font-bold">
                  {p.price?.toFixed(2)} lei
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="w-full md:w-80 bg-gray-800 border-t md:border-t-0 md:border-l border-gray-700 p-4 flex flex-col">
          <h2 className="text-xl font-bold mb-4">🛒 Coșul meu</h2>
          <div className="flex-1 overflow-y-auto space-y-2">
            {cart.length === 0 ? (
              <p className="text-gray-400 text-center mt-6">Selectați produse din meniu</p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{item.name}</div>
                    <div className="text-sm text-gray-400">
                      {item.quantity} × {item.price.toFixed(2)} lei
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="w-7 h-7 rounded bg-red-700 hover:bg-red-600 text-xs font-bold"
                    >
                      −
                    </button>
                    <button
                      onClick={() => addToCart({ id: item.productId, name: item.name, price: item.price })}
                      className="w-7 h-7 rounded bg-green-700 hover:bg-green-600 text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-700 pt-4 mt-4">
            <div className="flex justify-between text-xl font-bold mb-4">
              <span>Total:</span>
              <span className="text-green-400">{total.toFixed(2)} lei</span>
            </div>
            <button
              onClick={handleOrder}
              disabled={cart.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-4 rounded-lg font-bold text-xl"
            >
              {activeOrder ? "➕ Adaugă la comandă" : "📤 Trimite Comanda"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
