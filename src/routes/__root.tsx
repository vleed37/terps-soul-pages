import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { syncCartOnSignIn } from "@/lib/cart-sync";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AgeGate } from "@/components/layout/AgeGate";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { BrandNotFound } from "@/components/layout/BrandNotFound";
import { BrandError } from "@/components/layout/BrandError";
import { StockistContextBanner } from "@/components/brand/StockistContextBanner";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#5C6650" },
      { title: "Terps — Premium Infused Pre-Rolls. Flavour First." },
      { name: "description", content: "South African–bred, hand-infused premium pre-rolls. Live rosin. Lab verified. Flavour first." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Terps" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Manrope:wght@400;500;600;700&family=Sansita+Swashed:wght@900&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/icon-512.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: BrandNotFound,
  errorComponent: BrandError,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      {/* Top status band — thin dark batch indicator */}
      <div className="tone-dark fixed inset-x-0 top-0 z-50 flex h-[28px] items-center justify-center border-b border-[color:var(--border-on-dark)] px-6">
        <p className="meta-xs flex items-center gap-2 text-[color:var(--accent-gold)]">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--accent-gold)]" />
          Premium Infused · Batch 04 Active
        </p>
      </div>
      <Header />
      <StockistContextBanner />
      <main className="relative z-0 pt-[116px]">
        <Outlet />
      </main>
      <Footer />
      <AgeGate />
      <CookieConsent />
      <Toaster theme="light" position="bottom-center" />
    </QueryClientProvider>
  );
}

function AuthSync() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setTimeout(() => { void syncCartOnSignIn(); }, 0);
      }
      router.invalidate();
      qc.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, qc]);
  return null;
}
