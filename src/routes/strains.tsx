import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/strains")({
  head: () => ({ meta: [{ title: "Terps — Coming soon" }] }),
  component: ComingSoon,
});

function ComingSoon() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <Logo height={64} />
      <p className="meta-xs mt-10 text-gold">Coming soon</p>
      <h1 className="mt-6 font-display text-5xl leading-tight md:text-6xl">This page is being prepared.</h1>
      <p className="mt-6 text-[color:var(--text-secondary)]">
        We're finishing this section. Check back shortly, or return to the home page.
      </p>
      <Link to="/" className="ghost-link mt-10">Back home</Link>
    </div>
  );
}
