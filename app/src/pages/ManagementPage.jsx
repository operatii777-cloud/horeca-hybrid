import { useState, useEffect, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, themeQuartz, colorSchemeDark } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const agDarkTheme = themeQuartz.withPart(colorSchemeDark);

const tabs = [
  { id: "products", label: "Produse" },
  { id: "rawMaterials", label: "Materii Prime" },
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
        {activeTab === "rawMaterials" && <RawMaterialsTab />}
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

/* ---------- Raw Materials Tab ---------- */
function RawMaterialsTab() {
  const [rowData, setRowData] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    code: "",
    name: "",
    unit: "buc",
    price: "",
    groupCategory: "",
    supplierId: "",
    stockMin: "",
    vatRate: "19",
    processStock: true,
  });

  const load = () => fetch("/api/raw-materials").then((r) => r.json()).then(setRowData);

  useEffect(() => {
    load();
    fetch("/api/suppliers").then((r) => r.json()).then(setSuppliers);
  }, []);

  const unitOptions = ["buc", "kg", "Litru", "st", "L", "ml", "g"];
  const groupOptions = [
    "Bar",
    "Bucătărie",
    "Alcoolice",
    "Materiale auxiliare",
    "Gestiune papetarie",
    "Stoc mort",
    "Gestiune control",
    "Gestiune comune",
    "DEP 0",
  ];

  const columnDefs = useMemo(() => [
    { field: "id", width: 70 },
    { field: "code", headerName: "Cod", width: 100, editable: true },
    { field: "name", headerName: "Denumire", flex: 1, editable: true, sortable: true, filter: true },
    {
      field: "unit",
      headerName: "U.M.",
      width: 80,
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: unitOptions },
    },
    {
      field: "price",
      headerName: "Preț",
      width: 100,
      editable: true,
      valueFormatter: (params) => params.value ? params.value.toFixed(2) : "0.00",
    },
    {
      field: "groupCategory",
      headerName: "Grupă",
      width: 150,
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: groupOptions },
    },
    {
      field: "supplier.name",
      headerName: "Furnizor",
      width: 150,
      valueGetter: (params) => params.data.supplier?.name || "",
    },
    {
      field: "stockMin",
      headerName: "Stoc minim",
      width: 100,
      editable: true,
    },
    {
      headerName: "Acțiuni",
      width: 100,
      cellRenderer: (params) => (
        <button
          className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded"
          onClick={async () => {
            if (confirm(`Ștergeți materia primă "${params.data.name}"?`)) {
              await fetch(`/api/raw-materials/${params.data.id}`, { method: "DELETE" });
              load();
            }
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
    let value = event.newValue;
    
    // Convert numeric fields - preserve zero values
    if (field === "price" || field === "stockMin" || field === "vatRate") {
      value = (value !== "" && value !== null && value !== undefined) ? Number(value) : null;
    }
    
    await fetch(`/api/raw-materials/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    load();
  }, []);

  const addRawMaterial = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.unit) {
      alert("Denumire, preț și U.M. sunt obligatorii!");
      return;
    }
    
    await fetch("/api/raw-materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code || undefined,
        name: form.name,
        unit: form.unit,
        price: Number(form.price),
        groupCategory: form.groupCategory || undefined,
        supplierId: form.supplierId ? Number(form.supplierId) : undefined,
        stockMin: form.stockMin ? Number(form.stockMin) : undefined,
        vatRate: Number(form.vatRate),
        processStock: form.processStock ? 1 : 0,
      }),
    });
    
    setForm({
      code: "",
      name: "",
      unit: "buc",
      price: "",
      groupCategory: "",
      supplierId: "",
      stockMin: "",
      vatRate: "19",
      processStock: true,
    });
    load();
  };

  return (
    <div>
      <form onSubmit={addRawMaterial} className="mb-4 bg-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-bold mb-3 text-amber-400">Adaugă materie primă nouă</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <input
            placeholder="Cod (opțional)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
          />
          <input
            placeholder="Denumire *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
            required
          />
          <select
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            {unitOptions.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <input
            placeholder="Preț *"
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
            required
          />
          <select
            value={form.groupCategory}
            onChange={(e) => setForm({ ...form, groupCategory: e.target.value })}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Grupă (opțional)</option>
            {groupOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <select
            value={form.supplierId}
            onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Furnizor (opțional)</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Stoc minim"
            type="number"
            step="0.01"
            value={form.stockMin}
            onChange={(e) => setForm({ ...form, stockMin: e.target.value })}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
          />
          <input
            placeholder="Cotă TVA (%)"
            type="number"
            step="0.01"
            value={form.vatRate}
            onChange={(e) => setForm({ ...form, vatRate: e.target.value })}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-3 items-center">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={form.processStock}
              onChange={(e) => setForm({ ...form, processStock: e.target.checked })}
              className="rounded"
            />
            Procesare stoc
          </label>
          <button
            type="submit"
            className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Adaugă
          </button>
        </div>
      </form>
      
      <div style={{ height: "calc(100vh - 400px)" }} className="ag-theme-quartz-dark">
        <AgGridReact
          theme={agDarkTheme}
          rowData={rowData}
          columnDefs={columnDefs}
          onCellValueChanged={onCellValueChanged}
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
        />
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
  const [rawMaterials, setRawMaterials] = useState([]);
  const [form, setForm] = useState({ supplierId: "", number: "", items: [{ productId: "", quantity: "", price: "" }] });

  const load = () => fetch("/api/nir").then((r) => r.json()).then(setNirs);
  useEffect(() => {
    load();
    fetch("/api/suppliers").then((r) => r.json()).then(setSuppliers);
    fetch("/api/raw-materials").then((r) => r.json()).then(setRawMaterials);
  }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: "", quantity: "", price: "" }] });
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, items });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.supplierId || !form.number || form.items.some((i) => !i.productId || !i.quantity || !i.price)) return;
    await fetch("/api/nir", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplierId: Number(form.supplierId),
        number: form.number,
        items: form.items.map((i) => ({ productId: Number(i.productId), quantity: Number(i.quantity), price: Number(i.price) })),
      }),
    });
    setForm({ supplierId: "", number: "", items: [{ productId: "", quantity: "", price: "" }] });
    load();
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
        <div className="space-y-2 mb-3">
          {form.items.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-end">
              <select value={item.productId} onChange={(e) => updateItem(idx, "productId", e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm flex-1">
                <option value="">Materie primă</option>
                {rawMaterials.map((rm) => <option key={rm.id} value={rm.id}>{rm.name} ({rm.unit})</option>)}
              </select>
              <input type="number" step="0.01" placeholder="Cant." value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm w-24" />
              <input type="number" step="0.01" placeholder="Preț" value={item.price} onChange={(e) => updateItem(idx, "price", e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm w-24" />
              {form.items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300 px-2 py-2 text-sm">✕</button>}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={addItem} className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm">+ Materie primă</button>
          <button type="submit" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-medium">Salvează NIR</button>
        </div>
      </form>

      <div className="space-y-4">
        {nirs.map((nir) => (
          <div key={nir.id} className="bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="font-bold text-amber-400">NIR #{nir.number}</span>
                <span className="text-gray-400 text-sm ml-3">{nir.supplier.name}</span>
                <span className="text-gray-500 text-xs ml-3">{new Date(nir.date).toLocaleString("ro-RO")}</span>
              </div>
            </div>
            <div className="space-y-1">
              {nir.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-gray-300">
                  <span>{item.product.name}</span>
                  <span>{item.quantity} × {item.price} Lei</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {nirs.length === 0 && <p className="text-gray-500">Nu există NIR-uri.</p>}
      </div>
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
