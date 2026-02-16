import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import DashboardPage from "./DashboardPage.jsx";
import SalesPage from "./SalesPage.jsx";
import KDSKitchenPage from "./KDSKitchenPage.jsx";
import KDSBarPage from "./KDSBarPage.jsx";
import TablePlanPage from "./TablePlanPage.jsx";
import ComandaQRPage from "./ComandaQRPage.jsx";
import ComandaSupervisorPage from "./ComandaSupervisorPage.jsx";

const mockProducts = [
  { id: 1, name: "PIZZA MARGHERITA", price: 32, unit: "porție", departmentId: 1, categoryId: 1, department: { id: 1, name: "Bucatarie" }, category: { id: 1, name: "Meniu" }, stockItems: [{ id: 1, quantity: 50 }] },
  { id: 2, name: "COCA COLA", price: 8, unit: "sticlă", departmentId: 2, categoryId: 2, department: { id: 2, name: "Bar" }, category: { id: 2, name: "Băuturi" }, stockItems: [{ id: 2, quantity: 100 }] },
];

const mockOrders = [
  { id: 1, tableNr: 5, status: "open", total: 40, source: "pos", payMethod: null, createdAt: "2024-01-01T10:00:00.000Z", closedAt: null, userId: 1, user: { id: 1, name: "Admin", role: "admin" }, items: [
    { id: 1, productId: 1, quantity: 1, price: 32, ready: false, product: { id: 1, name: "PIZZA MARGHERITA", department: { id: 1, name: "BUCATARIE" } } },
    { id: 2, productId: 2, quantity: 1, price: 8, ready: false, product: { id: 2, name: "COCA COLA", department: { id: 2, name: "BAR" } } },
  ] },
];

const mockUser = { id: 1, name: "Admin", role: "admin" };

// ─── DashboardPage ───────────────────────────────────────────────────────────

describe("DashboardPage", () => {
  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (url === "/api/products") return Promise.resolve({ ok: true, json: () => Promise.resolve(mockProducts) });
      if (url === "/api/orders") return Promise.resolve({ ok: true, json: () => Promise.resolve(mockOrders) });
      if (url === "/api/stock") return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it("renders Dashboard Operațional heading", async () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Dashboard Operațional/)).toBeInTheDocument();
  });

  it("shows stats cards after data loads", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText("Total Produse")).toBeInTheDocument();
      expect(screen.getByText("Comenzi Deschise")).toBeInTheDocument();
      expect(screen.getByText("Închise Azi")).toBeInTheDocument();
      expect(screen.getByText("Venit Azi")).toBeInTheDocument();
    });
  });

  it("displays correct product count from API", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      const label = screen.getByText("Total Produse");
      const card = label.parentElement;
      expect(card).toHaveTextContent("2");
    });
  });
});

// ─── SalesPage ───────────────────────────────────────────────────────────────

describe("SalesPage", () => {
  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (url === "/api/products") return Promise.resolve({ ok: true, json: () => Promise.resolve(mockProducts) });
      if (url === "/api/categories") return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      if (url.includes("/api/orders")) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it("renders product grid with fetched products", async () => {
    render(<SalesPage user={mockUser} onLogout={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText("PIZZA MARGHERITA")).toBeInTheDocument();
      expect(screen.getByText("COCA COLA")).toBeInTheDocument();
    });
  });

  it("renders table number selection buttons 1-10", () => {
    render(<SalesPage user={mockUser} onLogout={vi.fn()} />);
    for (let i = 1; i <= 10; i++) {
      expect(screen.getByRole("button", { name: String(i) })).toBeInTheDocument();
    }
  });

  it("has Trimite comanda button disabled when cart is empty", () => {
    render(<SalesPage user={mockUser} onLogout={vi.fn()} />);
    const btn = screen.getByRole("button", { name: /Trimite comanda/ });
    expect(btn).toBeDisabled();
  });

  it("adds item to cart and shows it in the sidebar", async () => {
    render(<SalesPage user={mockUser} onLogout={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText("PIZZA MARGHERITA")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("PIZZA MARGHERITA"));
    expect(screen.getByText("1 × 32 Lei")).toBeInTheDocument();
  });
});

// ─── KDSKitchenPage ──────────────────────────────────────────────────────────

describe("KDSKitchenPage", () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it("renders KDS Bucătărie heading", () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));
    render(<KDSKitchenPage />);
    expect(screen.getByText(/KDS Bucătărie/)).toBeInTheDocument();
  });

  it("shows empty state when no orders", async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));
    render(<KDSKitchenPage />);
    await waitFor(() => {
      expect(screen.getByText("Nicio comandă pentru bucătărie")).toBeInTheDocument();
    });
  });

  it("shows kitchen order items when orders have BUCATARIE department", async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockOrders) }));
    render(<KDSKitchenPage />);
    await waitFor(() => {
      expect(screen.getByText("PIZZA MARGHERITA")).toBeInTheDocument();
    });
  });
});

// ─── KDSBarPage ──────────────────────────────────────────────────────────────

describe("KDSBarPage", () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it("renders KDS Bar heading", () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));
    render(<KDSBarPage />);
    expect(screen.getByText(/KDS Bar/)).toBeInTheDocument();
  });

  it("shows empty state when no orders", async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));
    render(<KDSBarPage />);
    await waitFor(() => {
      expect(screen.getByText("Nicio comandă pentru bar")).toBeInTheDocument();
    });
  });
});

// ─── TablePlanPage ───────────────────────────────────────────────────────────

describe("TablePlanPage", () => {
  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (url.includes("/api/orders")) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      if (url === "/api/reservations") return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it("renders Plan Mese heading", () => {
    render(<TablePlanPage />);
    expect(screen.getByText(/Plan Mese/)).toBeInTheDocument();
  });

  it("renders 10 table buttons", () => {
    render(<TablePlanPage />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(10);
  });

  it("shows Liberă status for free tables", async () => {
    render(<TablePlanPage />);
    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      const freeButtons = buttons.filter((btn) => btn.textContent.includes("Liberă"));
      expect(freeButtons.length).toBe(10);
    });
  });
});

// ─── ComandaQRPage ───────────────────────────────────────────────────────────

describe("ComandaQRPage", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    delete window.location;
    window.location = new URL("http://localhost/comanda?table=5");
    global.fetch = vi.fn((url) => {
      if (url === "/api/products") return Promise.resolve({ ok: true, json: () => Promise.resolve(mockProducts) });
      if (url === "/api/categories") return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      if (url.includes("/api/orders")) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });
  });
  afterEach(() => {
    window.location = originalLocation;
    vi.restoreAllMocks();
  });

  it("renders menu with products from API", async () => {
    render(<ComandaQRPage />);
    await waitFor(() => {
      expect(screen.getByText("PIZZA MARGHERITA")).toBeInTheDocument();
      expect(screen.getByText("COCA COLA")).toBeInTheDocument();
    });
  });

  it("displays correct table number from URL params", async () => {
    render(<ComandaQRPage />);
    expect(screen.getByText("Masa 5")).toBeInTheDocument();
  });
});

// ─── ComandaSupervisorPage ───────────────────────────────────────────────────

describe("ComandaSupervisorPage", () => {
  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (url === "/api/products") return Promise.resolve({ ok: true, json: () => Promise.resolve(mockProducts) });
      if (url === "/api/categories") return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      if (url.includes("/api/orders")) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it("renders the supervisor page heading", () => {
    render(<ComandaSupervisorPage user={mockUser} />);
    expect(screen.getByText(/Preluare Comandă/)).toBeInTheDocument();
  });

  it("displays table selection buttons", () => {
    render(<ComandaSupervisorPage user={mockUser} />);
    expect(screen.getByText("Selectează Masa:")).toBeInTheDocument();
    for (let i = 1; i <= 10; i++) {
      expect(screen.getByRole("button", { name: String(i) })).toBeInTheDocument();
    }
  });
});
