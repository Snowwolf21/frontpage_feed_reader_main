/**
 * Zustand store tests.
 *
 * We test the store in isolation by:
 *  1. Creating a fresh store instance per test using `create` so state never leaks between tests.
 *  2. Mocking `saveArticleState` (async DB call) via vi.spyOn so we can assert it was called
 *     without an actual network request.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";


// ── Helpers ───────────────────────────────────────────────────────────────────

function makeArticle(overrides: Partial<{
  title: string;
  link: string;
  guid: string | null;
}> = {}) {
  return {
    title: overrides.title ?? "Test Article",
    link: overrides.link ?? "https://example.com/1",
    pubDate: null,
    author: null,
    summary: null,
    content: null,
    thumbnail: null,
    categories: [],
    guid: overrides.guid ?? "https://example.com/1#guid",
  };
}

function makeFeedData(items: ReturnType<typeof makeArticle>[]) {
  return {
    title: "Test Feed",
    description: null,
    link: "https://example.com",
    feedUrl: "https://example.com/feed.xml",
    image: null,
    lastUpdated: null,
    items,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

// Import the real store factory so we can test the real logic
// We reset each time by re-creating the store

import { useStore } from "@/app/store/useStore";

// Because Zustand stores are singletons, we reset state manually between tests
// by accessing the store's set function directly.
function resetStore() {
  useStore.setState({
    feedData: null,
    selectedArticle: null,
    selectedFeedUrl: "https://example.com/feed.xml",
    search: "",
    activeTab: "feed",
    viewMode: "articles",
    isSidebarCollapsed: false,
    articleStates: {},
  });
}

beforeEach(() => {
  resetStore();
  vi.clearAllMocks();
});

describe("Zustand store — article navigation", () => {
  it("selectArticle sets selectedArticle and switches viewMode to reader", () => {
    const article = makeArticle();
    useStore.setState({ feedData: makeFeedData([article]) });

    // Spy on saveArticleState to avoid real fetch
    const spy = vi
      .spyOn(useStore.getState(), "saveArticleState")
      .mockResolvedValue(undefined);

    useStore.getState().selectArticle("https://example.com/feed.xml", article);

    const state = useStore.getState();
    expect(state.selectedArticle).toBe(article);
    expect(state.viewMode).toBe("reader");
    expect(spy).toHaveBeenCalledWith(
      "https://example.com/feed.xml",
      article,
      { read: true }
    );
  });

  it("selectNextArticle from no selection picks first item", () => {
    const a1 = makeArticle({ title: "Article 1" });
    const a2 = makeArticle({ title: "Article 2" });
    useStore.setState({
      feedData: makeFeedData([a1, a2]),
      selectedArticle: null,
    });
    vi.spyOn(useStore.getState(), "saveArticleState").mockResolvedValue(undefined);

    useStore.getState().selectNextArticle();
    expect(useStore.getState().selectedArticle?.title).toBe("Article 1");
  });

  it("selectNextArticle from middle item advances to next", () => {
    const a1 = makeArticle({ title: "Article 1", guid: "guid-1" });
    const a2 = makeArticle({ title: "Article 2", guid: "guid-2" });
    const a3 = makeArticle({ title: "Article 3", guid: "guid-3" });
    useStore.setState({
      feedData: makeFeedData([a1, a2, a3]),
      selectedArticle: a1,
    });
    vi.spyOn(useStore.getState(), "saveArticleState").mockResolvedValue(undefined);

    useStore.getState().selectNextArticle();
    expect(useStore.getState().selectedArticle?.title).toBe("Article 2");
  });

  it("selectNextArticle clamps at last item", () => {
    const a1 = makeArticle({ title: "Article 1", guid: "guid-1" });
    const a2 = makeArticle({ title: "Article 2", guid: "guid-2" });
    useStore.setState({
      feedData: makeFeedData([a1, a2]),
      selectedArticle: a2,
    });
    vi.spyOn(useStore.getState(), "saveArticleState").mockResolvedValue(undefined);

    useStore.getState().selectNextArticle();
    expect(useStore.getState().selectedArticle?.title).toBe("Article 2");
  });

  it("selectPrevArticle clamps at first item", () => {
    const a1 = makeArticle({ title: "Article 1", guid: "guid-1" });
    const a2 = makeArticle({ title: "Article 2", guid: "guid-2" });
    useStore.setState({
      feedData: makeFeedData([a1, a2]),
      selectedArticle: a1,
    });
    vi.spyOn(useStore.getState(), "saveArticleState").mockResolvedValue(undefined);

    useStore.getState().selectPrevArticle();
    expect(useStore.getState().selectedArticle?.title).toBe("Article 1");
  });

  it("selectPrevArticle from middle steps back one item", () => {
    const a1 = makeArticle({ title: "Article 1", guid: "guid-1" });
    const a2 = makeArticle({ title: "Article 2", guid: "guid-2" });
    const a3 = makeArticle({ title: "Article 3", guid: "guid-3" });
    useStore.setState({
      feedData: makeFeedData([a1, a2, a3]),
      selectedArticle: a3,
    });
    vi.spyOn(useStore.getState(), "saveArticleState").mockResolvedValue(undefined);

    useStore.getState().selectPrevArticle();
    expect(useStore.getState().selectedArticle?.title).toBe("Article 2");
  });

  it("selectNextArticle does nothing when feedData is empty", () => {
    useStore.setState({ feedData: null, selectedArticle: null });
    const spy = vi.spyOn(useStore.getState(), "saveArticleState").mockResolvedValue(undefined);
    useStore.getState().selectNextArticle();
    expect(spy).not.toHaveBeenCalled();
    expect(useStore.getState().selectedArticle).toBeNull();
  });
});

describe("Zustand store — simple setters", () => {
  it("setSearch updates the search field", () => {
    useStore.getState().setSearch("react");
    expect(useStore.getState().search).toBe("react");
  });

  it("setActiveTab updates activeTab", () => {
    useStore.getState().setActiveTab("discover");
    expect(useStore.getState().activeTab).toBe("discover");
  });

  it("toggleSidebar flips isSidebarCollapsed", () => {
    useStore.setState({ isSidebarCollapsed: false });
    useStore.getState().toggleSidebar();
    expect(useStore.getState().isSidebarCollapsed).toBe(true);
    useStore.getState().toggleSidebar();
    expect(useStore.getState().isSidebarCollapsed).toBe(false);
  });

  it("setViewMode updates viewMode", () => {
    useStore.getState().setViewMode("reader");
    expect(useStore.getState().viewMode).toBe("reader");
  });
});
