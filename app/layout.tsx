import type { Metadata } from "next";
import { Sora, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { CartDrawer } from "@/components/CartDrawer";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

// Display font: geometric, techy and confident — the Dark-Tech-Drop headline.
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Body font: clean, modern, highly readable — pairs well with a techy display.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

// Mono font: for eyebrow labels, tags and tickers (the "drop"/terminal feel).
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "YOINK — Stuff you didn't know you needed",
  description:
    "Unexpected, impossibly cool things for people who refuse boring. Curated oddities, gadgets and statement pieces — shipped across India.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="en"
      className={`${sora.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="grain min-h-full flex flex-col overflow-x-hidden bg-void text-chalk">
        <CartProvider>
          <WishlistProvider>
            <AnnouncementBar />
            <Header loggedIn={!!user} admin={isAdmin(user?.email)} />
            <main className="flex flex-1 flex-col">{children}</main>
            <Footer />
            <CartDrawer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
