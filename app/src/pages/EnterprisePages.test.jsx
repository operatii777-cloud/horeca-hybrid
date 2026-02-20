import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import GuestIdentityPage from "./GuestIdentityPage.jsx";
import PaymentOrchestrationPage from "./PaymentOrchestrationPage.jsx";
import SupplyChainPage from "./SupplyChainPage.jsx";
import LaborOptimizationPage from "./LaborOptimizationPage.jsx";
import WarRoomPage from "./WarRoomPage.jsx";
import InfraHealthPage from "./InfraHealthPage.jsx";
import ExperienceEnginePage from "./ExperienceEnginePage.jsx";
import DarkKitchenPage from "./DarkKitchenPage.jsx";
import RevenueSciencePage from "./RevenueSciencePage.jsx";
import FranchisePage from "./FranchisePage.jsx";
import ApiEconomyPage from "./ApiEconomyPage.jsx";
import DataNetworkPage from "./DataNetworkPage.jsx";
import RiskEnginePage from "./RiskEnginePage.jsx";
import FinancialControlPage from "./FinancialControlPage.jsx";
import SuperAppPage from "./SuperAppPage.jsx";

// ─── Mock fetch helpers ──────────────────────────────────────────────────────

const mockGuests = [
  { id: 1, name: "Ion Popescu", email: "ion@email.ro", phone: "0721000001", country: "RO", loyaltyPoints: 1240, totalVisits: 23, lifetimeValue: 4870, gdprConsent: true, riskScore: "low", brands: ["HoReCa Central"] },
];

function setupFetch(responses = {}) {
  global.fetch = vi.fn((url) => {
    const key = Object.keys(responses).find((k) => url.includes(k));
    const data = key ? responses[key] : [];
    return Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
  });
}

afterEach(() => { vi.restoreAllMocks(); });

// ─── 1. GuestIdentityPage ────────────────────────────────────────────────────
describe("GuestIdentityPage", () => {
  beforeEach(() => { setupFetch({ "/api/guests": mockGuests }); });

  it("renders heading", async () => {
    render(<GuestIdentityPage />);
    expect(screen.getByText(/Hospitality Digital Identity/)).toBeInTheDocument();
  });

  it("shows guest in table after load", async () => {
    render(<GuestIdentityPage />);
    await waitFor(() => {
      expect(screen.getByText("Ion Popescu")).toBeInTheDocument();
    });
  });

  it("shows stat cards", async () => {
    render(<GuestIdentityPage />);
    await waitFor(() => {
      expect(screen.getByText("Total Guests")).toBeInTheDocument();
      expect(screen.getByText("Active Loyalty")).toBeInTheDocument();
      expect(screen.getByText("GDPR Consented")).toBeInTheDocument();
      expect(screen.getByText("High Risk")).toBeInTheDocument();
    });
  });
});

// ─── 2. PaymentOrchestrationPage ─────────────────────────────────────────────
describe("PaymentOrchestrationPage", () => {
  beforeEach(() => {
    setupFetch({
      "/api/payment-orchestration/stats": { totalTransactions: 100, successRate: 97, fraudDetected: 2, avgFeeSaved: 0.4, pspStats: [], routingRules: [] },
      "/api/payment-orchestration/transactions": [],
    });
  });

  it("renders heading", async () => {
    render(<PaymentOrchestrationPage />);
    await waitFor(() => {
      expect(screen.getByText(/Global Payment Orchestration/)).toBeInTheDocument();
    });
  });

  it("shows stat cards", async () => {
    render(<PaymentOrchestrationPage />);
    await waitFor(() => {
      expect(screen.getByText("Total Tranzacții")).toBeInTheDocument();
      expect(screen.getByText("Fraud Detected")).toBeInTheDocument();
    });
  });
});

// ─── 3. SupplyChainPage ──────────────────────────────────────────────────────
describe("SupplyChainPage", () => {
  beforeEach(() => {
    setupFetch({
      "/api/supply-chain": { criticalAlerts: 3, estimatedSavings: 1240, activeSuppliers: 14, transferSuggestions: [], suppliers: [], priceVolatility: [] },
    });
  });

  it("renders heading", async () => {
    render(<SupplyChainPage />);
    await waitFor(() => {
      expect(screen.getByText(/Real-Time Supply Chain Network/)).toBeInTheDocument();
    });
  });

  it("shows stat cards", async () => {
    render(<SupplyChainPage />);
    await waitFor(() => {
      expect(screen.getByText("Alerte Stoc Critic")).toBeInTheDocument();
      expect(screen.getByText("Transfer Suggestions")).toBeInTheDocument();
    });
  });
});

// ─── 4. LaborOptimizationPage ────────────────────────────────────────────────
describe("LaborOptimizationPage", () => {
  beforeEach(() => {
    setupFetch({
      "/api/labor-optimization": { laborCostPct: 28, overtimeRisk: 2, burnoutAlerts: 1, staffOnDuty: 8, trafficForecast: [], suggestedShifts: [], staffBenchmark: [] },
    });
  });

  it("renders heading", async () => {
    render(<LaborOptimizationPage />);
    await waitFor(() => {
      expect(screen.getByText(/Labor Optimization AI/)).toBeInTheDocument();
    });
  });

  it("shows stat cards", async () => {
    render(<LaborOptimizationPage />);
    await waitFor(() => {
      expect(screen.getByText("Cost Labor %")).toBeInTheDocument();
      expect(screen.getByText("Staff on Duty")).toBeInTheDocument();
    });
  });
});

// ─── 5. WarRoomPage ──────────────────────────────────────────────────────────
describe("WarRoomPage", () => {
  beforeEach(() => {
    setupFetch({
      "/api/war-room/alerts": [],
      "/api/war-room": { liveOrders: 5, avgPrepTime: 11, revenueToday: 1200, slaRate: 94, refundSpike: false, locationCount: 3, locations: [], revenueTrend: [] },
    });
  });

  it("renders heading", async () => {
    render(<WarRoomPage />);
    await waitFor(() => {
      expect(screen.getByText(/HQ War Room/)).toBeInTheDocument();
    });
  });

  it("shows LIVE badge", async () => {
    render(<WarRoomPage />);
    await waitFor(() => {
      expect(screen.getByText("LIVE")).toBeInTheDocument();
    });
  });
});

// ─── 6. InfraHealthPage ──────────────────────────────────────────────────────
describe("InfraHealthPage", () => {
  beforeEach(() => {
    setupFetch({
      "/api/infra-health": { healthyCount: 7, totalServices: 8, autoRestarts: 2, openCircuitBreakers: 1, uptime: 99.97, services: [], circuitBreakers: [], scaling: [], databases: [] },
    });
  });

  it("renders heading", async () => {
    render(<InfraHealthPage />);
    await waitFor(() => {
      expect(screen.getByText(/Self-Healing Infrastructure/)).toBeInTheDocument();
    });
  });

  it("shows uptime card", async () => {
    render(<InfraHealthPage />);
    await waitFor(() => {
      expect(screen.getByText("Uptime")).toBeInTheDocument();
    });
  });
});

// ─── 7. ExperienceEnginePage ─────────────────────────────────────────────────
describe("ExperienceEnginePage", () => {
  beforeEach(() => {
    setupFetch({
      "/api/experience-engine": { musicMood: "relaxed", musicVolume: 65, currentTrack: "Test Track", lightScene: "dim", lightIntensity: 55, colorTemp: 3200, temperature: 22, acousticMode: "normal", signageScreens: [] },
    });
  });

  it("renders heading", async () => {
    render(<ExperienceEnginePage />);
    await waitFor(() => {
      expect(screen.getByText(/Experience Engine/)).toBeInTheDocument();
    });
  });

  it("shows music section", async () => {
    render(<ExperienceEnginePage />);
    await waitFor(() => {
      expect(screen.getByText(/Mood-Based Music/)).toBeInTheDocument();
    });
  });
});

// ─── 8. DarkKitchenPage ──────────────────────────────────────────────────────
describe("DarkKitchenPage", () => {
  beforeEach(() => {
    setupFetch({
      "/api/dark-kitchen": { brandCount: 4, activeMenus: 3, totalRevenue: 28720, platforms: 3, brands: [], ghostMenuItems: [], costAllocation: [] },
    });
  });

  it("renders heading", async () => {
    render(<DarkKitchenPage />);
    await waitFor(() => {
      expect(screen.getByText(/Dark Kitchen/)).toBeInTheDocument();
    });
  });

  it("shows stat cards", async () => {
    render(<DarkKitchenPage />);
    await waitFor(() => {
      expect(screen.getByText("Virtual Brands")).toBeInTheDocument();
      expect(screen.getByText("Delivery Platforms")).toBeInTheDocument();
    });
  });
});

// ─── 9. RevenueSciencePage ───────────────────────────────────────────────────
describe("RevenueSciencePage", () => {
  beforeEach(() => {
    setupFetch({
      "/api/revenue-science": { starCount: 2, dogCount: 2, avgMargin: 55, revenueToday: 16450, menuItems: [], elasticity: [], marginByCategory: [], abTests: [] },
    });
  });

  it("renders heading", async () => {
    render(<RevenueSciencePage />);
    await waitFor(() => {
      expect(screen.getByText(/Revenue Science Layer/)).toBeInTheDocument();
    });
  });

  it("shows menu engineering tab", async () => {
    render(<RevenueSciencePage />);
    await waitFor(() => {
      expect(screen.getAllByText(/Menu Engineering/).length).toBeGreaterThan(0);
    });
  });
});

// ─── 10. FranchisePage ───────────────────────────────────────────────────────
describe("FranchisePage", () => {
  beforeEach(() => {
    setupFetch({
      "/api/franchise": { locationCount: 4, totalRoyalty: 18750, avgCompliance: 88, auditPending: 2, locations: [], complianceDetails: [], royaltyCalc: [], auditItems: [] },
    });
  });

  it("renders heading", async () => {
    render(<FranchisePage />);
    await waitFor(() => {
      expect(screen.getByText(/Franchise Domination System/)).toBeInTheDocument();
    });
  });

  it("shows royalty card", async () => {
    render(<FranchisePage />);
    await waitFor(() => {
      expect(screen.getByText("Royalty Total")).toBeInTheDocument();
    });
  });
});

// ─── 11. ApiEconomyPage ──────────────────────────────────────────────────────
describe("ApiEconomyPage", () => {
  beforeEach(() => {
    setupFetch({
      "/api/api-economy": { activeKeys: 23, callsToday: 184720, apiRevenue: 4280, activePlugins: 7, topEndpoints: [], revenueStreams: [], apiKeys: [], plugins: [], endpoints: [] },
    });
  });

  it("renders heading", async () => {
    render(<ApiEconomyPage />);
    await waitFor(() => {
      expect(screen.getByText(/API Economy Mode/)).toBeInTheDocument();
    });
  });

  it("shows API keys card", async () => {
    render(<ApiEconomyPage />);
    await waitFor(() => {
      expect(screen.getByText("Active API Keys")).toBeInTheDocument();
    });
  });
});

// ─── 12. DataNetworkPage ─────────────────────────────────────────────────────
describe("DataNetworkPage", () => {
  beforeEach(() => {
    setupFetch({
      "/api/data-network": { networkLocations: 247, analyzedTransactions: 1240000, industryAvgMargin: 38, trendsDetected: 12, benchmarks: [], foodTrends: [], ingredientCostTrends: [], peakHours: [], peakByRegion: [] },
    });
  });

  it("renders heading", async () => {
    render(<DataNetworkPage />);
    await waitFor(() => {
      expect(screen.getByText(/Global Data Network Effect/)).toBeInTheDocument();
    });
  });

  it("shows network locations card", async () => {
    render(<DataNetworkPage />);
    await waitFor(() => {
      expect(screen.getByText("Locații în Rețea")).toBeInTheDocument();
    });
  });
});

// ─── 13. RiskEnginePage ──────────────────────────────────────────────────────
describe("RiskEnginePage", () => {
  beforeEach(() => {
    setupFetch({
      "/api/risk-engine": { criticalAlerts: 2, fraudSuspicions: 3, refundAnomalies: 2, avgRiskScore: 42, alerts: [], fraudSuspects: [], refundClusters: [], suspiciousReservations: [] },
    });
  });

  it("renders heading", async () => {
    render(<RiskEnginePage />);
    await waitFor(() => {
      expect(screen.getByText(/Predictive Risk Engine/)).toBeInTheDocument();
    });
  });

  it("shows alerts tab", async () => {
    render(<RiskEnginePage />);
    await waitFor(() => {
      expect(screen.getAllByText(/Alerte/i).length).toBeGreaterThan(0);
    });
  });
});

// ─── 14. FinancialControlPage ────────────────────────────────────────────────
describe("FinancialControlPage", () => {
  beforeEach(() => {
    setupFetch({
      "/api/financial-control": { revenueToday: 5200, ebitdaMargin: 22, cashBalance: 48200, taxLiability: 8640, plStatement: [], cogsBreakdown: [], ebitda: { revenue: 139400, ebit: 40200, ebitda: 44400 }, ebitdaProjection: [], cashFlowStatement: [], cashReconciliation: { register: 48200, physical: 48150 }, taxForecast: [], accruals: [] },
    });
  });

  it("renders heading", async () => {
    render(<FinancialControlPage />);
    await waitFor(() => {
      expect(screen.getByText(/Financial Control Layer/)).toBeInTheDocument();
    });
  });

  it("shows P&L tab", async () => {
    render(<FinancialControlPage />);
    await waitFor(() => {
      expect(screen.getByText(/P&L Live/)).toBeInTheDocument();
    });
  });
});

// ─── 15. SuperAppPage ────────────────────────────────────────────────────────
describe("SuperAppPage", () => {
  beforeEach(() => {
    setupFetch({
      "/api/superapp": {
        restaurants: [{ id: 1, name: "HoReCa Central", icon: "🏠", cuisine: "Internațional", location: "București", rating: 4.7, deliveryTime: 25, minOrder: 45 }],
        offers: [],
      },
    });
  });

  it("renders heading", async () => {
    render(<SuperAppPage />);
    expect(screen.getByText(/Hospitality SuperApp/)).toBeInTheDocument();
  });

  it("shows welcome message", async () => {
    render(<SuperAppPage />);
    await waitFor(() => {
      expect(screen.getByText(/Bun venit/)).toBeInTheDocument();
    });
  });

  it("shows navigation tabs", async () => {
    render(<SuperAppPage />);
    expect(screen.getAllByText(/Home/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Loyalty/i).length).toBeGreaterThan(0);
  });
});
