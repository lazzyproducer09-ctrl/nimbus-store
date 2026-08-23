// Run with:  node lib/coupon-math.test.mjs
//
// Imports the real lib/coupon-math.ts (Node strips the types), so these
// assertions exercise the exact code that prices a live order. Discounts are
// money, so the edge cases below are worth keeping honest.
import { applyCoupon, shippingFor } from "./coupon-math.ts";

const RULES = {
  freeShippingThreshold: 999,
  shippingFee: 79,
  coupons: [
    { code: "FIRST10", type: "percent", value: 10, minOrder: 0, active: true },
    { code: "FLAT500", type: "flat", value: 500, minOrder: 2000, active: true },
    { code: "OLDSALE", type: "percent", value: 50, minOrder: 0, active: false },
    { code: "HUGE", type: "flat", value: 5000, minOrder: 0, active: true },
  ],
};

let pass = 0;
let fail = 0;

function check(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) {
    pass++;
    console.log("  ok    " + name);
  } else {
    fail++;
    console.log("  FAIL  " + name);
    console.log("        got  " + JSON.stringify(got));
    console.log("        want " + JSON.stringify(want));
  }
}

const discount = (code, subtotal) => {
  const r = applyCoupon(code, subtotal, RULES);
  return r.ok ? r.discount : "refused: " + r.error;
};

console.log("\ndiscount codes");
check("10% of 1500", discount("FIRST10", 1500), 150);
check("lower case still matches", discount("first10", 1500), 150);
check("surrounding spaces trimmed", discount("  FIRST10  ", 1500), 150);
check("flat 500 at the minimum", discount("FLAT500", 2000), 500);
check(
  "flat 500 below the minimum is refused",
  discount("FLAT500", 1999),
  "refused: This code needs an order of ₹2000 or more.",
);
check("deactivated code is refused", discount("OLDSALE", 1500), "refused: That code isn't valid.");
check("unknown code is refused", discount("NOPE", 1500), "refused: That code isn't valid.");
check("empty code is refused", discount("", 1500), "refused: Enter a code.");
check("discount can never exceed the subtotal", discount("HUGE", 300), 300);

console.log("\nshipping");
check("below threshold pays the fee", shippingFor(998, RULES), 79);
check("exactly at threshold is free", shippingFor(999, RULES), 0);
check("above threshold is free", shippingFor(5000, RULES), 0);

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
