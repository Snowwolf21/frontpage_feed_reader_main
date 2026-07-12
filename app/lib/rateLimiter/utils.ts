import { headers } from "next/headers";
import { NextRequest } from "next/server";
export async function getClientIP() {
  const headerList = await headers();

  return (
    headerList.get("x-forwarded-for")?.split(",")[0] ??
    headerList.get("x-real-ip") ??
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