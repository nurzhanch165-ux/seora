import { NextResponse } from "next/server";
import { getCustomerIdFromRequest } from "@/lib/customerSession.server";
import { fetchCustomerById } from "@/lib/supabase/customers.server";

export async function GET() {
  const id = getCustomerIdFromRequest();
  if (!id) {
    return NextResponse.json({ customer: null });
  }
  const customer = await fetchCustomerById(id);
  if (!customer) {
    return NextResponse.json({ customer: null });
  }
  return NextResponse.json({ customer });
}
