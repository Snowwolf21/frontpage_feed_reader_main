/**
 * Tests for the keyboard shortcuts hook.
 *
 * Strategy: render a lightweight component that mounts the hook,
 * then fire keyboard events with userEvent and assert store calls.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { useKeyboardShortcuts } from "@/app/dashboard/hooks/useKeyboardShortcuts";
import { useStore } from "@/app/store/useStore";

// ── Mock the entire Zustand store ────────────────────────────────────────────
vi.mock("@/app/store/useStore");

const mockSelectNextArticle = vi.fn();
const mockSelectPrevArticle = vi.fn();
const mockSaveArticleState = vi.fn().mockResolvedValue(undefined);
const mockSetSearch = vi.fn();

const mockArticle = {
  title: "Test Article",
  link: "https://example.com/article",
  pubDate: null,
  author: null,
  summary: null,
  content: null,
  thumbnail: null,
  categories: [],
  guid: "https://example.com/article#guid",
};

function buildMockStore(overrides: Partial<ReturnType<typeof useStore>> = {}) {
  return {
    selectedArticle: mockArticle,
    selectedFeedUrl: "https://example.com/feed.xml",
    articleStates: {},
    saveArticleState: mockSaveArticleState,
    selectNextArticle: mockSelectNextArticle,
    selectPrevArticle: mockSelectPrevArticle,
    setSearch: mockSetSearch,
    ...overrides,
  };
}

// Minimal component that mounts the hook
function HookHarness() {
  useKeyboardShortcuts();
  return <div />;
}

function fireKey(key: string, target?: EventTarget) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true });
  (target ?? window).dispatchEvent(event);
  return event;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useStore).mockReturnValue(buildMockStore() as ReturnType<typeof useStore>);
});

describe("useKeyboardShortcuts", () => {
  it("j key calls selectNextArticle", () => {
    render(<HookHarness />);
    fireKey("j");
    expect(mockSelectNextArticle).toHaveBeenCalledOnce();
  });

  it("ArrowDown key calls selectNextArticle", () => {
    render(<HookHarness />);
    fireKey("ArrowDown");
    expect(mockSelectNextArticle).toHaveBeenCalledOnce();
  });

  it("k key calls selectPrevArticle", () => {
    render(<HookHarness />);
    fireKey("k");
    expect(mockSelectPrevArticle).toHaveBeenCalledOnce();
  });

  it("ArrowUp key calls selectPrevArticle", () => {
    render(<HookHarness />);
    fireKey("ArrowUp");
    expect(mockSelectPrevArticle).toHaveBeenCalledOnce();
  });

  it("r key toggles read on the selected article", () => {
    vi.mocked(useStore).mockReturnValue(
      buildMockStore({
        articleStates: {
          "https://example.com/feed.xml::https://example.com/article#guid": { read: false },
        },
      }) as ReturnType<typeof useStore>
    );
    render(<HookHarness />);
    fireKey("r");
    expect(mockSaveArticleState).toHaveBeenCalledWith(
      "https://example.com/feed.xml",
      mockArticle,
      { read: true }
    );
  });

  it("r key marks unread when article is currently read", () => {
    vi.mocked(useStore).mockReturnValue(
      buildMockStore({
        articleStates: {
          "https://example.com/feed.xml::https://example.com/article#guid": { read: true },
        },
      }) as ReturnType<typeof useStore>
    );
    render(<HookHarness />);
    fireKey("r");
    expect(mockSaveArticleState).toHaveBeenCalledWith(
      "https://example.com/feed.xml",
      mockArticle,
      { read: false }
    );
  });

  it("b key toggles bookmarked on the selected article", () => {
    render(<HookHarness />);
    fireKey("b");
    expect(mockSaveArticleState).toHaveBeenCalledWith(
      "https://example.com/feed.xml",
      mockArticle,
      { bookmarked: true }
    );
  });

  it("v key opens the article link in a new tab", () => {
    render(<HookHarness />);
    fireKey("v");
    expect(window.open).toHaveBeenCalledWith(
      "https://example.com/article",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("v key does nothing when selectedArticle has no link", () => {
    vi.mocked(useStore).mockReturnValue(
      buildMockStore({ selectedArticle: { ...mockArticle, link: "" } }) as ReturnType<typeof useStore>
    );
    render(<HookHarness />);
    fireKey("v");
    expect(window.open).not.toHaveBeenCalled();
  });

  it("/ key focuses the search input and clears search", () => {
    const input = document.createElement("input");
    input.placeholder = "Search feeds";
    document.body.appendChild(input);
    const focusSpy = vi.spyOn(input, "focus");

    render(<HookHarness />);
    fireKey("/");

    expect(focusSpy).toHaveBeenCalledOnce();
    expect(mockSetSearch).toHaveBeenCalledWith("");

    document.body.removeChild(input);
  });

  it("keys are ignored when an input element is focused", () => {
    render(<HookHarness />);
    const input = document.createElement("input");
    document.body.appendChild(input);
    fireKey("j", input);
    expect(mockSelectNextArticle).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it("keys are ignored when a textarea is focused", () => {
    render(<HookHarness />);
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    fireKey("k", textarea);
    expect(mockSelectPrevArticle).not.toHaveBeenCalled();
    document.body.removeChild(textarea);
  });

  it("removes event listener on unmount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(<HookHarness />);

    const addedHandlers = addSpy.mock.calls.filter(([type]) => type === "keydown").length;
    unmount();
    const removedHandlers = removeSpy.mock.calls.filter(([type]) => type === "keydown").length;

    expect(addedHandlers).toBeGreaterThan(0);
    expect(removedHandlers).toBe(addedHandlers);
  });
});
