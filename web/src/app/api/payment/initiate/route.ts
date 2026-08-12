import { NextRequest, NextResponse } from "next/server";
import { PayDunyaAPI, PayDunyaItem } from "@/lib/payDunya";

interface CartItem {
  name?: string;
  title?: string;
  quantity: number;
  price?: number;
  priceTTC?: number;
  description?: string;
  shortDescription?: string;
  type?: "online" | "presentiel";
  selectedSessionId?: number;
  _id?: string;
  id?: number | string;
}

function priceOf(item: CartItem): number {
  return item.priceTTC ?? item.price ?? 0;
}

function descriptionOf(item: CartItem): string {
  return item.shortDescription ?? item.description ?? "";
}

export async function POST(request: NextRequest) {
  try {
    const { cart, user, address } = await request.json();

    // Validate required data
    if (!cart || !user || !address) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 },
      );
    }

    // Initialize PayDunya API
    const api = new PayDunyaAPI();

    // Calculate total
    const totalAmount = cart.reduce(
      (sum: number, item: CartItem) => sum + priceOf(item) * item.quantity,
      0,
    );

    // Build items
    const items: Record<string, PayDunyaItem> = {};
    cart.forEach((item: CartItem, index: number) => {
      const itemPrice = priceOf(item);
      items[`item_${index}`] = {
        name: item.name || item.title || "Product",
        quantity: item.quantity,
        unit_price: itemPrice,
        total_price: itemPrice * item.quantity,
        description: descriptionOf(item),
      };
    });

    // Build invoice data
    const invoiceData = {
      items,
      total_amount: totalAmount,
      description: `Commande AGS Globalfarm - ${user.firstName} ${user.lastName}`,
    };

    // Build store data
    const storeData = {
      name: "AGS Globalfarm SARL",
      tagline: "Agriculture durable",
      phone: process.env.STORE_PHONE || "",
      postal_address: process.env.STORE_ADDRESS || "",
      website_url: process.env.NEXT_PUBLIC_APP_URL,
    };

    // Build custom data
    const customData = {
      userId: user.id,
      address,
      cart,
    };

    // Build actions
    const actions = {
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    };

    // Create invoice
    try {
      const result = await api.createInvoice({
        invoice: invoiceData,
        store: storeData,
        custom_data: customData,
        actions,
      });

      return NextResponse.json({
        paymentUrl: result.response_text,
        token: result.token,
      });
    } catch (error) {
      console.error("PayDunya invoice creation error:", error);
      return NextResponse.json(
        { error: "Failed to create payment invoice" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
