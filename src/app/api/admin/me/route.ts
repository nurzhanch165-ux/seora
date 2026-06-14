import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth.server";

export async function GET() {
  return NextResponse.json({ loggedIn: isAdminRequest() });
}
