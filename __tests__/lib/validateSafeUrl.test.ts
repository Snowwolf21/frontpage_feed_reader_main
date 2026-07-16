import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateSafeUrl } from "@/app/api/feeds/_lib/feedParser";

// Mock the dns module so tests never make real DNS lookups
vi.mock("dns", () => ({
  default: {
    promises: {
      lookup: vi.fn(),
    },
  },
  promises: {
    lookup: vi.fn(),
  },
}));

import dns from "dns";
const mockLookup = vi.mocked(dns.promises.lookup);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("validateSafeUrl — SSRF protection", () => {
  it("blocks 127.0.0.1 without DNS lookup", async () => {
    const result = await validateSafeUrl("http://127.0.0.1/feed");
    expect(result.ok).toBe(false);
    expect(mockLookup).not.toHaveBeenCalled();
  });

  it("blocks 10.x.x.x private range", async () => {
    const result = await validateSafeUrl("http://10.0.0.1/feed");
    expect(result.ok).toBe(false);
    expect(mockLookup).not.toHaveBeenCalled();
  });

  it("blocks 192.168.x.x private range", async () => {
    const result = await validateSafeUrl("http://192.168.1.1/feed");
    expect(result.ok).toBe(false);
  });

  it("blocks 172.16–31.x.x private range", async () => {
    const result = await validateSafeUrl("http://172.16.0.1/feed");
    expect(result.ok).toBe(false);
  });

  it("blocks 169.254.x.x link-local (cloud metadata)", async () => {
    const result = await validateSafeUrl("http://169.254.169.254/latest/meta-data/");
    expect(result.ok).toBe(false);
  });

  it("blocks IPv6 loopback ::1", async () => {
    const result = await validateSafeUrl("http://[::1]/feed");
    expect(result.ok).toBe(false);
  });

  it("blocks 'localhost' by hostname", async () => {
    const result = await validateSafeUrl("http://localhost/feed");
    expect(result.ok).toBe(false);
    expect(mockLookup).not.toHaveBeenCalled();
  });

  it("blocks *.local mDNS hostnames", async () => {
    const result = await validateSafeUrl("http://myprinter.local/feed");
    expect(result.ok).toBe(false);
    expect(mockLookup).not.toHaveBeenCalled();
  });

  it("allows a public URL when DNS resolves to public IPs", async () => {
    // Simulate a DNS lookup returning a legitimate public IP
    mockLookup.mockResolvedValueOnce([
      { address: "93.184.216.34", family: 4 },
    ] as unknown as dns.LookupAddress);

    const result = await validateSafeUrl("https://example.com/feed.xml");
    expect(result.ok).toBe(true);
    expect(mockLookup).toHaveBeenCalledWith("example.com", { all: true });
  });

  it("blocks a public hostname that DNS resolves to a private IP (DNS rebinding)", async () => {
    // Attacker-controlled domain whose DNS resolves to an internal IP
    mockLookup.mockResolvedValueOnce([
      { address: "10.0.0.50", family: 4 },
    ] as unknown as dns.LookupAddress);

    const result = await validateSafeUrl("https://evil.example.com/feed.xml");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("private");
    }
  });

  it("returns ok: false when DNS resolution fails", async () => {
    mockLookup.mockRejectedValueOnce(new Error("ENOTFOUND"));
    const result = await validateSafeUrl("https://nonexistent-host-xyz.com/feed");
    expect(result.ok).toBe(false);
  });

  it("rejects non-http URLs before DNS lookup", async () => {
    const result = await validateSafeUrl("ftp://example.com/feed");
    expect(result.ok).toBe(false);
    expect(mockLookup).not.toHaveBeenCalled();
  });
});
