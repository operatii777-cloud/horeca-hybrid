import { useState, useEffect } from "react";

export default function SalesPage({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tableNr, setTableNr] = useState(1);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState("pos"); // "pos" or "orders"

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
    loadOrders();
  }, []);

  const loadOrders = () => {
    fetch(`/api/orders?status=open&userId=${user.id}`)
      .then((r) => r.json())
      .then(setOrders);
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

  const closeOrder = async (orderId, payMethod) => {
    await fetch(`/api/orders/${orderId}/close`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payMethod }),
    });
    loadOrders();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
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
        /* Open orders view */
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Comenzi deschise</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500">Nu aveți comenzi deschise.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-gray-800 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-blue-400">
                      Masa {order.tableNr}
                    </span>
                    <span className="text-sm text-gray-400">
                      #{order.id}
                    </span>
                  </div>
                  <div className="space-y-1 mb-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}× {item.product.name}
                        </span>
                        <span className="text-gray-400">
                          {item.price * item.quantity} Lei
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-700 pt-3">
                    <span className="font-bold text-green-400">
                      {order.total} Lei
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => closeOrder(order.id, "CASH")}
                        className="px-3 py-1.5 rounded-lg bg-green-700 hover:bg-green-600 text-sm font-medium"
                      >
                        Cash
                      </button>
                      <button
                        onClick={() => closeOrder(order.id, "CARD")}
                        className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-sm font-medium"
                      >
                        Card
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
