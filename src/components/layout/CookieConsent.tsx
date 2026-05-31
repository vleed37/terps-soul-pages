import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { GoldButton } from "@/components/brand/GoldButton";
import { Hairline } from "@/components/brand/Hairline";

const STORAGE_KEY = "terps:cookie-consent";

interface ConsentState {
  accepted: boolean;
  essential: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

function writeConsent(state: ConsentState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / privacy mode */
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (!existing?.accepted) {
      // Delay to avoid layout shift on first paint
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
    if (existing) {
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    }
  }, []);

  function persist(opts: { analytics: boolean; marketing: boolean }) {
    writeConsent({
      accepted: true,
      essential: true,
      analytics: opts.analytics,
      marketing: opts.marketing,
      timestamp: new Date().toISOString(),
    });
    setVisible(false);
    setPrefsOpen(false);
  }

  if (!visible) return null;

  return (
    <>
      <div
        role="region"
        aria-label="Cookies and data"
        className="fixed inset-x-0 bottom-0 z-[55] border-t border-[color:var(--accent-gold)]/30 bg-[color:var(--bg-surface)] shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)]"
      >
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:gap-8 md:px-8 md:py-4">
          <div className="flex items-start gap-3">
            <Cookie
              className="mt-0.5 hidden h-4 w-4 shrink-0 text-[color:var(--accent-gold)] md:block"
              strokeWidth={1.5}
              aria-hidden
            />
            <div className="text-sm leading-relaxed text-[color:var(--text-primary)]">
              <p className="meta-xs mb-1 text-[color:var(--accent-gold)]">✦ Cookies & Data</p>
              <p className="text-[color:var(--text-secondary)]">
                Terps uses cookies for essential site functions and to improve your experience. By
                continuing, you agree to our use of cookies as described in our{" "}
                <Link to="/legal/privacy" className="ghost-link">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:ml-auto md:shrink-0">
            <button
              type="button"
              onClick={() => setPrefsOpen(true)}
              className="font-display text-sm italic text-[color:var(--text-secondary)] hover:text-[color:var(--accent-gold)]"
            >
              Manage preferences
            </button>
            <GoldButton onClick={() => persist({ analytics: true, marketing: false })}>
              Accept
            </GoldButton>
          </div>
        </div>
      </div>

      <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
        <DialogContent className="bg-[color:var(--bg-surface)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Cookie preferences</DialogTitle>
            <DialogDescription className="text-[color:var(--text-secondary)]">
              Choose what data Terps may collect on this device.
            </DialogDescription>
          </DialogHeader>
          <Hairline className="my-2" />
          <div className="space-y-5">
            <Pref
              title="Essential"
              body="Required for the site to work — cart, sign-in, age verification."
              value={true}
              disabled
            />
            <Pref
              title="Analytics"
              body="Helps us understand how the site is used. Off by default."
              value={analytics}
              onChange={setAnalytics}
            />
            <Pref
              title="Marketing"
              body="Used to measure campaigns and tailor messaging. Off by default."
              value={marketing}
              onChange={setMarketing}
            />
          </div>
          <Hairline className="my-2" />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => persist({ analytics: false, marketing: false })}
              className="font-display text-sm italic text-[color:var(--text-secondary)] hover:text-[color:var(--accent-gold)]"
            >
              Reject all
            </button>
            <GoldButton onClick={() => persist({ analytics, marketing })}>Save</GoldButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Pref({
  title,
  body,
  value,
  disabled,
  onChange,
}: {
  title: string;
  body: string;
  value: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="font-display text-lg">{title}</p>
        <p className="mt-1 text-sm text-[color:var(--text-secondary)]">{body}</p>
      </div>
      <Switch checked={value} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}