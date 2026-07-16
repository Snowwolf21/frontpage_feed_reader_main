/**
 * Component tests for <ArticlesList />.
 *
 * The Zustand store is fully mocked so this only tests rendering logic,
 * not store implementation details.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ArticlesList from "@/app/dashboard/components/ArticlesList";
import { useStore } from "@/app/store/useStore";

vi.mock("@/app/store/useStore");

// @tanstack/react-virtual needs a real scroll container with a measured height.
// happy-dom doesn't implement layout, so we mock the virtualizer to render all items.
vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: vi.fn(({ count, estimateSize }: { count: number; estimateSize: () => number }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, i) => ({
        index: i,
        key: String(i),
        start: i * estimateSize(),
        size: estimateSize(),
        measureElement: vi.fn(),
      })),
    getTotalSize: () => count * estimateSize(),
    measureElement: vi.fn(),
  })),
}));

const FEED_URL = "https://example.com/feed.xml";

const mockArticles = [
  {
    title: "Article Alpha",
    link: "https://example.com/alpha",
    pubDate: "2024-01-01T00:00:00Z",
    author: "Alice",
    summary: "Summary of alpha",
    content: null,
    thumbnail: null,
    categories: [],
    guid: "guid-alpha",
  },
  {
    title: "Article Beta",
    link: "https://example.com/beta",
    pubDate: "2024-01-02T00:00:00Z",
    author: "Bob",
    summary: "Summary of beta",
    content: null,
    thumbnail: null,
    categories: [],
    guid: "guid-beta",
  },
];

function buildStore(overrides: Partial<ReturnType<typeof useStore>> = {}): ReturnType<typeof useStore> {
  return {
    subscriptions: [{ title: "Example Feed", feedUrl: FEED_URL, category: "Tech" }],
    selectedFeedUrl: FEED_URL,
    feedData: {
      title: "Example Feed",
      description: null,
      link: "https://example.com",
      feedUrl: FEED_URL,
      image: null,
      lastUpdated: null,
      items: mockArticles,
    },
    isLoadingFeed: false,
    articleStates: {},
    selectedArticle: null,
    selectArticle: vi.fn(),
    saveArticleState: vi.fn().mockResolvedValue(undefined),
    setViewMode: vi.fn(),
    search: "",
    ...overrides,
  } as unknown as ReturnType<typeof useStore>;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useStore).mockReturnValue(buildStore());
});

describe("<ArticlesList />", () => {
  it("renders a loading message when isLoadingFeed is true", () => {
    vi.mocked(useStore).mockReturnValue(buildStore({ isLoadingFeed: true }));
    render(<ArticlesList />);
    expect(screen.getByText(/loading feed/i)).toBeInTheDocument();
  });

  it("renders 'No articles match' when search returns no results", () => {
    vi.mocked(useStore).mockReturnValue(
      buildStore({
        search: "xyznonexistent",
        feedData: {
          title: "Example Feed",
          description: null,
          link: "https://example.com",
          feedUrl: FEED_URL,
          image: null,
          lastUpdated: null,
          items: mockArticles,
        },
      })
    );
    render(<ArticlesList />);
    expect(screen.getByText(/no articles match/i)).toBeInTheDocument();
  });

  it("renders all article titles", () => {
    render(<ArticlesList />);
    expect(screen.getByText("Article Alpha")).toBeInTheDocument();
    expect(screen.getByText("Article Beta")).toBeInTheDocument();
  });

  it("calls selectArticle when an article row is clicked", () => {
    const mockSelect = vi.fn();
    vi.mocked(useStore).mockReturnValue(buildStore({ selectArticle: mockSelect }));
    render(<ArticlesList />);
    fireEvent.click(screen.getByText("Article Alpha"));
    expect(mockSelect).toHaveBeenCalledWith(FEED_URL, mockArticles[0]);
  });

  it("shows filled indigo dot for unread articles", () => {
    vi.mocked(useStore).mockReturnValue(
      buildStore({
        articleStates: {
          [`${FEED_URL}::guid-alpha`]: { read: false },
        },
      })
    );
    render(<ArticlesList />);
    const dots = document.querySelectorAll(".bg-indigo-500, .dark\\:bg-indigo-400");
    expect(dots.length).toBeGreaterThan(0);
  });

  it("shows empty ring dot for read articles", () => {
    vi.mocked(useStore).mockReturnValue(
      buildStore({
        articleStates: {
          [`${FEED_URL}::guid-alpha`]: { read: true },
        },
      })
    );
    render(<ArticlesList />);
    // Read articles show a border-only dot
    const emptyDots = document.querySelectorAll(".border.bg-transparent");
    expect(emptyDots.length).toBeGreaterThan(0);
  });

  it("shows bookmark icon only for bookmarked articles", () => {
    vi.mocked(useStore).mockReturnValue(
      buildStore({
        articleStates: {
          [`${FEED_URL}::guid-alpha`]: { bookmarked: true },
          [`${FEED_URL}::guid-beta`]: { bookmarked: false },
        },
      })
    );
    render(<ArticlesList />);
    // Only one bookmark SVG should be in the document
    const bookmarks = document.querySelectorAll(".text-amber-500");
    expect(bookmarks).toHaveLength(1);
  });

  it("calls saveArticleState when the read-toggle dot button is clicked", () => {
    const mockSave = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useStore).mockReturnValue(
      buildStore({
        saveArticleState: mockSave,
        articleStates: {
          [`${FEED_URL}::guid-alpha`]: { read: false },
        },
      })
    );
    render(<ArticlesList />);
    // The first toggle button belongs to Article Alpha
    const toggleButtons = screen.getAllByTitle(/mark as/i);
    fireEvent.click(toggleButtons[0]);
    expect(mockSave).toHaveBeenCalledWith(FEED_URL, mockArticles[0], { read: true });
  });

  it("renders article count in the header", () => {
    render(<ArticlesList />);
    expect(screen.getByText(/2 articles loaded/i)).toBeInTheDocument();
  });
});
