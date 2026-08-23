"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Meta Pixel + Google Analytics 4.
//
// IDs are pasted into Admin -> Growth & operations. When an ID is blank the
// corresponding script is never injected, so a store with no marketing tags
// ships zero third-party JavaScript.
//
// App Router pages don't cause a browser navigation, so neither tag notices a
// route change on its own — the effect below sends the page view manually.
// ---------------------------------------------------------------------------

function PageViews({ pixelId, ga4Id }: { pixelId: string; ga4Id: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Both tags already fire one page view when they initialise; skip that first
  // run so the landing page isn't counted twice.
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const w = window as unknown as {
      fbq?: (...a: unknown[]) => void;
      gtag?: (...a: unknown[]) => void;
    };
    const qs = searchParams.toString();
    const url = pathname + (qs ? `?${qs}` : "");
    try {
      if (pixelId) w.fbq?.("track", "PageView");
      if (ga4Id) w.gtag?.("event", "page_view", { page_path: url });
    } catch {
      /* a blocked tag must never break navigation */
    }
  }, [pathname, searchParams, pixelId, ga4Id]);

  return null;
}

export function Analytics({ pixelId, ga4Id }: { pixelId: string; ga4Id: string }) {
  if (!pixelId && !ga4Id) return null;

  return (
    <>
      {pixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`}
        </Script>
      )}

      {ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga4Id}');`}
          </Script>
        </>
      )}

      {/* useSearchParams needs a Suspense boundary in the App Router */}
      <Suspense fallback={null}>
        <PageViews pixelId={pixelId} ga4Id={ga4Id} />
      </Suspense>
    </>
  );
}
