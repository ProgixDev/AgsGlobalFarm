import { auth } from "@/lib/auth";
import { getUserOrders } from "@/lib/db";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getCartItemPrice } from "@/lib/cart-utils";

export default async function OrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect("/login");
  }

  const orders = await getUserOrders();

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Mes Commandes</h1>

      {orders.length === 0 ? (
        <p>Vous n&apos;avez pas encore passé de commande.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold">
                  Commande #{order._id?.toString().slice(-8)}
                </h2>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-800"
                      : order.paymentStatus === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {order.paymentStatus === "paid"
                    ? "Payée"
                    : order.paymentStatus === "pending"
                      ? "En attente"
                      : "Échouée"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {format(new Date(order.createdAt), "PPP", { locale: fr })}
              </p>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">
                        {"name" in item ? item.name : item.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantité: {item.quantity}
                        {item.sessionId && ` | Session: ${item.sessionId}`}
                      </p>
                    </div>
                    <p className="font-medium">
                      {(getCartItemPrice(item) * item.quantity).toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "XAF",
                      })}
                    </p>
                  </div>
                ))}
                <hr className="my-4" />
                <div className="flex justify-between items-center font-bold">
                  <p>Total</p>
                  <p>
                    {order.totalAmount.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "XAF",
                    })}
                  </p>
                </div>
                {order.address && (
                  <div className="mt-4">
                    <p className="font-medium">Adresse de livraison:</p>
                    <p className="text-sm text-gray-600">
                      {order.address.street}, {order.address.city}{" "}
                      {order.address.postalCode}, {order.address.country}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
