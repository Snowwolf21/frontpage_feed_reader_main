import { headers } from "next/headers";
import { NextRequest } from "next/server";
export async function getClientIP() {
  const headerList = await headers();

  // x-real-ip is set by a trusted reverse proxy (e.g. Vercel edge).
  // x-forwarded-for can be spoofed by the client — only use as a fallback.
  return (
    headerList.get("x-real-ip") ??
    headerList.get("x-forwarded-for")?.split(",")[0].trim() ??
    "127.0.0.1"
  );
}


// Identifier Create identifier fro rate limit;



export function createIdentifier(
  prefix: string,
  req: NextRequest
) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0].trim() ?? "unknown";

  return `${prefix}:${ip}`;
}