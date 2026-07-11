import { headers } from "next/headers";

export async function getClientIP() {
  const headerList = await headers();

  return (
    headerList.get("x-forwarded-for")?.split(",")[0] ??
    headerList.get("x-real-ip") ??
    "127.0.0.1"
  );
}


// Identifier Create identifier fro rate limit;

export async function createIdentifier(action: string, unique?: string) {
  const ip = await getClientIP();

  if (!unique) {
    return `${action}:${ip}`;
  }

  return `${action}:${ip}:${unique.toLowerCase()}`;
}