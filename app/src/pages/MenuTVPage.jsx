import { useState, useEffect, useRef } from "react";

export default function MenuTVPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts).catch(() => {});
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % categories.length);
    }, 8000);
    return () => clearInterval(timerRef.current);
  }, [categories.length]);

  const activeCategory = categories[activeIndex];
  const categoryProducts = activeCategory
    ? products.filter((p) => p.categoryId === activeCategory.id)
    : [];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-amber-400">📺 Meniu Digital</h1>
        <div className="flex gap-2">
          {categories.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActiveIndex(i)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                i === activeIndex
                  ? "bg-amber-500 text-black"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {activeCategory && (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-center">{activeCategory.name}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {categoryProducts.map((p) => (
              <div
                key={p.id}
                className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 text-center"
              >
                <div className="text-5xl mb-4">🍽️</div>
                <div className="text-xl font-bold mb-2">{p.name}</div>
                <div className="text-2xl font-bold text-green-400">
                  {p.price?.toFixed(2)} lei
                </div>
                {p.unit && (
                  <div className="text-sm text-gray-400 mt-1">/ {p.unit}</div>
                )}
              </div>
            ))}
            {categoryProducts.length === 0 && (
              <p className="text-gray-400 col-span-full text-center text-xl">
                Niciun produs în această categorie
              </p>
            )}
          </div>
        </div>
      )}

      {categories.length === 0 && (
        <div className="flex items-center justify-center h-96">
          <p className="text-2xl text-gray-400">Se încarcă meniul...</p>
        </div>
      )}

      <div className="flex justify-center mt-8 gap-2">
        {categories.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i === activeIndex ? "bg-amber-400 scale-125" : "bg-gray-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
