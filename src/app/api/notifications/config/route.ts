import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    publicKey: process.env.VAPID_PUBLIC_KEY ?? null,
    tiktokUrl: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "https://www.tiktok.com/@shopkorea8",
  });
}
