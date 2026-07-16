/**
 * Component tests for <DashboardHeader />.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DashboardHeader from "@/app/dashboard/components/DashboardHeader";
import { useStore, type Subscription } from "@/app/store/useStore";

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock("@/app/store/useStore");
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
// Logo is an SVG component — we don't need to test it
vi.mock("@/components/ui/logo", () => ({
  default: () => <span data-testid="logo" />,
}));

const sampleSubscriptions: Subscription[] = [
  {
    title: "Test Feed",
    feedUrl: "https://example.com/feed.xml",
    siteUrl: "https://example.com",
    description: "A test feed",
    format: "rss",
    category: "Tech",
  },
];

function buildStore(overrides: Partial<ReturnType<typeof useStore>> = {}): ReturnType<typeof useStore> {
  return {
    user: null,
    search: "",
    theme: "light",
    subscriptions: [],
    activeCategory: "All Feeds",
    selectedFeedUrl: "",
    setSearch: vi.fn(),
    setIsAddOpen: vi.fn(),
    setIsAuthOpen: vi.fn(),
    setTheme: vi.fn(),
    importOpml: vi.fn(),
    logout: vi.fn(),
    loadFeed: vi.fn(),
    setActiveTab: vi.fn(),
    activeTab: "feed",
    ...overrides,
  } as unknown as ReturnType<typeof useStore>;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useStore).mockReturnValue(buildStore());
});

describe("<DashboardHeader />", () => {
  it("renders the search input with correct placeholder", () => {
    render(<DashboardHeader sampleSubscriptions={sampleSubscriptions} />);
    const input = screen.getByPlaceholderText(/search feeds/i);
    expect(input).toBeInTheDocument();
  });

  it("calls setSearch when user types in the search input", () => {
    const mockSetSearch = vi.fn();
    vi.mocked(useStore).mockReturnValue(buildStore({ setSearch: mockSetSearch }));
    render(<DashboardHeader sampleSubscriptions={sampleSubscriptions} />);
    const input = screen.getByPlaceholderText(/search feeds/i);
    fireEvent.change(input, { target: { value: "react" } });
    expect(mockSetSearch).toHaveBeenCalledWith("react");
  });

  it("renders the theme toggle button", () => {
    render(<DashboardHeader sampleSubscriptions={sampleSubscriptions} />);
    // Sun icon shown in light mode, Moon in dark mode
    const themeBtn = document.querySelector("button[aria-label], button[title]");
    expect(themeBtn).toBeInTheDocument();
    // At minimum a button must exist near the search area
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });

  it("calls setTheme with 'dark' when theme toggle is clicked in light mode", () => {
    const mockSetTheme = vi.fn();
    vi.mocked(useStore).mockReturnValue(buildStore({ theme: "light", setTheme: mockSetTheme }));
    render(<DashboardHeader sampleSubscriptions={sampleSubscriptions} />);

    // Find button containing the Sun icon (light mode shows sun to toggle to dark)
    const buttons = screen.getAllByRole("button");
    // The theme toggle renders a Sun or Moon icon — click each button until setTheme is called
    for (const btn of buttons) {
      fireEvent.click(btn);
      if (mockSetTheme.mock.calls.length > 0) break;
    }
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("calls setTheme with 'light' when theme toggle is clicked in dark mode", () => {
    const mockSetTheme = vi.fn();
    vi.mocked(useStore).mockReturnValue(buildStore({ theme: "dark", setTheme: mockSetTheme }));
    render(<DashboardHeader sampleSubscriptions={sampleSubscriptions} />);

    const buttons = screen.getAllByRole("button");
    for (const btn of buttons) {
      fireEvent.click(btn);
      if (mockSetTheme.mock.calls.length > 0) break;
    }
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("renders logo", () => {
    render(<DashboardHeader sampleSubscriptions={sampleSubscriptions} />);
    expect(screen.getByTestId("logo")).toBeInTheDocument();
  });
});
