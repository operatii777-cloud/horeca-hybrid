import { useState, useEffect, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const tabs = [
  { id: "products", label: "Produse" },
  { id: "categories", label: "Categorii" },
  { id: "departments", label: "Departamente" },
  { id: "orders", label: "Comenzi" },
  { id: "reports", label: "Rapoarte" },
  { id: "users", label: "Utilizatori" },
];

export default function ManagementPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
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

      {/* Tabs */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === "products" && <ProductsTab />}
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
        <input
          placeholder="Denumire"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm"
        />
        <input
          placeholder="Preț"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm w-24"
        />
        <input
          placeholder="UM"
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
          className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm w-20"
        />
        <select
          value={form.departmentId}
          onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
          className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Departament</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Categorie</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button type="submit" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-medium">
          Adaugă
        </button>
      </form>
      <div className="ag-theme-alpine-dark" style={{ height: "calc(100vh - 220px)" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          onCellValueChanged={onCellValueChanged}
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
        />
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
      headerName: "",
      width: 80,
      cellRenderer: (params) => (
        <button
          className="text-red-400 hover:text-red-300 text-xs"
          onClick={async () => {
            await fetch(`/api/categories/${params.data.id}`, { method: "DELETE" });
            load();
          }}
        >
          Șterge
        </button>
      ),
    },
  ], []);

  const onCellValueChanged = useCallback(async (event) => {
    await fetch(`/api/categories/${event.data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: event.newValue }),
    });
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!name) return;
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    load();
  };

  return (
    <div>
      <form onSubmit={add} className="flex gap-2 mb-4">
        <input
          placeholder="Denumire categorie"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-medium">
          Adaugă
        </button>
      </form>
      <div className="ag-theme-alpine-dark" style={{ height: "calc(100vh - 220px)" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          onCellValueChanged={onCellValueChanged}
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
        />
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
      headerName: "",
      width: 80,
      cellRenderer: (params) => (
        <button
          className="text-red-400 hover:text-red-300 text-xs"
          onClick={async () => {
            await fetch(`/api/departments/${params.data.id}`, { method: "DELETE" });
            load();
          }}
        >
          Șterge
        </button>
      ),
    },
  ], []);

  const onCellValueChanged = useCallback(async (event) => {
    await fetch(`/api/departments/${event.data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: event.newValue }),
    });
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!name) return;
    await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    load();
  };

  return (
    <div>
      <form onSubmit={add} className="flex gap-2 mb-4">
        <input
          placeholder="Denumire departament"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-medium">
          Adaugă
        </button>
      </form>
      <div className="ag-theme-alpine-dark" style={{ height: "calc(100vh - 220px)" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          onCellValueChanged={onCellValueChanged}
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
        />
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
    {
      field: "createdAt",
      headerName: "Creat",
      flex: 1,
      valueFormatter: (p) => p.value ? new Date(p.value).toLocaleString("ro-RO") : "",
    },
    {
      field: "closedAt",
      headerName: "Închis",
      flex: 1,
      valueFormatter: (p) => p.value ? new Date(p.value).toLocaleString("ro-RO") : "",
    },
  ], []);

  return (
    <div className="ag-theme-alpine-dark" style={{ height: "calc(100vh - 180px)" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={{ sortable: true, filter: true, resizable: true }}
      />
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
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: event.newValue }),
    });
  }, []);

  return (
    <div className="ag-theme-alpine-dark" style={{ height: "calc(100vh - 180px)" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        onCellValueChanged={onCellValueChanged}
        defaultColDef={{ sortable: true, filter: true, resizable: true }}
      />
    </div>
  );
}
