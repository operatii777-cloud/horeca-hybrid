import { useState, useEffect } from "react";

export default function ComandaSupervisorPage({ user }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tableNr, setTableNr] = useState(1);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sent, setSent] = useState(false);
  const [showTableOrder, setShowTableOrder] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [waiterCalls, setWaiterCalls] = useState([]);
  const [splitMode, setSplitMode] = useState(false);
  const [currentPerson, setCurrentPerson] = useState("Persoana 1");

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts).catch(() => {});
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {});
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
      .then(([openOrders, deliveredOrders]) => setOrders([...openOrders, ...deliveredOrders]))
      .catch(() => {});
  };

  const loadWaiterCalls = () => {
    fetch("/api/call-waiter")
      .then((r) => r.json())
      .then(setWaiterCalls)
      .catch(() => {});
  };

  const acknowledgeCall = (callId) => {
    fetch(`/api/call-waiter/${callId}/acknowledge`, { method: "PUT" })
      .then(() => loadWaiterCalls())
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
            ? { ...i, quantity: i.quantity + 1 } : i
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
            ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => (splitMode ? `${i.productId}-${i.personLabel}` : `${i.productId}`) !== key);
    });
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const persons = [...new Set(cart.filter((i) => i.personLabel).map((i) => i.personLabel))];

  const occupiedTables = new Set(orders.map((o) => o.tableNr));
  const tableOrder = orders.find((o) => o.tableNr === tableNr);
  const tableCalls = waiterCalls.filter((c) => c.tableNr === tableNr);

  const handleOrder = () => {
    if (cart.length === 0) return;
    const orderItems = cart.map((i) => ({
      productId: i.productId, quantity: i.quantity, price: i.price, personLabel: i.personLabel || "",
    }));

    if (tableOrder && tableOrder.status === "open") {
      fetch(`/api/orders/${tableOrder.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: orderItems }),
      })
        .then((r) => r.json())
        .then(() => {
          setCart([]);
          setOrderNotes("");
          setSent(true);
          loadOrders();
          setTimeout(() => setSent(false), 3000);
        })
        .catch(() => {});
    } else {
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNr,
          userId: user?.id || 1,
          source: "supervisor",
          notes: orderNotes,
          items: orderItems,
        }),
      })
        .then((r) => r.json())
        .then(() => {
          setCart([]);
          setOrderNotes("");
          setSent(true);
          loadOrders();
          setTimeout(() => setSent(false), 3000);
        })
        .catch(() => {});
    }
  };

  const readyCount = tableOrder ? (tableOrder.items || []).filter((i) => i.ready).length : 0;
  const totalItems = tableOrder ? (tableOrder.items || []).length : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="bg-gray-800 p-3 border-b border-gray-700 flex items-center justify-between">
        <h1 className="text-xl font-bold text-amber-400">📋 Preluare Comandă — Ospătar</h1>
        <div className="flex items-center gap-3">
          {waiterCalls.length > 0 && (
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
              🔔 {waiterCalls.length} apel{waiterCalls.length > 1 ? "uri" : ""}
            </span>
          )}
          <div className="text-sm text-gray-300">
            {user?.name || "Ospătar"} • Masa {tableNr}
          </div>
        </div>
      </div>

      {/* Waiter call notifications */}
      {waiterCalls.length > 0 && (
        <div className="px-3 py-2 bg-red-900/30 border-b border-red-800 space-y-1">
          {waiterCalls.map((call) => (
            <div key={call.id} className="flex items-center justify-between bg-red-900/40 rounded-lg px-3 py-2">
              <span className="text-sm font-bold text-red-300">
                🔔 Masa {call.tableNr} — {call.type === "call" ? "Cheamă ospătarul" : call.type === "bill" ? "Cere nota" : "Ajutor"}
              </span>
              <button onClick={() => acknowledgeCall(call.id)}
                className="px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-xs font-bold">
                ✓ Confirmat
              </button>
            </div>
          ))}
        </div>
      )}

      {sent && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-7xl mb-4">✅</div>
            <div className="text-3xl font-bold text-green-400">Comanda a fost trimisă!</div>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Left: Table select + Products */}
        <div className="flex-1 flex flex-col overflow-auto">
          {/* Table selector */}
          <div className="p-3 bg-gray-800/50 border-b border-gray-700">
            <div className="text-sm text-gray-400 mb-2 font-semibold">Selectează Masa:</div>
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                const hasCall = waiterCalls.some((c) => c.tableNr === n);
                return (
                  <button
                    key={n}
                    onClick={() => setTableNr(n)}
                    className={`w-12 h-12 rounded-xl text-sm font-bold transition-all relative ${
                      tableNr === n
                        ? "bg-blue-600 text-white ring-2 ring-blue-400"
                        : occupiedTables.has(n)
                        ? "bg-red-900/50 border-2 border-red-500 text-red-300 hover:bg-red-900/70"
                        : "bg-green-900/30 border-2 border-green-500 text-green-300 hover:bg-green-900/50"
                    }`}
                  >
                    {n}
                    {hasCall && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse">!</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Existing order info for this table */}
          {tableOrder && (
            <div className="mx-3 mt-3 bg-gray-800 rounded-xl border border-gray-700 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-400">Comanda #{tableOrder.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    tableOrder.status === "delivered" ? "bg-blue-600" :
                    readyCount === totalItems && totalItems > 0 ? "bg-green-600" : "bg-yellow-600"
                  }`}>
                    {tableOrder.status === "delivered" ? "Livrată" :
                     readyCount === totalItems && totalItems > 0 ? "Gata" : `${readyCount}/${totalItems} gata`}
                  </span>
                  {tableOrder.payMethod && (
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-900/50 text-amber-300">
                      🧾 Nota cerută ({tableOrder.payMethod})
                    </span>
                  )}
                </div>
                <button onClick={() => setShowTableOrder(!showTableOrder)}
                  className="text-xs text-gray-400 hover:text-white px-2 py-1 bg-gray-700 rounded">
                  {showTableOrder ? "Ascunde" : "Detalii"}
                </button>
              </div>
              {tableOrder.notes && (
                <div className="text-xs text-gray-400 italic mb-2">📝 {tableOrder.notes}</div>
              )}
              {showTableOrder && (
                <div className="space-y-1 mt-2 border-t border-gray-700 pt-2">
                  {(tableOrder.items || []).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        {item.ready ? <span className="text-green-400">✓</span> : <span className="text-yellow-400">⏳</span>}
                        {item.quantity}× {item.product?.name}
                        {item.personLabel && <span className="text-blue-400 text-xs ml-1">({item.personLabel})</span>}
                      </span>
                      <span className="text-gray-400">{(item.price * item.quantity).toFixed(2)} lei</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-2 border-t border-gray-700">
                    <span>Total:</span>
                    <span className="text-green-400">{(tableOrder.total || 0).toFixed(2)} lei</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Waiter call for selected table */}
          {tableCalls.length > 0 && (
            <div className="mx-3 mt-2 bg-amber-900/30 border border-amber-600 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-amber-300 font-bold">🔔 Clientul de la masa {tableNr} a chemat ospătarul</span>
              <button onClick={() => tableCalls.forEach((c) => acknowledgeCall(c.id))}
                className="px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-xs font-bold">
                ✓ Am preluat
              </button>
            </div>
          )}

          {/* Split mode toggle */}
          <div className="px-3 pt-2">
            <button onClick={() => setSplitMode(!splitMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${splitMode ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-400"}`}>
              {splitMode ? "👥 Mod Separat ACTIV" : "👤 Comandă împreună"}
            </button>
            {splitMode && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {["Persoana 1", "Persoana 2", "Persoana 3", "Persoana 4"].map((p) => (
                  <button key={p} onClick={() => setCurrentPerson(p)}
                    className={`px-2 py-1 rounded text-xs font-bold ${currentPerson === p ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category filter */}
          <div className="p-3">
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              <button onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                  !selectedCategory ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                }`}>
                Toate
              </button>
              {categories.map((c) => (
                <button key={c.id} onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                    selectedCategory === c.id ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                  }`}>
                  {c.name}
                </button>
              ))}
            </div>

            {/* Products grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {filtered.map((p) => (
                <button key={p.id} onClick={() => addToCart(p)}
                  className="bg-gray-800 hover:bg-gray-700 active:bg-blue-700 rounded-xl p-3 text-left transition-colors border border-gray-700">
                  <div className="font-medium text-sm truncate">{p.name}</div>
                  <div className="text-blue-400 font-bold mt-1 text-sm">{p.price} Lei</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart */}
        <div className="w-72 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-700 bg-blue-900/30">
            <div className="font-bold text-lg">Masa {tableNr}</div>
            <div className="text-sm text-gray-400">
              {tableOrder ? `Comandă existentă #${tableOrder.id}` : "Comandă nouă"} • {cart.length} produse noi
            </div>
          </div>

          <div className="flex-1 overflow-auto p-3">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center mt-8 text-sm">Selectați produse</p>
            ) : (
              <div className="space-y-2">
                {splitMode && persons.length > 0 ? (
                  persons.map((person) => (
                    <div key={person}>
                      <div className="text-xs font-bold text-blue-400 mt-1 mb-1">{person}</div>
                      {cart.filter((i) => i.personLabel === person).map((item) => (
                        <div key={`${item.productId}-${item.personLabel}`}
                          className="flex items-center justify-between bg-gray-700 rounded-lg px-3 py-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate">{item.name}</div>
                            <div className="text-xs text-gray-400">{item.quantity} × {item.price} Lei</div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button onClick={() => removeFromCart(item.productId, item.personLabel)}
                              className="w-7 h-7 rounded bg-red-700 hover:bg-red-600 text-xs font-bold">−</button>
                            <button onClick={() => { setCurrentPerson(item.personLabel); addToCart({ id: item.productId, name: item.name, price: item.price }); }}
                              className="w-7 h-7 rounded bg-green-700 hover:bg-green-600 text-xs font-bold">+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  cart.map((item) => (
                    <div key={item.productId}
                      className="flex items-center justify-between bg-gray-700 rounded-lg px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{item.name}</div>
                        <div className="text-xs text-gray-400">{item.quantity} × {item.price} Lei</div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button onClick={() => removeFromCart(item.productId, item.personLabel)}
                          className="w-7 h-7 rounded bg-red-700 hover:bg-red-600 text-xs font-bold">−</button>
                        <button onClick={() => addToCart({ id: item.productId, name: item.name, price: item.price })}
                          className="w-7 h-7 rounded bg-green-700 hover:bg-green-600 text-xs font-bold">+</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-700">
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="📝 Mențiuni: alergii, preferințe..."
              rows={2}
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-sm resize-none mb-2 text-white"
            />
            <div className="flex justify-between text-lg font-bold mb-3">
              <span>Total:</span>
              <span className="text-green-400">{total.toFixed(2)} Lei</span>
            </div>
            <button onClick={handleOrder} disabled={cart.length === 0}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed font-bold text-lg transition-colors">
              {tableOrder && tableOrder.status === "open" ? "➕ Adaugă la comandă" : "📤 Trimite"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
