import { NextResponse } from "next/server";
import { fetchExchangeRates } from "@/lib/exchangeRates.server";

export async function GET() {
  const rates = await fetchExchangeRates();
  return NextResponse.json({ rates, updatedAt: new Date().toISOString() });
}
