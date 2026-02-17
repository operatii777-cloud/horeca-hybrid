import { useState, useEffect } from "react";

/**
 * Recipe Verification Tool
 * Checks that all products in the sales interface have recipes defined
 */
export default function RecipeVerificationPage({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    withRecipes: 0,
    withoutRecipes: 0,
    percentage: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, recipesRes] = await Promise.all([
        fetch("/api/products").then(r => r.json()),
        fetch("/api/recipes").then(r => r.json())
      ]);
      
      setProducts(productsRes);
      setRecipes(recipesRes);
      
      // Calculate stats
      const recipeProductIds = new Set(recipesRes.map(r => r.productId));
      const withRecipes = productsRes.filter(p => recipeProductIds.has(p.id));
      const withoutRecipes = productsRes.filter(p => !recipeProductIds.has(p.id));
      
      setStats({
        total: productsRes.length,
        withRecipes: withRecipes.length,
        withoutRecipes: withoutRecipes.length,
        percentage: productsRes.length > 0 ? Math.round((withRecipes.length / productsRes.length) * 100) : 0
      });
    } catch (err) {
      console.error("Error loading data:", err);
    }
    setLoading(false);
  };

  const productsWithoutRecipes = products.filter(
    p => !recipes.some(r => r.productId === p.id)
  );

  const productsWithRecipes = products.filter(
    p => recipes.some(r => r.productId === p.id)
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-amber-400">Verificare Rețete</h1>
          <span className="text-gray-400">|</span>
          <span className="text-gray-300">{user.name}</span>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-red-700 hover:bg-red-600 transition-colors"
        >
          Ieșire
        </button>
      </header>

      <div className="p-6">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Se încarcă...</div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="text-gray-400 text-sm">Total Produse</div>
                <div className="text-3xl font-bold text-blue-400 mt-1">{stats.total}</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="text-gray-400 text-sm">Cu Rețete</div>
                <div className="text-3xl font-bold text-green-400 mt-1">{stats.withRecipes}</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="text-gray-400 text-sm">Fără Rețete</div>
                <div className="text-3xl font-bold text-red-400 mt-1">{stats.withoutRecipes}</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="text-gray-400 text-sm">Acoperire</div>
                <div className="text-3xl font-bold text-amber-400 mt-1">{stats.percentage}%</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progres rețete</span>
                <span>{stats.withRecipes} / {stats.total}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-green-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>
            </div>

            {/* Products without recipes */}
            {productsWithoutRecipes.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 mb-6">
                <h2 className="text-lg font-bold text-red-400 mb-4">
                  ⚠️ Produse fără Rețete ({productsWithoutRecipes.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {productsWithoutRecipes.map(product => (
                    <div key={product.id} className="bg-gray-700 rounded-lg p-3">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        {product.price} Lei • {product.unit}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {product.id} • Cat: {product.categoryId} • Dep: {product.departmentId}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products with recipes */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-green-400 mb-4">
                ✓ Produse cu Rețete ({productsWithRecipes.length})
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {productsWithRecipes.map(product => {
                  const recipe = recipes.find(r => r.productId === product.id);
                  return (
                    <div key={product.id} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-400 mt-1">
                            {product.price} Lei • {product.unit}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {recipe?.items?.length || 0} ingrediente
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={loadData}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium"
              >
                🔄 Reîncarcă Date
              </button>
              <a
                href="/management?tab=recipes"
                className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-medium inline-block"
              >
                + Adaugă Rețete
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
