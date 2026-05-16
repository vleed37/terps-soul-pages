import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AgeGate } from "@/components/layout/AgeGate";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-display italic text-5xl md:text-7xl">This drop has finished.</p>
      <p className="mt-6 text-[color:var(--text-secondary)]">The page you're looking for doesn't exist.</p>
      <Link to="/shop" className="ghost-link mt-10">Return to the collection</Link>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  console.error(error);
  return (
    <div className="flex min-h-screen items-center justify-center px-4 text-center">
      <div>
        <p className="font-display text-3xl">Something went sideways.</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="ghost-link mt-6">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Terps — Premium Infused Pre-Rolls. Flavour First." },
      { name: "description", content: "South African–bred, hand-infused premium pre-rolls. Live rosin. Lab verified. Flavour first." },
      { property: "og:title", content: "Terps — Flavour First." },
      { property: "og:description", content: "South African–bred premium infused pre-rolls." },
      { property: "og:type", content: "website" },
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
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
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
      <Header />
      <main className="relative z-0 pt-[88px]">
        <Outlet />
      </main>
      <Footer />
      <AgeGate />
      <Toaster theme="dark" position="bottom-center" />
    </QueryClientProvider>
  );
}
