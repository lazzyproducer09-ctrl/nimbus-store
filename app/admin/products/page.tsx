import { getAllProducts } from "@/lib/products-admin";
import { getCategories } from "@/lib/categories";
import { ProductAdmin } from "@/components/ProductAdmin";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);
  return <ProductAdmin initialProducts={products} categories={categories} />;
}
