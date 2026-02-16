import { useState, useEffect } from "react";

const PAY_METHODS = [
  { id: "CASH", label: "Cash", icon: "💵", color: "bg-green-700 hover:bg-green-600" },
  { id: "CARD", label: "Card", icon: "💳", color: "bg-blue-700 hover:bg-blue-600" },
  { id: "VOUCHER", label: "Voucher", icon: "🎫", color: "bg-purple-700 hover:bg-purple-600" },
  { id: "DISCOUNT", label: "Discount", icon: "🏷️", color: "bg-yellow-700 hover:bg-yellow-600" },
  { id: "PROTOCOL", label: "Protocol", icon: "📋", color: "bg-gray-600 hover:bg-gray-500" },
];

export default function SalesPage({ user, onLogout, initialView = "pos", embedded = false }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tableNr, setTableNr] = useState(1);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState(initialView);
  const [payConfirm, setPayConfirm] = useState(null); // order being paid
  const [paySuccess, setPaySuccess] = useState(null); // successful payment info
  const [waiterCalls, setWaiterCalls] = useState([]);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
    loadOrders();
    loadWaiterCalls();
    const interval = setInterval(() => { loadOrders(); loadWaiterCalls(); }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    Promise.all([
      fetch("/api/orders?status=open").then((r) => r.json()),
      fetch("/api/orders?status=delivered").then((r) => r.json()),
    ])
      .then(([openOrders, deliveredOrders]) => {
        setOrders([...openOrders, ...deliveredOrders]);
      })
      .catch(() => {});
  };

  const loadWaiterCalls = () => {
    fetch("/api/call-waiter").then((r) => r.json()).then(setWaiterCalls).catch(() => {});
  };

  const acknowledgeCall = (callId) => {
    fetch(`/api/call-waiter/${callId}/acknowledge`, { method: "PUT" })
      .then(() => loadWaiterCalls())
      .catch(() => {});
  };

  const filteredProducts = selectedCategory
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
      return [
        ...prev,
        { productId: product.id, name: product.name, price: product.price, quantity: 1 },
      ];
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

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const sendOrder = async () => {
    if (cart.length === 0) return;
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableNr, userId: user.id, items: cart }),
    });
    setCart([]);
    loadOrders();
  };

  const deliverOrder = async (orderId) => {
    await fetch(`/api/orders/${orderId}/deliver`, { method: "PUT" });
    loadOrders();
  };

  const closeOrder = async (orderId, payMethod) => {
    const order = orders.find((o) => o.id === orderId);
    const res = await fetch(`/api/orders/${orderId}/close`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payMethod }),
    });
    const closed = await res.json();
    setPayConfirm(null);
    setPaySuccess({ orderId, payMethod, total: closed.total || order?.total || 0, tableNr: closed.tableNr || order?.tableNr });
    setTimeout(() => setPaySuccess(null), 4000);
    loadOrders();
  };

  const allItemsReady = (order) => {
    return order.items && order.items.length > 0 && order.items.every((i) => i.ready);
  };

  const someItemsReady = (order) => {
    return order.items && order.items.some((i) => i.ready);
  };

  const billRequestOrders = orders.filter((o) => o.payMethod && o.status !== "closed" && o.status !== "delivered");

  return (
    <div className={embedded ? "text-white" : "min-h-screen bg-gray-900 text-white"}>
      {/* Header - only show when not embedded */}
      {!embedded && (
      <header className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-blue-400">Vânzare</h1>
          <span className="text-gray-400">|</span>
          <span className="text-gray-300">{user.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("pos")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === "pos" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            Comandă nouă
          </button>
          <button
            onClick={() => { setView("orders"); loadOrders(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === "orders" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            Comenzi deschise ({orders.length})
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-700 hover:bg-red-600 transition-colors"
          >
            Ieșire
          </button>
        </div>
      </header>
      )}

      {/* Payment success overlay */}
      {paySuccess && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-8 border-2 border-green-500 text-center max-w-sm">
            <div className="text-6xl mb-4">✅</div>
            <div className="text-2xl font-bold text-green-400 mb-2">Plată confirmată!</div>
            <div className="text-gray-300 mb-1">Comanda #{paySuccess.orderId} • Masa {paySuccess.tableNr}</div>
            <div className="text-3xl font-bold text-white mb-2">{paySuccess.total} Lei</div>
            <div className="text-sm text-gray-400">
              Metoda: {PAY_METHODS.find((p) => p.id === paySuccess.payMethod)?.icon}{" "}
              {PAY_METHODS.find((p) => p.id === paySuccess.payMethod)?.label}
            </div>
          </div>
        </div>
      )}

      {/* Payment confirmation modal */}
      {payConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">💰 Încasare Comandă #{payConfirm.id}</h2>
              <button onClick={() => setPayConfirm(null)} className="text-gray-400 hover:text-white text-2xl">✕</button>
            </div>

            {/* Receipt summary */}
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Masa {payConfirm.tableNr}</span>
                <span>{payConfirm.source === "qr" ? "📱 QR" : payConfirm.source === "supervisor" ? "📋 Ospătar" : "🛒 POS"}</span>
              </div>
              <div className="space-y-1 border-t border-gray-700 pt-2">
                {(payConfirm.items || []).map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}× {item.product?.name}</span>
                    <span>{(item.price * item.quantity).toFixed(2)} lei</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between text-xl font-bold">
                <span>TOTAL:</span>
                <span className="text-green-400">{(payConfirm.total || 0).toFixed(2)} Lei</span>
              </div>
            </div>

            {payConfirm.payMethod && payConfirm.status === "open" && (
              <div className="bg-amber-900/30 border border-amber-500 rounded-lg p-3 mb-4 text-center">
                <div className="text-sm font-bold text-amber-400">🧾 Clientul a cerut nota</div>
                <div className="text-xs text-gray-400">Preferință: {payConfirm.payMethod}</div>
              </div>
            )}

            <div className="text-sm text-gray-400 mb-3 font-semibold">Selectați metoda de plată:</div>
            <div className="grid grid-cols-2 gap-3">
              {PAY_METHODS.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => closeOrder(payConfirm.id, pm.id)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold ${pm.color} flex items-center justify-center gap-2`}
                >
                  <span className="text-lg">{pm.icon}</span>
                  <span>{pm.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === "pos" ? (
        <div className="flex h-[calc(100vh-60px)]">
          {/* Product grid */}
          <div className="flex-1 p-4 overflow-auto">
            {/* Category filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  !selectedCategory ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                Toate
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat.id ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Products */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-gray-800 hover:bg-gray-700 active:bg-blue-700 rounded-xl p-4 text-left transition-colors"
                >
                  <div className="font-medium text-sm truncate">{product.name}</div>
                  <div className="text-blue-400 font-bold mt-1">{product.price} Lei</div>
                </button>
              ))}
            </div>
          </div>

          {/* Cart sidebar */}
          <div className="w-80 bg-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <label className="text-sm text-gray-400">Masa Nr.</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setTableNr(n)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                      tableNr === n ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center mt-8">
                  Selectați produse
                </p>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between bg-gray-700 rounded-lg px-3 py-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{item.name}</div>
                        <div className="text-xs text-gray-400">
                          {item.quantity} × {item.price} Lei
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
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-700">
              <div className="flex justify-between text-lg font-bold mb-3">
                <span>Total:</span>
                <span className="text-green-400">{cartTotal} Lei</span>
              </div>
              <button
                onClick={sendOrder}
                disabled={cart.length === 0}
                className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed font-bold text-lg transition-colors"
              >
                Trimite comanda
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Open orders view with ready/deliver/pay flow */
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Comenzi deschise</h2>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span> Se pregătește</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Gata (KDS)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Livrată</span>
            </div>
          </div>

          {/* Bill request notifications */}
          {billRequestOrders.length > 0 && (
            <div className="mb-4 space-y-2">
              {billRequestOrders.map((o) => (
                <div key={o.id} className="bg-amber-900/30 border-2 border-amber-500 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧾</span>
                    <div>
                      <div className="font-bold text-amber-400">Masa {o.tableNr} — Notă cerută!</div>
                      <div className="text-xs text-gray-400">Comanda #{o.id} • Preferință: {o.payMethod} • {o.total} Lei</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setPayConfirm(o)}
                    className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg font-bold text-sm"
                  >
                    💰 Încasează
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Waiter call notifications */}
          {waiterCalls.length > 0 && (
            <div className="mb-4 space-y-2">
              {waiterCalls.map((call) => (
                <div key={call.id} className="bg-red-900/30 border-2 border-red-500 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl animate-pulse">🔔</span>
                    <div>
                      <div className="font-bold text-red-400">Masa {call.tableNr} — Cheamă ospătarul!</div>
                      <div className="text-xs text-gray-400">{call.type === "call" ? "Chemare ospătar" : call.type}</div>
                    </div>
                  </div>
                  <button onClick={() => acknowledgeCall(call.id)}
                    className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded-lg font-bold text-sm">
                    ✓ Confirmat
                  </button>
                </div>
              ))}
            </div>
          )}

          {orders.length === 0 ? (
            <p className="text-gray-500">Nu sunt comenzi deschise.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => {
                const ready = allItemsReady(order);
                const partial = someItemsReady(order);
                const delivered = order.status === "delivered";
                const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
                const sourceLabel = order.source === "qr" ? "📱 QR" : order.source === "supervisor" ? "📋 Ospătar" : "🛒 POS";
                const hasBillRequest = order.payMethod && order.status === "open";

                let borderClass = "border-yellow-500/50";
                if (hasBillRequest) borderClass = "border-amber-500";
                else if (delivered) borderClass = "border-blue-500";
                else if (ready) borderClass = "border-green-500";

                return (
                  <div key={order.id} className={`bg-gray-800 rounded-xl p-4 border-2 ${borderClass}`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-400">Masa {order.tableNr}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-700">{sourceLabel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-gray-700 px-2 py-0.5 rounded">{elapsed} min</span>
                        <span className="text-sm text-gray-400">#{order.id}</span>
                      </div>
                    </div>

                    {/* Bill request badge */}
                    {hasBillRequest && (
                      <div className="mb-2 bg-amber-900/30 border border-amber-500 rounded-lg px-3 py-1.5 text-center">
                        <span className="text-xs font-bold text-amber-400">🧾 Nota cerută — {order.payMethod}</span>
                      </div>
                    )}

                    {/* Order notes */}
                    {order.notes && (
                      <div className="mb-2 text-xs text-gray-400 italic bg-gray-700/50 rounded px-2 py-1">
                        📝 {order.notes}
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="mb-3">
                      {delivered ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-600 font-semibold">✅ Livrată — așteaptă plata</span>
                      ) : ready ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-600 font-semibold">🍽️ GATA — de preluat</span>
                      ) : partial ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-600 font-semibold">⏳ Parțial gata</span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-600 font-semibold">🔥 Se pregătește</span>
                      )}
                    </div>

                    {/* Items */}
                    <div className="space-y-1 mb-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="flex items-center gap-1">
                            {item.ready ? (
                              <span className="text-green-400">✓</span>
                            ) : (
                              <span className="text-yellow-400">⏳</span>
                            )}
                            {item.quantity}× {item.product?.name}
                            {item.personLabel && <span className="text-blue-400 text-xs ml-1">({item.personLabel})</span>}
                          </span>
                          <span className="text-gray-400">
                            {item.price * item.quantity} Lei
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer with actions */}
                    <div className="border-t border-gray-700 pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-green-400 text-lg">
                          {order.total} Lei
                        </span>
                        <span className="text-xs text-gray-400">{order.user?.name || "—"}</span>
                      </div>

                      {!delivered && ready && (
                        <button
                          onClick={() => deliverOrder(order.id)}
                          className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-bold mb-2"
                        >
                          🍽️ Marchează ca Livrată
                        </button>
                      )}

                      {delivered && (
                        <button
                          onClick={() => setPayConfirm(order)}
                          className="w-full px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-sm font-bold"
                        >
                          💰 Încasează ({order.total} Lei)
                        </button>
                      )}

                      {!delivered && !ready && !hasBillRequest && (
                        <div className="text-center text-xs text-gray-400 py-1">
                          Așteptăm pregătirea în bucătărie/bar...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
