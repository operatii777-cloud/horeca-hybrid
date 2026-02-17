import { useState, useEffect, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, themeQuartz, colorSchemeDark } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const agDarkTheme = themeQuartz.withPart(colorSchemeDark);

const tabs = [
  { id: "products", label: "Produse" },
  { id: "recipes", label: "Rețete" },
  { id: "suppliers", label: "Furnizori" },
  { id: "nir", label: "NIR" },
  { id: "transfers", label: "Transfer" },
  { id: "returs", label: "Retur" },
  { id: "inventory", label: "Inventar" },
  { id: "stock", label: "Stoc" },
  { id: "categories", label: "Categorii" },
  { id: "departments", label: "Departamente" },
  { id: "orders", label: "Comenzi" },
  { id: "reports", label: "Rapoarte" },
  { id: "users", label: "Utilizatori" },
];

export default function ManagementPage({ user, onLogout, initialTab = "products", embedded = false }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className={embedded ? "text-white" : "min-h-screen bg-gray-900 text-white"}>
      {!embedded && (
      <header className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-amber-400">Gestiune</h1>
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
      )}

      {!embedded && (
      <div className="bg-gray-800 border-t border-gray-700 px-4 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      )}

      <div className="p-4">
        {activeTab === "products" && <ProductsTab />}
        {activeTab === "recipes" && <RecipesTab />}
        {activeTab === "suppliers" && <SuppliersTab />}
        {activeTab === "nir" && <NIRTab />}
        {activeTab === "transfers" && <TransfersTab />}
        {activeTab === "returs" && <RetursTab />}
        {activeTab === "inventory" && <InventoryTab />}
        {activeTab === "stock" && <StockTab />}
        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "departments" && <DepartmentsTab />}
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "reports" && <ReportsTab />}
        {activeTab === "users" && <UsersTab />}
      </div>
    </div>
  );
}

/* ---------- Products Tab ---------- */
function ProductsTab() {
  const [rowData, setRowData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", unit: "buc", departmentId: "", categoryId: "" });

  const load = () => fetch("/api/products").then((r) => r.json()).then(setRowData);

  useEffect(() => {
    load();
    fetch("/api/departments").then((r) => r.json()).then(setDepartments);
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  const columnDefs = useMemo(() => [
    { field: "id", width: 70 },
    { field: "name", headerName: "Denumire", flex: 1, editable: true },
    { field: "price", headerName: "Preț", width: 100, editable: true },
    { field: "unit", headerName: "UM", width: 80, editable: true },
    { field: "department.name", headerName: "Departament", width: 140 },
    { field: "category.name", headerName: "Categorie", width: 140 },
    {
      headerName: "Stoc",
      width: 80,
      valueGetter: (params) => {
        const stocks = params.data.stockItems || [];
        return stocks.reduce((sum, s) => sum + s.quantity, 0);
      },
    },
    {
      headerName: "",
      width: 80,
      cellRenderer: (params) => (
        <button
          className="text-red-400 hover:text-red-300 text-xs"
          onClick={async () => {
            await fetch(`/api/products/${params.data.id}`, { method: "DELETE" });
            load();
          }}
        >
          Șterge
        </button>
      ),
    },
  ], []);

  const onCellValueChanged = useCallback(async (event) => {
    const { id } = event.data;
    const field = event.colDef.field;
    const value = field === "price" ? Number(event.newValue) : event.newValue;
    await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    load();
  }, []);

  const addProduct = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.departmentId || !form.categoryId) return;
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        price: Number(form.price),
        unit: form.unit,
        departmentId: Number(form.departmentId),
        categoryId: Number(form.categoryId),
      }),
    });
    setForm({ name: "", price: "", unit: "buc", departmentId: "", categoryId: "" });
    load();
  };

  return (
    <div>
      <form onSubmit={addProduct} className="flex gap-2 mb-4 flex-wrap items-end">
        <input placeholder="Denumire" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Preț" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm w-24" />
        <input placeholder="UM" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm w-20" />
        <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm">
          <option value="">Departament</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm">
          <option value="">Categorie</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-medium">Adaugă</button>
      </form>
      <div style={{ height: "calc(100vh - 220px)" }}>
        <AgGridReact theme={agDarkTheme} rowData={rowData} columnDefs={columnDefs} onCellValueChanged={onCellValueChanged} defaultColDef={{ sortable: true, filter: true, resizable: true }} />
      </div>
    </div>
  );
}

/* ---------- Recipes Tab ---------- */
function RecipesTab() {
  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ productId: "", items: [{ productId: "", quantity: "" }] });

  const load = () => fetch("/api/recipes").then((r) => r.json()).then(setRecipes);
  useEffect(() => {
    load();
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  }, []);

  const addIngredient = () => setForm({ ...form, items: [...form.items, { productId: "", quantity: "" }] });
  const removeIngredient = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const updateIngredient = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, items });
  };

  const addRecipe = async (e) => {
    e.preventDefault();
    if (!form.productId || form.items.some((i) => !i.productId || !i.quantity)) return;
    await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: Number(form.productId),
        items: form.items.map((i) => ({ productId: Number(i.productId), quantity: Number(i.quantity) })),
      }),
    });
    setForm({ productId: "", items: [{ productId: "", quantity: "" }] });
    load();
  };

  return (
    <div>
      <form onSubmit={addRecipe} className="mb-6 bg-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-bold mb-3">Rețetă nouă</h3>
        <div className="flex gap-2 items-end mb-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Produs final</label>
            <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm">
              <option value="">Selectează produsul</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-2 mb-3">
          {form.items.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-end">
              <select value={item.productId} onChange={(e) => updateIngredient(idx, "productId", e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm flex-1">
                <option value="">Ingredient</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
              </select>
              <input type="number" step="0.01" placeholder="Cant." value={item.quantity} onChange={(e) => updateIngredient(idx, "quantity", e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm w-24" />
              {form.items.length > 1 && (
                <button type="button" onClick={() => removeIngredient(idx)} className="text-red-400 hover:text-red-300 px-2 py-2 text-sm">✕</button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={addIngredient} className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm">+ Ingredient</button>
          <button type="submit" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-medium">Salvează rețeta</button>
        </div>
      </form>

      <div className="space-y-4">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-amber-400">{recipe.product.name}</h4>
              <button onClick={async () => { await fetch(`/api/recipes/${recipe.id}`, { method: "DELETE" }); load(); }} className="text-red-400 hover:text-red-300 text-xs">Șterge</button>
            </div>
            <div className="space-y-1">
              {recipe.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-gray-300">
                  <span>{item.product.name}</span>
                  <span>{item.quantity} {item.product.unit}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {recipes.length === 0 && <p className="text-gray-500">Nu există rețete.</p>}
      </div>
    </div>
  );
}

/* ---------- Suppliers Tab ---------- */
function SuppliersTab() {
  const [rowData, setRowData] = useState([]);
  const [name, setName] = useState("");

  const load = () => fetch("/api/suppliers").then((r) => r.json()).then(setRowData);
  useEffect(() => { load(); }, []);

  const columnDefs = useMemo(() => [
    { field: "id", width: 70 },
    { field: "name", headerName: "Denumire", flex: 1, editable: true },
    {
      headerName: "", width: 80,
      cellRenderer: (params) => (
        <button className="text-red-400 hover:text-red-300 text-xs" onClick={async () => { await fetch(`/api/suppliers/${params.data.id}`, { method: "DELETE" }); load(); }}>Șterge</button>
      ),
    },
  ], []);

  const onCellValueChanged = useCallback(async (event) => {
    await fetch(`/api/suppliers/${event.data.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: event.newValue }),
    });
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!name) return;
    await fetch("/api/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    setName("");
    load();
  };

  return (
    <div>
      <form onSubmit={add} className="flex gap-2 mb-4">
        <input placeholder="Denumire furnizor" value={name} onChange={(e) => setName(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm" />
        <button type="submit" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-medium">Adaugă</button>
      </form>
      <div style={{ height: "calc(100vh - 220px)" }}>
        <AgGridReact theme={agDarkTheme} rowData={rowData} columnDefs={columnDefs} onCellValueChanged={onCellValueChanged} defaultColDef={{ sortable: true, filter: true, resizable: true }} />
      </div>
    </div>
  );
}

/* ---------- NIR Tab ---------- */
function NIRTab() {
  const [nirs, setNirs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ 
    supplierId: "", 
    number: "", 
    items: [{ 
      productId: "", 
      productName: "",
      productCode: "",
      departmentId: "",
      unit: "kg",
      quantity: "", 
      price: "", 
      vatRate: "0",
      isNew: false
    }] 
  });
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printNir, setPrintNir] = useState(null);

  const load = () => fetch("/api/nir").then((r) => r.json()).then(setNirs);
  useEffect(() => {
    load();
    fetch("/api/suppliers").then((r) => r.json()).then(setSuppliers);
    fetch("/api/products").then((r) => r.json()).then(setProducts);
    fetch("/api/departments").then((r) => r.json()).then(setDepartments);
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showPrintModal) {
        setShowPrintModal(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showPrintModal]);

  const addItem = () => setForm({ 
    ...form, 
    items: [...form.items, { 
      productId: "", 
      productName: "",
      productCode: "",
      departmentId: "",
      unit: "kg",
      quantity: "", 
      price: "", 
      vatRate: "0",
      isNew: false
    }] 
  });
  
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  
  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    
    // If selecting existing product, auto-fill details
    if (field === "productId" && value && value !== "new") {
      const product = products.find(p => p.id === Number(value));
      if (product) {
        items[idx].productName = product.name;
        items[idx].productCode = product.code || "";
        items[idx].unit = product.unit;
        items[idx].isNew = false;
      }
    }
    
    // If selecting "new", enable manual entry
    if (field === "productId" && value === "new") {
      items[idx].isNew = true;
      items[idx].productId = "";
      items[idx].productName = "";
      items[idx].productCode = "";
    }
    
    setForm({ ...form, items });
  };

  const submit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.supplierId || !form.number) {
      alert("Vă rugăm completați furnizorul și numărul NIR");
      return;
    }
    
    if (form.items.some((i) => !i.departmentId || !i.quantity || !i.price)) {
      alert("Vă rugăm completați toate câmpurile obligatorii (gestiune, cantitate, preț)");
      return;
    }
    
    // Create new products first if needed
    const processedItems = [];
    for (const item of form.items) {
      let productId = item.productId;
      
      // Create new product if it's a new entry
      if (item.isNew && item.productName) {
        try {
          const newProduct = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: item.productName,
              code: item.productCode || "",
              price: Number(item.price),
              unit: item.unit,
              departmentId: Number(item.departmentId),
              categoryId: 1 // Default category for raw materials
            })
          });
          const createdProduct = await newProduct.json();
          productId = createdProduct.id;
        } catch (err) {
          console.error("Error creating product:", err);
          alert(`Eroare la crearea materiei prime: ${item.productName}`);
          return;
        }
      }
      
      processedItems.push({
        productId: Number(productId),
        departmentId: Number(item.departmentId),
        quantity: Number(item.quantity),
        price: Number(item.price),
        vatRate: Number(item.vatRate),
        markup: 0 // Markup will be added later in extended view
      });
    }
    
    // Create NIR
    await fetch("/api/nir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplierId: Number(form.supplierId),
        number: form.number,
        items: processedItems
      }),
    });
    
    // Reset form
    setForm({ 
      supplierId: "", 
      number: "", 
      items: [{ 
        productId: "", 
        productName: "",
        productCode: "",
        departmentId: "",
        unit: "kg",
        quantity: "", 
        price: "", 
        vatRate: "0",
        isNew: false
      }] 
    });
    
    // Reload data
    load();
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  };

  const handlePrint = (nir) => {
    setPrintNir(nir);
    setShowPrintModal(true);
  };

  const printDocument = () => {
    window.print();
  };

  return (
    <div>
      <form onSubmit={submit} className="mb-6 bg-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-bold mb-3">NIR nou (Notă de Intrare Recepție)</h3>
        <div className="flex gap-2 mb-3 flex-wrap">
          <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm">
            <option value="">Furnizor</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input placeholder="Nr. NIR" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm w-32" />
        </div>
        <div className="space-y-3 mb-3">
          {form.items.map((item, idx) => (
            <div key={idx} className="bg-gray-700/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-400 font-medium">Linia #{idx + 1}</span>
                {form.items.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeItem(idx)} 
                    className="text-red-400 hover:text-red-300 px-2 py-1 text-sm"
                  >
                    ✕ Șterge
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {/* Department/Warehouse Selection */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Gestiune *</label>
                  <select 
                    value={item.departmentId} 
                    onChange={(e) => updateItem(idx, "departmentId", e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Selectați gestiunea</option>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>

                {/* Product Selection or New Entry */}
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Materie Primă *</label>
                  <select 
                    value={item.isNew ? "new" : item.productId} 
                    onChange={(e) => updateItem(idx, "productId", e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Selectați materie primă ({products.length} disponibile)</option>
                    <option value="new" className="font-bold bg-green-900">➕ Adaugă materie primă nouă</option>
                    {products.map((p) => {
                      const stock = p.stockItems?.reduce((sum, s) => sum + s.quantity, 0) || 0;
                      return (
                        <option key={p.id} value={p.id}>
                          {p.name} | {p.code ? `COD: ${p.code} | ` : ''}{p.unit} | Stoc: {stock} | {p.price.toFixed(2)} Lei
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Show manual entry fields if "new" is selected */}
                {item.isNew && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Denumire *</label>
                      <input 
                        type="text"
                        placeholder="Numele materiei prime"
                        value={item.productName}
                        onChange={(e) => updateItem(idx, "productName", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">COD M.P</label>
                      <input 
                        type="text"
                        placeholder="Cod materie primă"
                        value={item.productCode}
                        onChange={(e) => updateItem(idx, "productCode", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">UM *</label>
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(idx, "unit", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                        required
                      >
                        <option value="kg">kg</option>
                        <option value="buc">buc</option>
                        <option value="l">l</option>
                        <option value="ml">ml</option>
                        <option value="g">g</option>
                        <option value="pahar">pahar</option>
                        <option value="cutie">cutie</option>
                        <option value="pachet">pachet</option>
                      </select>
                    </div>
                  </>
                )}
                
                {/* Show COD M.P for existing products */}
                {!item.isNew && item.productId && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">COD M.P</label>
                    <input 
                      type="text"
                      value={item.productCode}
                      readOnly
                      className="w-full bg-gray-600 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-400"
                    />
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Cantitate intrare *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="Cantitate" 
                    value={item.quantity} 
                    onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>

                {/* Unit Price */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Preț unitar (Lei) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="Preț unitar" 
                    value={item.price} 
                    onChange={(e) => updateItem(idx, "price", e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>

                {/* VAT Rate */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">TVA % *</label>
                  <select 
                    value={item.vatRate} 
                    onChange={(e) => updateItem(idx, "vatRate", e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                    required
                  >
                    <option value="0">TVA 0%</option>
                    <option value="5">TVA 5%</option>
                    <option value="11">TVA 11%</option>
                    <option value="21">TVA 21%</option>
                  </select>
                </div>
                
                {/* Calculated Value */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Valoare (Lei)</label>
                  <input 
                    type="text"
                    value={item.quantity && item.price ? (Number(item.quantity) * Number(item.price)).toFixed(2) : "0.00"}
                    readOnly
                    className="w-full bg-gray-600 border border-gray-600 rounded-lg px-3 py-2 text-sm text-amber-400 font-medium"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={addItem} className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm">+ Adaugă produs</button>
          <button type="submit" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-medium">Generează NIR</button>
        </div>
      </form>

      <div className="space-y-4">
        {nirs.map((nir) => (
          <div key={nir.id} className="bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <span className="font-bold text-amber-400">NIR #{nir.number}</span>
                <span className="text-gray-400 text-sm ml-3">{nir.supplier.name}</span>
                <span className="text-gray-500 text-xs ml-3">{new Date(nir.date).toLocaleString("ro-RO")}</span>
              </div>
              <button 
                onClick={() => handlePrint(nir)}
                className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
              >
                🖨️ Printează
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-gray-700">
                  <tr className="text-left text-gray-400">
                    <th className="py-2 px-1">Produs</th>
                    <th className="py-2 px-1 text-center">UM</th>
                    <th className="py-2 px-1 text-right">Cant.</th>
                    <th className="py-2 px-1 text-right">Preț U.</th>
                    <th className="py-2 px-1 text-right">Valoare</th>
                    <th className="py-2 px-1 text-right">TVA %</th>
                    <th className="py-2 px-1 text-right">TVA Tot</th>
                    <th className="py-2 px-1 text-right">Adaos %</th>
                    <th className="py-2 px-1 text-right">Adaos V.</th>
                    <th className="py-2 px-1 text-right">TVA Ad.</th>
                    <th className="py-2 px-1 text-right">Preț V.</th>
                    <th className="py-2 px-1 text-right">Val. V.</th>
                  </tr>
                </thead>
                <tbody>
                  {nir.items.map((item) => {
                    // Base calculations
                    const valoare = item.quantity * item.price;
                    const tvaTot = valoare * (item.vatRate / 100);
                    const adaosValoare = valoare * (item.markup / 100);
                    const tvaAdaos = adaosValoare * (item.vatRate / 100);
                    const pretVanzare = item.price * (1 + item.markup / 100);
                    const valoareVanzare = item.quantity * pretVanzare;
                    
                    return (
                      <tr key={item.id} className="text-gray-300 border-b border-gray-700/50">
                        <td className="py-2 px-1">{item.product.name}</td>
                        <td className="py-2 px-1 text-center">{item.product.unit}</td>
                        <td className="py-2 px-1 text-right">{item.quantity}</td>
                        <td className="py-2 px-1 text-right">{item.price.toFixed(2)}</td>
                        <td className="py-2 px-1 text-right">{valoare.toFixed(2)}</td>
                        <td className="py-2 px-1 text-right">{item.vatRate}%</td>
                        <td className="py-2 px-1 text-right">{tvaTot.toFixed(2)}</td>
                        <td className="py-2 px-1 text-right">{item.markup}%</td>
                        <td className="py-2 px-1 text-right">{adaosValoare.toFixed(2)}</td>
                        <td className="py-2 px-1 text-right">{tvaAdaos.toFixed(2)}</td>
                        <td className="py-2 px-1 text-right">{pretVanzare.toFixed(2)}</td>
                        <td className="py-2 px-1 text-right font-medium">{valoareVanzare.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t-2 border-gray-600">
                  <tr className="text-amber-400 font-bold">
                    <td className="py-2 px-1" colSpan="11">Total NIR</td>
                    <td className="py-2 px-1 text-right">
                      {nir.items.reduce((sum, item) => {
                        const pretVanzare = item.price * (1 + item.markup / 100);
                        return sum + (item.quantity * pretVanzare);
                      }, 0).toFixed(2)} Lei
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))}
        {nirs.length === 0 && <p className="text-gray-500">Nu există NIR-uri înregistrate.</p>}
      </div>

      {/* Print Modal */}
      {showPrintModal && printNir && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" 
          onClick={() => setShowPrintModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="print-modal-title"
        >
          <div className="bg-white text-black rounded-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 print:p-8">
              {/* Header */}
              <div className="text-center mb-8 border-b-2 border-black pb-4">
                <h1 id="print-modal-title" className="text-2xl font-bold mb-2">NOTĂ DE INTRARE-RECEPȚIE</h1>
                <p className="text-lg">Nr. {printNir.number}</p>
                <p className="text-sm text-gray-600">Data: {new Date(printNir.date).toLocaleDateString("ro-RO")}</p>
              </div>

              {/* Supplier Info */}
              <div className="mb-6">
                <p className="font-bold mb-1">Furnizor:</p>
                <p className="ml-4">{printNir.supplier.name}</p>
              </div>

              {/* Items Table */}
              <table className="w-full mb-8 border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-black p-1 text-center">Nr.</th>
                    <th className="border border-black p-1 text-left">Denumire</th>
                    <th className="border border-black p-1 text-center">UM</th>
                    <th className="border border-black p-1 text-right">Cant.</th>
                    <th className="border border-black p-1 text-right">Preț U.</th>
                    <th className="border border-black p-1 text-right">Valoare</th>
                    <th className="border border-black p-1 text-right">TVA %</th>
                    <th className="border border-black p-1 text-right">TVA Tot</th>
                    <th className="border border-black p-1 text-right">Adaos %</th>
                    <th className="border border-black p-1 text-right">Adaos V.</th>
                    <th className="border border-black p-1 text-right">TVA Ad.</th>
                    <th className="border border-black p-1 text-right">Preț V.</th>
                    <th className="border border-black p-1 text-right">Val. V.</th>
                  </tr>
                </thead>
                <tbody>
                  {printNir.items.map((item, idx) => {
                    // Base calculations
                    const valoare = item.quantity * item.price;
                    const tvaTot = valoare * (item.vatRate / 100);
                    const adaosValoare = valoare * (item.markup / 100);
                    const tvaAdaos = adaosValoare * (item.vatRate / 100);
                    const pretVanzare = item.price * (1 + item.markup / 100);
                    const valoareVanzare = item.quantity * pretVanzare;
                    
                    return (
                      <tr key={item.id}>
                        <td className="border border-black p-1 text-center">{idx + 1}</td>
                        <td className="border border-black p-1">{item.product.name}</td>
                        <td className="border border-black p-1 text-center">{item.product.unit}</td>
                        <td className="border border-black p-1 text-right">{item.quantity}</td>
                        <td className="border border-black p-1 text-right">{item.price.toFixed(2)}</td>
                        <td className="border border-black p-1 text-right">{valoare.toFixed(2)}</td>
                        <td className="border border-black p-1 text-right">{item.vatRate}%</td>
                        <td className="border border-black p-1 text-right">{tvaTot.toFixed(2)}</td>
                        <td className="border border-black p-1 text-right">{item.markup}%</td>
                        <td className="border border-black p-1 text-right">{adaosValoare.toFixed(2)}</td>
                        <td className="border border-black p-1 text-right">{tvaAdaos.toFixed(2)}</td>
                        <td className="border border-black p-1 text-right">{pretVanzare.toFixed(2)}</td>
                        <td className="border border-black p-1 text-right font-medium">{valoareVanzare.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="font-bold bg-gray-100">
                    <td className="border border-black p-1 text-right" colSpan="12">TOTAL GENERAL:</td>
                    <td className="border border-black p-1 text-right">
                      {printNir.items.reduce((sum, item) => {
                        const pretVanzare = item.price * (1 + item.markup / 100);
                        return sum + (item.quantity * pretVanzare);
                      }, 0).toFixed(2)} Lei
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 mt-12">
                <div>
                  <p className="font-bold mb-8">Întocmit:</p>
                  <div className="border-t border-black pt-2">
                    <p className="text-sm text-gray-600">Semnătură și ștampilă</p>
                  </div>
                </div>
                <div>
                  <p className="font-bold mb-8">Primit:</p>
                  <div className="border-t border-black pt-2">
                    <p className="text-sm text-gray-600">Semnătură și ștampilă</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8 print:hidden">
                <button 
                  onClick={printDocument}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium"
                >
                  🖨️ Printează
                </button>
                <button 
                  onClick={() => setShowPrintModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium"
                >
                  Închide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Transfers Tab ---------- */
function TransfersTab() {
  const [transfers, setTransfers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ fromDepartmentId: "", toDepartmentId: "", items: [{ productId: "", quantity: "" }] });

  const load = () => fetch("/api/transfers").then((r) => r.json()).then(setTransfers);
  useEffect(() => {
    load();
    fetch("/api/departments").then((r) => r.json()).then(setDepartments);
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: "", quantity: "" }] });
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, items });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fromDepartmentId || !form.toDepartmentId || form.fromDepartmentId === form.toDepartmentId) return;
    if (form.items.some((i) => !i.productId || !i.quantity)) return;
    await fetch("/api/transfers", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromDepartmentId: Number(form.fromDepartmentId),
        toDepartmentId: Number(form.toDepartmentId),
        items: form.items.map((i) => ({ productId: Number(i.productId), quantity: Number(i.quantity) })),
      }),
    });
    setForm({ fromDepartmentId: "", toDepartmentId: "", items: [{ productId: "", quantity: "" }] });
    load();
  };

  return (
    <div>
      <form onSubmit={submit} className="mb-6 bg-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-bold mb-3">Transfer nou</h3>
        <div className="flex gap-2 mb-3 flex-wrap">
          <select value={form.fromDepartmentId} onChange={(e) => setForm({ ...form, fromDepartmentId: e.target.value })} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm">
            <option value="">Din departament</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <span className="text-gray-400 self-center">→</span>
          <select value={form.toDepartmentId} onChange={(e) => setForm({ ...form, toDepartmentId: e.target.value })} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm">
            <option value="">În departament</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="space-y-2 mb-3">
          {form.items.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-end">
              <select value={item.productId} onChange={(e) => updateItem(idx, "productId", e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm flex-1">
                <option value="">Produs</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="number" step="0.01" placeholder="Cant." value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm w-24" />
              {form.items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300 px-2 py-2 text-sm">✕</button>}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={addItem} className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm">+ Produs</button>
          <button type="submit" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-medium">Salvează transfer</button>
        </div>
      </form>

      <div className="space-y-4">
        {transfers.map((t) => (
          <div key={t.id} className="bg-gray-800 rounded-xl p-4">
            <div className="mb-2">
              <span className="font-bold text-amber-400">{t.fromDepartment.name}</span>
              <span className="text-gray-400 mx-2">→</span>
              <span className="font-bold text-green-400">{t.toDepartment.name}</span>
              <span className="text-gray-500 text-xs ml-3">{new Date(t.date).toLocaleString("ro-RO")}</span>
            </div>
            <div className="space-y-1">
              {t.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-gray-300">
                  <span>{item.product.name}</span>
                  <span>{item.quantity} {item.product.unit}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {transfers.length === 0 && <p className="text-gray-500">Nu există transferuri.</p>}
      </div>
    </div>
  );
}

/* ---------- Returs Tab ---------- */
function RetursTab() {
  const [returs, setReturs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ supplierId: "", items: [{ productId: "", quantity: "" }] });

  const load = () => fetch("/api/returs").then((r) => r.json()).then(setReturs);
  useEffect(() => {
    load();
    fetch("/api/suppliers").then((r) => r.json()).then(setSuppliers);
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: "", quantity: "" }] });
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, items });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.supplierId || form.items.some((i) => !i.productId || !i.quantity)) return;
    await fetch("/api/returs", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplierId: Number(form.supplierId),
        items: form.items.map((i) => ({ productId: Number(i.productId), quantity: Number(i.quantity) })),
      }),
    });
    setForm({ supplierId: "", items: [{ productId: "", quantity: "" }] });
    load();
  };

  return (
    <div>
      <form onSubmit={submit} className="mb-6 bg-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-bold mb-3">Retur nou</h3>
        <div className="flex gap-2 mb-3">
          <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm">
            <option value="">Furnizor</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="space-y-2 mb-3">
          {form.items.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-end">
              <select value={item.productId} onChange={(e) => updateItem(idx, "productId", e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm flex-1">
                <option value="">Produs</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="number" step="0.01" placeholder="Cant." value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm w-24" />
              {form.items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300 px-2 py-2 text-sm">✕</button>}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={addItem} className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm">+ Produs</button>
          <button type="submit" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-medium">Salvează retur</button>
        </div>
      </form>

      <div className="space-y-4">
        {returs.map((r) => (
          <div key={r.id} className="bg-gray-800 rounded-xl p-4">
            <div className="mb-2">
              <span className="font-bold text-red-400">Retur → {r.supplier.name}</span>
              <span className="text-gray-500 text-xs ml-3">{new Date(r.date).toLocaleString("ro-RO")}</span>
            </div>
            <div className="space-y-1">
              {r.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-gray-300">
                  <span>{item.product.name}</span>
                  <span>{item.quantity} {item.product.unit}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {returs.length === 0 && <p className="text-gray-500">Nu există retururi.</p>}
      </div>
    </div>
  );
}

/* ---------- Inventory Tab ---------- */
function InventoryTab() {
  const [inventories, setInventories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: "", departmentId: "" });
  const [editingInventory, setEditingInventory] = useState(null);

  const load = () => fetch("/api/inventories").then((r) => r.json()).then(setInventories);
  useEffect(() => {
    load();
    fetch("/api/departments").then((r) => r.json()).then(setDepartments);
  }, []);

  const createInventory = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    await fetch("/api/inventories", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, departmentId: form.departmentId ? Number(form.departmentId) : undefined }),
    });
    setForm({ name: "", departmentId: "" });
    load();
  };

  const saveActualQty = async (inventory) => {
    await fetch(`/api/inventories/${inventory.id}/items`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: inventory.items.map((i) => ({ id: i.id, actualQty: i.actualQty })) }),
    });
    setEditingInventory(null);
    load();
  };

  return (
    <div>
      <form onSubmit={createInventory} className="flex gap-2 mb-6 flex-wrap items-end">
        <input placeholder="Denumire inventar" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm" />
        <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm">
          <option value="">Toate departamentele</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button type="submit" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-medium">Creează inventar</button>
      </form>

      <div className="space-y-4">
        {inventories.map((inv) => (
          <div key={inv.id} className="bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <span className="font-bold text-amber-400">{inv.name}</span>
                <span className="text-gray-500 text-xs ml-3">{new Date(inv.date).toLocaleString("ro-RO")}</span>
              </div>
              {editingInventory !== inv.id ? (
                <button onClick={() => setEditingInventory(inv.id)} className="bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded-lg text-xs">Editează</button>
              ) : (
                <button onClick={() => saveActualQty(inv)} className="bg-green-700 hover:bg-green-600 px-3 py-1 rounded-lg text-xs">Salvează</button>
              )}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-left py-1">Produs</th>
                  <th className="text-right py-1">Stoc sistem</th>
                  <th className="text-right py-1">Stoc real</th>
                  <th className="text-right py-1">Diferență</th>
                </tr>
              </thead>
              <tbody>
                {inv.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-700/50">
                    <td className="py-1">{item.product.name}</td>
                    <td className="text-right">{item.systemQty}</td>
                    <td className="text-right">
                      {editingInventory === inv.id ? (
                        <input
                          type="number" step="0.01" value={item.actualQty}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setInventories((prev) => prev.map((i) => i.id === inv.id ? {
                              ...i, items: i.items.map((it) => it.id === item.id ? { ...it, actualQty: val, difference: val - it.systemQty } : it)
                            } : i));
                          }}
                          className="bg-gray-700 border border-gray-600 rounded px-2 py-0.5 text-sm w-20 text-right"
                        />
                      ) : item.actualQty}
                    </td>
                    <td className={`text-right font-medium ${item.difference < 0 ? "text-red-400" : item.difference > 0 ? "text-green-400" : "text-gray-400"}`}>
                      {item.difference > 0 ? "+" : ""}{item.difference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        {inventories.length === 0 && <p className="text-gray-500">Nu există inventare.</p>}
      </div>
    </div>
  );
}

/* ---------- Stock Tab ---------- */
function StockTab() {
  const [rowData, setRowData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filterDept, setFilterDept] = useState("");

  const load = (deptId) => {
    const url = deptId ? `/api/stock?departmentId=${deptId}` : "/api/stock";
    fetch(url).then((r) => r.json()).then(setRowData);
  };

  useEffect(() => {
    load(filterDept);
    fetch("/api/departments").then((r) => r.json()).then(setDepartments);
  }, []);

  const columnDefs = useMemo(() => [
    { field: "product.name", headerName: "Produs", flex: 1 },
    { field: "department.name", headerName: "Departament", width: 150 },
    { field: "quantity", headerName: "Cantitate", width: 120 },
    { field: "product.unit", headerName: "UM", width: 80 },
  ], []);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <select
          value={filterDept}
          onChange={(e) => { setFilterDept(e.target.value); load(e.target.value); }}
          className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Toate departamentele</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      <div style={{ height: "calc(100vh - 220px)" }}>
        <AgGridReact theme={agDarkTheme} rowData={rowData} columnDefs={columnDefs} defaultColDef={{ sortable: true, filter: true, resizable: true }} />
      </div>
    </div>
  );
}

/* ---------- Categories Tab ---------- */
function CategoriesTab() {
  const [rowData, setRowData] = useState([]);
  const [name, setName] = useState("");

  const load = () => fetch("/api/categories").then((r) => r.json()).then(setRowData);
  useEffect(() => { load(); }, []);

  const columnDefs = useMemo(() => [
    { field: "id", width: 70 },
    { field: "name", headerName: "Denumire", flex: 1, editable: true },
    {
      headerName: "", width: 80,
      cellRenderer: (params) => (
        <button className="text-red-400 hover:text-red-300 text-xs" onClick={async () => { await fetch(`/api/categories/${params.data.id}`, { method: "DELETE" }); load(); }}>Șterge</button>
      ),
    },
  ], []);

  const onCellValueChanged = useCallback(async (event) => {
    await fetch(`/api/categories/${event.data.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: event.newValue }),
    });
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!name) return;
    await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    setName("");
    load();
  };

  return (
    <div>
      <form onSubmit={add} className="flex gap-2 mb-4">
        <input placeholder="Denumire categorie" value={name} onChange={(e) => setName(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm" />
        <button type="submit" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-medium">Adaugă</button>
      </form>
      <div style={{ height: "calc(100vh - 220px)" }}>
        <AgGridReact theme={agDarkTheme} rowData={rowData} columnDefs={columnDefs} onCellValueChanged={onCellValueChanged} defaultColDef={{ sortable: true, filter: true, resizable: true }} />
      </div>
    </div>
  );
}

/* ---------- Departments Tab ---------- */
function DepartmentsTab() {
  const [rowData, setRowData] = useState([]);
  const [name, setName] = useState("");

  const load = () => fetch("/api/departments").then((r) => r.json()).then(setRowData);
  useEffect(() => { load(); }, []);

  const columnDefs = useMemo(() => [
    { field: "id", width: 70 },
    { field: "name", headerName: "Denumire", flex: 1, editable: true },
    {
      headerName: "", width: 80,
      cellRenderer: (params) => (
        <button className="text-red-400 hover:text-red-300 text-xs" onClick={async () => { await fetch(`/api/departments/${params.data.id}`, { method: "DELETE" }); load(); }}>Șterge</button>
      ),
    },
  ], []);

  const onCellValueChanged = useCallback(async (event) => {
    await fetch(`/api/departments/${event.data.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: event.newValue }),
    });
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!name) return;
    await fetch("/api/departments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    setName("");
    load();
  };

  return (
    <div>
      <form onSubmit={add} className="flex gap-2 mb-4">
        <input placeholder="Denumire departament" value={name} onChange={(e) => setName(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm" />
        <button type="submit" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-medium">Adaugă</button>
      </form>
      <div style={{ height: "calc(100vh - 220px)" }}>
        <AgGridReact theme={agDarkTheme} rowData={rowData} columnDefs={columnDefs} onCellValueChanged={onCellValueChanged} defaultColDef={{ sortable: true, filter: true, resizable: true }} />
      </div>
    </div>
  );
}

/* ---------- Orders Tab ---------- */
function OrdersTab() {
  const [rowData, setRowData] = useState([]);

  const load = () => fetch("/api/orders").then((r) => r.json()).then(setRowData);
  useEffect(() => { load(); }, []);

  const columnDefs = useMemo(() => [
    { field: "id", width: 70 },
    { field: "tableNr", headerName: "Masa", width: 80 },
    { field: "user.name", headerName: "Ospătar", width: 140 },
    { field: "status", headerName: "Status", width: 100 },
    { field: "total", headerName: "Total", width: 100, valueFormatter: (p) => `${p.value} Lei` },
    { field: "payMethod", headerName: "Plată", width: 100 },
    { field: "createdAt", headerName: "Creat", flex: 1, valueFormatter: (p) => p.value ? new Date(p.value).toLocaleString("ro-RO") : "" },
    { field: "closedAt", headerName: "Închis", flex: 1, valueFormatter: (p) => p.value ? new Date(p.value).toLocaleString("ro-RO") : "" },
  ], []);

  return (
    <div style={{ height: "calc(100vh - 180px)" }}>
      <AgGridReact theme={agDarkTheme} rowData={rowData} columnDefs={columnDefs} defaultColDef={{ sortable: true, filter: true, resizable: true }} />
    </div>
  );
}

/* ---------- Reports Tab ---------- */
function ReportsTab() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetch("/api/reports/sales").then((r) => r.json()).then(setReport);
  }, []);

  if (!report) return <p className="text-gray-400">Se încarcă...</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-gray-400 text-sm">Total Vânzări</div>
          <div className="text-3xl font-bold text-green-400 mt-1">{report.totalSales} Lei</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-gray-400 text-sm">Nr. Comenzi</div>
          <div className="text-3xl font-bold text-blue-400 mt-1">{report.orderCount}</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-gray-400 text-sm">Per Metodă Plată</div>
          <div className="mt-2 space-y-1">
            {Object.entries(report.byPayMethod).map(([method, total]) => (
              <div key={method} className="flex justify-between text-sm">
                <span className="text-gray-300">{method}</span>
                <span className="font-medium">{total} Lei</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Users Tab ---------- */
function UsersTab() {
  const [rowData, setRowData] = useState([]);

  const load = () => fetch("/api/users").then((r) => r.json()).then(setRowData);
  useEffect(() => { load(); }, []);

  const columnDefs = useMemo(() => [
    { field: "id", width: 70 },
    { field: "name", headerName: "Nume", flex: 1, editable: true },
    { field: "role", headerName: "Rol", width: 120 },
  ], []);

  const onCellValueChanged = useCallback(async (event) => {
    await fetch(`/api/users/${event.data.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: event.newValue }),
    });
  }, []);

  return (
    <div style={{ height: "calc(100vh - 180px)" }}>
      <AgGridReact theme={agDarkTheme} rowData={rowData} columnDefs={columnDefs} onCellValueChanged={onCellValueChanged} defaultColDef={{ sortable: true, filter: true, resizable: true }} />
    </div>
  );
}
