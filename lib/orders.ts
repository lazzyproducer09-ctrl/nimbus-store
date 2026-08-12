import { createClient } from "./supabase/server";
import type { CartItem } from "./cart-context";

// Customer-friendly labels for each order status (shared across pages).
export const ORDER_STATUS_LABEL: Record<string, string> = {
  created: "Payment pending",
  paid: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancel_requested: "Cancellation requested",
  cancelled: "Cancelled",
  return_requested: "Return requested",
  return_approved: "Return approved",
  returned: "Returned",
};

export type Order = {
  id: string;
  user_id: string;
  status:
    | "created"
    | "paid"
    | "shipped"
    | "delivered"
    | "cancel_requested"
    | "cancelled"
    | "return_requested"
    | "return_approved"
    | "returned";
  subtotal: number;
  shipping: number;
  total: number;
  items: CartItem[];
  address: {
    full_name: string;
    phone: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  paid_at: string | null;
  cancel_requested_at: string | null;
  cancelled_at: string | null;
  prev_status: string | null;
  reject_reason: string | null;
  reject_kind: string | null;
  rejected_at: string | null;
  return_reason: string | null;
  return_requested_at: string | null;
  return_approved_at: string | null;
  returned_at: string | null;
  payment_attempts: number;
};

// The logged-in user's orders (newest first).
export async function getMyOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load orders:", error.message);
    return [];
  }
  return data as Order[];
}

// ALL orders — for the admin panel (RLS only returns rows for an admin user).
export async function getAllOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load all orders:", error.message);
    return [];
  }
  return data as Order[];
}

// All orders for one user (admin only — RLS returns rows only for an admin).
export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load user orders:", error.message);
    return [];
  }
  return data as Order[];
}

// A single order by id (RLS ensures the user can only see their own).
export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("Failed to load order:", error.message);
    return null;
  }
  return data as Order | null;
}
