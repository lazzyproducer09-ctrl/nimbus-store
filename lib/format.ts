// Format a whole-rupee number as Indian currency, e.g. 3499 -> "₹3,499".
export function inr(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}
