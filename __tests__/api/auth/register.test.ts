/**
 * Tests for POST /api/auth/register
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("@/app/config/db", () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/utils/password", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed_pw"),
  comparePassword: vi.fn(),
}));
vi.mock("@/app/lib/rateLimiter", () => ({
  registerLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  loginLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
}));
vi.mock("@/app/lib/rateLimiter/utils", () => ({
  createIdentifier: vi.fn().mockReturnValue("test-identifier"),
}));

// The register route calls User.findOne({...}).lean() twice (email + username).
// We mock User.findOne to return an object with a .lean() method that by default
// resolves to null (no existing user). Per-test overrides call mockReturnValue again.
vi.mock("@/app/model/userModel", () => ({
  default: {
    findOne: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(null) }),
    create: vi.fn().mockResolvedValue({}),
  },
}));

import { POST } from "@/app/api/auth/register/route";
import { registerLimiter } from "@/app/lib/rateLimiter";
import User from "@/app/model/userModel";

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", "x-real-ip": "1.2.3.4" },
  });
}

const validBody = {
  firstName: "Jane",
  lastName: "Doe",
  username: "janedoe",
  email: "jane@example.com",
  password: "Password1!",
};

// Use vi.resetAllMocks() — resets call counts and return values, but not implementations.
// Then re-register return values explicitly so each test starts clean.
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(registerLimiter.limit).mockResolvedValue({ success: true, limit: 5, remaining: 4, reset: 0, pending: Promise.resolve() });
  // Default: no existing user (both email and username lookups return null)
  vi.mocked(User.findOne).mockReturnValue({ lean: vi.fn().mockResolvedValue(null) } as never);
  vi.mocked(User.create).mockResolvedValue({} as never);
});

describe("POST /api/auth/register", () => {
  it("returns 400 when required fields are missing", async () => {
    const req = makeRequest({ email: "jane@example.com" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/required/i);
  });

  it("returns 400 for an invalid email format", async () => {
    const req = makeRequest({ ...validBody, email: "not-an-email" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/email/i);
  });

  it("returns 400 for a username with special characters", async () => {
    const req = makeRequest({ ...validBody, username: "jane doe!" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/username/i);
  });

  it("returns 400 for a username shorter than 3 characters", async () => {
    const req = makeRequest({ ...validBody, username: "ab" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for a weak password (no uppercase)", async () => {
    const req = makeRequest({ ...validBody, password: "password1!" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/password/i);
  });

  it("returns 400 for a weak password (no number)", async () => {
    const req = makeRequest({ ...validBody, password: "PasswordOnly!" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 409 when email already exists", async () => {
    const existingUser = { email: "jane@example.com" };
    vi.mocked(User.findOne).mockReturnValue({ lean: vi.fn().mockResolvedValue(existingUser) } as never);
    const req = makeRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.message).toMatch(/already exists/i);
  });

  it("returns 201 on valid registration", async () => {
    // findOne returns null (default) — no conflict, proceed to create
    vi.mocked(User.findOne).mockReturnValue({ lean: vi.fn().mockResolvedValue(null) } as never);
    vi.mocked(User.create).mockResolvedValue({} as never);
    const req = makeRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.message).toMatch(/registered/i);
    expect(User.create).toHaveBeenCalledOnce();
  });

  it("returns 429 when rate limit is exceeded", async () => {
    vi.mocked(registerLimiter.limit).mockResolvedValue({ success: false, limit: 5, remaining: 0, reset: 0, pending: Promise.resolve() });
    const req = makeRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(429);
  });
});
