import { useState, useEffect } from "react";

export default function ComandaQRPage({ tableNr: propTable }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [ordered, setOrdered] = useState(false);
  const [tableNr] = useState(() => {
    if (propTable) return propTable;
    const params = new URLSearchParams(window.location.search);
    return Number(params.get("table")) || 1;
  });

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts).catch(() => {});
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {});
  }, []);

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
      .then(() => {
        setOrdered(true);
        setCart([]);
        setTimeout(() => setOrdered(false), 5000);
      })
      .catch(() => {});
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-400">📱 Comanda Online</h1>
        <div className="bg-blue-600 px-4 py-1.5 rounded-lg font-bold text-lg">
          Masa {tableNr}
        </div>
      </div>

      {ordered && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center p-8">
            <div className="text-8xl mb-6">✅</div>
            <div className="text-4xl font-bold text-green-400">Comanda a fost trimisă!</div>
            <div className="text-xl text-gray-400 mt-2">Ospătarul vă va servi în curând</div>
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
              📤 Trimite Comanda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
