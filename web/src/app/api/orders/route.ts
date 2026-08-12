import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserOrders } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const orders = await getUserOrders();
  return NextResponse.json({ orders });
}
