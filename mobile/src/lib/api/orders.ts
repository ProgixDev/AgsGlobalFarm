import { apiFetch } from "@/lib/api/client";

export async function fetchOrders(): Promise<Order[]> {
  const data = await apiFetch<{ orders: Order[] }>("/api/orders", {
    auth: true,
  });
  return data.orders || [];
}

export async function fetchOrderById(id: string): Promise<Order> {
  const data = await apiFetch<{ order: Order }>(
    `/api/orders/${encodeURIComponent(id)}`,
    { auth: true },
  );
  return data.order;
}
