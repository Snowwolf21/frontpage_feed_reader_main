/**
 * Tests for POST /api/auth/login
 *
 * All DB and rate-limiter calls are mocked — no real MongoDB or Upstash connection.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("@/app/config/db", () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/utils/password", () => ({
  comparePassword: vi.fn(),
  hashPassword: vi.fn(),
}));
vi.mock("@/app/lib/rateLimiter", () => ({
  loginLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
}));
vi.mock("@/app/lib/rateLimiter/utils", () => ({
  createIdentifier: vi.fn().mockReturnValue("test-identifier"),
}));
vi.mock("@/app/model/userModel", () => ({
  default: {
    findOne: vi.fn(),
  },
}));

import { POST } from "@/app/api/auth/login/route";
import { comparePassword } from "@/utils/password";
import { loginLimiter } from "@/app/lib/rateLimiter";
import User from "@/app/model/userModel";

const mockUser = {
  _id: "507f1f77bcf86cd799439011",
  firstName: "Jane",
  lastName: "Doe",
  username: "janedoe",
  email: "jane@example.com",
  password: "hashed_password",
  avatarUrl: null,
};

function makeRequest(body: Record<string, unknown>, ip = "127.0.0.1") {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "x-real-ip": ip,
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(loginLimiter.limit).mockResolvedValue({ success: true, limit: 5, remaining: 4, reset: 0, pending: Promise.resolve() });
  vi.mocked(User.findOne).mockResolvedValue(null);
});

describe("POST /api/auth/login", () => {
  it("returns 400 when email is missing", async () => {
    const req = makeRequest({ password: "Password1" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/required/i);
  });

  it("returns 400 when password is missing", async () => {
    const req = makeRequest({ email: "jane@example.com" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 with generic message for unknown email", async () => {
    vi.mocked(User.findOne).mockResolvedValue(null);
    const req = makeRequest({ email: "ghost@example.com", password: "Password1" });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    // Must not reveal whether the user exists
    expect(body.message).toBe("Invalid email or password.");
  });

  it("returns 401 with generic message for wrong password", async () => {
    vi.mocked(User.findOne).mockResolvedValue(mockUser);
    vi.mocked(comparePassword).mockResolvedValue(false);
    const req = makeRequest({ email: "jane@example.com", password: "WrongPassword1" });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.message).toBe("Invalid email or password.");
  });

  it("returns 200 and sets httpOnly cookie on valid credentials", async () => {
    process.env.JWT_SECRET = "test-secret-at-least-32-chars-long!!";
    vi.mocked(User.findOne).mockResolvedValue(mockUser);
    vi.mocked(comparePassword).mockResolvedValue(true);

    const req = makeRequest({ email: "jane@example.com", password: "Password1" });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("Login successful");
    expect(body.user.email).toBe("jane@example.com");

    const cookie = res.headers.get("set-cookie");
    expect(cookie).toContain("token=");
    expect(cookie).toContain("HttpOnly");
  });

  it("sets 30-day maxAge when rememberMe is true", async () => {
    process.env.JWT_SECRET = "test-secret-at-least-32-chars-long!!";
    vi.mocked(User.findOne).mockResolvedValue(mockUser);
    vi.mocked(comparePassword).mockResolvedValue(true);

    const req = makeRequest({ email: "jane@example.com", password: "Password1", rememberMe: true });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const cookie = res.headers.get("set-cookie") ?? "";
    // 30 days in seconds = 2592000
    expect(cookie).toContain("2592000");
  });

  it("returns 429 when rate limit is exceeded", async () => {
    vi.mocked(loginLimiter.limit).mockResolvedValue({ success: false, limit: 5, remaining: 0, reset: 0, pending: Promise.resolve() });
    const req = makeRequest({ email: "jane@example.com", password: "Password1" });
    const res = await POST(req);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.message).toMatch(/too many/i);
  });
});
