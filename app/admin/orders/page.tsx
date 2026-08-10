import { getAllOrders } from "@/lib/orders";
import { OrderAdmin } from "@/components/OrderAdmin";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();
  return <OrderAdmin initialOrders={orders} />;
}
