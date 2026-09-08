import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { X } from "lucide-react";
import { GoldButton } from "@/components/brand/GoldButton";
import { Hairline } from "@/components/brand/Hairline";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { useWholesaleAccount } from "@/hooks/useWholesaleAccount";

const SEEN_KEY = "terps:visitor-prompt-seen";
const AGE_KEY = "terps_age_verified";
const CONSENT_KEY = "terps:cookie-consent";

/** Which desktop treatment to show. Flip to "side" to preview the slide-in panel. */
export type VisitorPromptVariant = "center" | "side";
export const VISITOR_PROMPT_VARIANT: VisitorPromptVariant = "center";

function ready(): boolean {
  try {
    const age = Number(window.localStorage.getItem(AGE_KEY));
    if (!age) return false;
    const consent = window.localStorage.getItem(CONSENT_KEY);
    if (!consent) return false;
    return Boolean(JSON.parse(consent)?.accepted);
  } catch {
    return false;
  }
}

export function VisitorPrompt({
  variant = VISITOR_PROMPT_VARIANT,
}: {
  variant?: VisitorPromptVariant;
}) {
  const loc = useLocation();
  const { account } = useWholesaleAccount();
  const [open, setOpen] = useState(false);

  const onHome = loc.pathname === "/";
  const forced =
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("visitorPrompt") === "1";

  useEffect(() => {
    if (!onHome || account) return;
    if (forced) {
      setOpen(true);
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      if (window.localStorage.getItem(SEEN_KEY)) return;
    } catch {
      return;
    }
    const poll = setInterval(() => {
      if (!ready()) return;
      clearInterval(poll);
      timer = setTimeout(() => setOpen(true), 2000);
    }, 500);
    return () => {
      clearInterval(poll);
      if (timer) clearTimeout(timer);
    };
  }, [onHome, account, forced]);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem(SEEN_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  const card = (
    <div className="relative rounded-t-2xl border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-7 shadow-[0_-8px_40px_-16px_rgba(0,0,0,0.35)] sm:rounded-2xl md:p-9">
      <button
        type="button"
        aria-label="Close"
        onClick={dismiss}
        className="absolute right-4 top-4 text-[color:var(--text-tertiary)] hover:text-[color:var(--accent-gold)]"
      >
        <X strokeWidth={1.5} className="h-5 w-5" />
      </button>
      <MetaLabel gold>✦ Welcome to Terps</MetaLabel>
      <h2 className="mt-4 font-display text-3xl leading-tight md:text-4xl">First time here?</h2>
      <Hairline w="80px" className="my-5" />
      <p className="text-base leading-relaxed text-[color:var(--text-secondary)]">
        Sign up to become a stockist, or continue shopping.
      </p>
      <div className="mt-7 flex flex-col gap-3">
        <Link to="/wholesale" onClick={dismiss}>
          <GoldButton className="w-full">Sign up for wholesale pricing</GoldButton>
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="font-display text-sm italic text-[color:var(--text-secondary)] hover:text-[color:var(--accent-gold)]"
        >
          Continue shopping
        </button>
      </div>
    </div>
  );

  if (variant === "side") {
    return (
      <div
        role="dialog"
        aria-label="Welcome to Terps"
        className="fixed inset-x-0 bottom-0 z-[70] px-0 sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-1/2 sm:w-[380px] sm:-translate-y-1/2 md:bottom-32 md:top-auto md:translate-y-0"
      >
        {card}
      </div>
    );
  }

  return (
    <div role="dialog" aria-label="Welcome to Terps" className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        className="absolute inset-0 bg-[color:var(--bg-rich)]/60 backdrop-blur-sm"
      />
      <div className="relative w-full sm:max-w-md">{card}</div>
    </div>
  );
}
