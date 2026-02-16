import { useState, useEffect } from "react";

export default function KioskSelfServicePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [ordered, setOrdered] = useState(false);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts).catch(() => {});
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {});
  }, []);

  const filtered = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const handleOrder = () => {
    if (cart.length === 0) return;
    setOrdered(true);
    setCart([]);
    setTimeout(() => setOrdered(false), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <h1 className="text-3xl font-bold text-center">🥡 Self-Service</h1>
      </div>

      {ordered && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-8xl mb-6">✅</div>
            <div className="text-4xl font-bold text-green-400">Comanda a fost trimisă!</div>
            <div className="text-xl text-gray-400 mt-2">Vă mulțumim!</div>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        <div className="flex-1 p-4">
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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-blue-500 transition-all text-left"
              >
                <div className="text-lg font-bold mb-2">{p.name}</div>
                <div className="text-xl text-green-400 font-bold">
                  {p.price?.toFixed(2)} lei
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 flex flex-col">
          <h2 className="text-xl font-bold mb-4">🛒 Coș</h2>
          <div className="flex-1 overflow-y-auto space-y-2">
            {cart.length === 0 ? (
              <p className="text-gray-400 text-center mt-10">Coșul este gol</p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3"
                >
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-sm text-gray-400">
                      {item.qty} x {item.price.toFixed(2)} lei
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-300 text-xl"
                  >
                    ✕
                  </button>
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
              🛒 Comandă
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
