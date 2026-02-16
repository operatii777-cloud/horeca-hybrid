import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App.jsx";
import LoginPage from "./pages/LoginPage.jsx";

describe("LoginPage", () => {
  it("renders the PIN input screen", () => {
    render(<LoginPage onLogin={vi.fn()} />);
    expect(screen.getByText("HoReCa Hybrid")).toBeInTheDocument();
    expect(screen.getByText("Introduceți PIN-ul")).toBeInTheDocument();
  });

  it("renders all digit buttons (0-9)", () => {
    render(<LoginPage onLogin={vi.fn()} />);
    for (let i = 0; i <= 9; i++) {
      expect(screen.getByRole("button", { name: String(i) })).toBeInTheDocument();
    }
  });

  it("renders clear and submit buttons", () => {
    render(<LoginPage onLogin={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Șterge" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
  });

  it("fills PIN dots when digits are clicked", () => {
    render(<LoginPage onLogin={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    // After clicking 2 digits, 2 dots should be filled (shown as ●)
    const dots = screen.getAllByText("●");
    expect(dots).toHaveLength(2);
  });

  it("clears PIN when clear button is clicked", () => {
    render(<LoginPage onLogin={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getAllByText("●")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Șterge" }));
    expect(screen.queryAllByText("●")).toHaveLength(0);
  });

  it("does not accept more than 4 digits", () => {
    render(<LoginPage onLogin={vi.fn()} />);
    for (let i = 0; i < 6; i++) {
      fireEvent.click(screen.getByRole("button", { name: "1" }));
    }
    expect(screen.getAllByText("●")).toHaveLength(4);
  });

  it("shows error when submitting less than 4 digits", () => {
    render(<LoginPage onLogin={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(screen.getByText("Introduceți 4 cifre")).toBeInTheDocument();
  });

  it("calls API and onLogin with valid admin PIN", async () => {
    const onLogin = vi.fn();
    const mockUser = { id: 1, name: "Admin", role: "admin" };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    render(<LoginPage onLogin={onLogin} />);
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith(mockUser);
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: "0000" }),
    });
  });

  it("shows error for invalid PIN", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Invalid PIN" }),
    });

    render(<LoginPage onLogin={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));

    await waitFor(() => {
      expect(screen.getByText("PIN invalid")).toBeInTheDocument();
    });
  });
});

describe("App", () => {
  it("renders login page by default", () => {
    render(<App />);
    expect(screen.getByText("HoReCa Hybrid")).toBeInTheDocument();
    expect(screen.getByText("Introduceți PIN-ul")).toBeInTheDocument();
  });
});
