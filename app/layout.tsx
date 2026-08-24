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
import { getSiteContent } from "@/lib/site-content";
import { getStoreSettings } from "@/lib/store-settings";
import { getCategories } from "@/lib/categories";
import { Analytics } from "@/components/Analytics";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { StoreSettingsProvider } from "@/components/StoreSettingsProvider";

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
  // Must NOT be "--font-mono" — that collides with Tailwind's own theme key
  // and makes the variable reference itself (see globals.css).
  variable: "--font-jetbrains",
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
  // Auth and the editable copy are independent — fetch them together.
  const [{ data: { user } }, content, store, categories] = await Promise.all([
    supabase.auth.getUser(),
    getSiteContent(),
    getStoreSettings(),
    getCategories(),
  ]);

  // First name for the menu's greeting — same fields the homepage reads.
  // Empty when signed out, which is the menu's cue to show the YOINK wordmark.
  const fullName: string =
    user?.user_metadata?.full_name || user?.user_metadata?.name || "";
  const firstName = fullName.trim().split(" ")[0];

  return (
    <html
      lang="en"
      className={`${sora.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="grain min-h-full flex flex-col overflow-x-hidden bg-void text-chalk">
        <StoreSettingsProvider
          value={{
            freeShippingThreshold: store.freeShippingThreshold,
            shippingFee: store.shippingFee,
          }}
        >
        <CartProvider>
          <WishlistProvider>
            <AnnouncementBar messages={content.announcements} />
            <Header
              loggedIn={!!user}
              admin={isAdmin(user?.email)}
              categories={categories}
              userName={firstName}
            />
            <main className="flex flex-1 flex-col">{children}</main>
            <Footer blurb={content.footerBlurb} />
            <CartDrawer />
            <WhatsAppButton
              number={store.whatsappNumber}
              message={store.whatsappMessage}
            />
          </WishlistProvider>
        </CartProvider>
        </StoreSettingsProvider>
        {/* Marketing tags load last and only when an ID is configured. */}
        <Analytics pixelId={store.metaPixelId} ga4Id={store.ga4Id} />
      </body>
    </html>
  );
}
