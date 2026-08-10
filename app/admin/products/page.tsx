import { getAllProducts } from "@/lib/products-admin";
import { ProductAdmin } from "@/components/ProductAdmin";

export default async function AdminProductsPage() {
  const products = await getAllProducts();
  return <ProductAdmin initialProducts={products} />;
}
