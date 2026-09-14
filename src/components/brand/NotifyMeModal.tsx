import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { GoldButton } from "./GoldButton";
import { Hairline } from "./Hairline";
import { MetaLabel } from "./MetaLabel";
import { requestRestock } from "@/lib/forms.functions";
import { subscribeEmail } from "@/lib/forms.functions";

export function NotifyMeModal({
  open,
  onOpenChange,
  strainId,
  strainName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  strainId: string;
  strainName: string;
}) {
  const [email, setEmail] = useState("");
  const [subscribeDrops, setSubscribeDrops] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await requestRestock({ data: { email, strain_id: strainId } });
      if (subscribeDrops) {
        try {
          await subscribeEmail({ data: { email, source: "restock-modal" } });
        } catch {
          /* non-blocking */
        }
      }
      setDone(true);
      setTimeout(() => onOpenChange(false), 2000);
    } catch {
      setErr("Please enter a valid email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="tone-dark max-w-[480px] gap-0 rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-dark)] p-10"
      >
        {done ? (
          <div className="py-10 text-center">
            <p className="font-display text-3xl italic text-[color:var(--accent-gold)]">
              ✓ You're on the list.
            </p>
          </div>
        ) : (
          <div>
            <MetaLabel gold>✦ Notify me</MetaLabel>
            <h3 className="mt-4 font-display text-[2rem] leading-[1.05] text-[color:var(--text-primary)]">
              Be first to know.
            </h3>
            <p className="mt-4 text-base leading-[1.65] text-[color:var(--text-secondary)]">
              We'll email you the moment {strainName} is back in stock.
            </p>
            <Hairline className="my-6" />
            <form onSubmit={submit} className="flex flex-col gap-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-[4px] border border-[color:var(--border-strong)] bg-[color:var(--bg-base)] px-5 py-4 text-sm outline-none focus:border-[color:var(--accent-gold)]"
              />
              <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-[color:var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={subscribeDrops}
                  onChange={(e) => setSubscribeDrops(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[color:var(--accent-gold)]"
                />
                Also send me drop announcements for new strains.
              </label>
              {err && <p className="text-sm text-[color:var(--status-error)]">{err}</p>}
              <GoldButton type="submit" variant="cream" disabled={busy} className="w-full">
                {busy ? "Sending…" : "Notify me"}
              </GoldButton>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="ghost-link mx-auto mt-2"
              >
                ← Continue browsing
              </button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}