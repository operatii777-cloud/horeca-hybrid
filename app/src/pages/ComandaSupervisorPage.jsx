import { useState, useEffect } from "react";

export default function ComandaSupervisorPage({ user }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tableNr, setTableNr] = useState(1);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts).catch(() => {});
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {});
    loadOrders();
  }, []);

  const loadOrders = () => {
    fetch("/api/orders?status=open")
      .then((r) => r.json())
      .then(setOrders)
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

  const occupiedTables = new Set(orders.map((o) => o.tableNr));

  const handleOrder = () => {
    if (cart.length === 0) return;
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableNr,
        userId: user?.id || 1,
        source: "supervisor",
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
      }),
    })
      .then((r) => r.json())
      .then(() => {
        setCart([]);
        setSent(true);
        loadOrders();
        setTimeout(() => setSent(false), 3000);
      })
      .catch(() => {});
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="bg-gray-800 p-3 border-b border-gray-700 flex items-center justify-between">
        <h1 className="text-xl font-bold text-amber-400">📋 Preluare Comandă — Ospătar</h1>
        <div className="text-sm text-gray-300">
          {user?.name || "Ospătar"} • Masa {tableNr}
        </div>
      </div>

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
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setTableNr(n)}
                  className={`w-12 h-12 rounded-xl text-sm font-bold transition-all ${
                    tableNr === n
                      ? "bg-blue-600 text-white ring-2 ring-blue-400"
                      : occupiedTables.has(n)
                      ? "bg-red-900/50 border-2 border-red-500 text-red-300 hover:bg-red-900/70"
                      : "bg-green-900/30 border-2 border-green-500 text-green-300 hover:bg-green-900/50"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div className="p-3">
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                  !selectedCategory ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                Toate
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                    selectedCategory === c.id ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Products grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="bg-gray-800 hover:bg-gray-700 active:bg-blue-700 rounded-xl p-3 text-left transition-colors border border-gray-700"
                >
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
            <div className="text-sm text-gray-400">{cart.length} produse</div>
          </div>

          <div className="flex-1 overflow-auto p-3">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center mt-8 text-sm">Selectați produse</p>
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

          <div className="p-3 border-t border-gray-700">
            <div className="flex justify-between text-lg font-bold mb-3">
              <span>Total:</span>
              <span className="text-green-400">{total.toFixed(2)} Lei</span>
            </div>
            <button
              onClick={handleOrder}
              disabled={cart.length === 0}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed font-bold text-lg transition-colors"
            >
              📤 Trimite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
