import { useEffect, useState } from "react";
import { MapPin, Phone } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Hairline } from "./Hairline";
import { MetaLabel } from "./MetaLabel";
import { GoldButton } from "./GoldButton";
import { listStockists } from "@/lib/stockists.functions";
import {
  directionsUrl,
  getBrowserLocation,
  getIPLocation,
  haversineDistance,
  PROVINCES,
  PROVINCE_CENTROIDS,
  type LatLng,
} from "@/lib/geo";
import type { Stockist } from "@/lib/types";
import { submitStockistRequest } from "@/lib/forms.functions";

type Ranked = Stockist & { distanceKm: number };

type Phase = "locating" | "results" | "manual" | "empty" | "request";

export function FindClosestStockistModal({
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
  const [phase, setPhase] = useState<Phase>("locating");
  const [results, setResults] = useState<Ranked[]>([]);
  const [, setUserLoc] = useState<LatLng | null>(null);

  useEffect(() => {
    if (!open) return;
    setPhase("locating");
    setResults([]);
    let cancelled = false;

    (async () => {
      let loc = await getBrowserLocation();
      if (!loc) loc = await getIPLocation();
      if (cancelled) return;
      if (!loc) {
        setPhase("manual");
        return;
      }
      setUserLoc(loc);
      await rankAndShow(loc);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, strainId]);

  async function rankAndShow(loc: LatLng) {
    try {
      const all = (await listStockists()) as unknown as Stockist[];
      const carrying = all.filter(
        (s) =>
          s.latitude != null &&
          s.longitude != null &&
          (!s.carried_strain_ids || s.carried_strain_ids.length === 0 || s.carried_strain_ids.includes(strainId)),
      );
      if (carrying.length === 0) {
        setPhase("empty");
        return;
      }
      const ranked: Ranked[] = carrying
        .map((s) => ({
          ...s,
          distanceKm: haversineDistance(loc, { lat: Number(s.latitude), lng: Number(s.longitude) }),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 3);
      setResults(ranked);
      setPhase("results");
    } catch {
      setPhase("empty");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] gap-0 rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-base)] p-6 md:p-8">
        {phase === "locating" && (
          <div className="py-16 text-center">
            <p className="font-display text-2xl italic text-[color:var(--text-secondary)]">
              Finding stockists near you…
            </p>
          </div>
        )}

        {phase === "manual" && <ManualPicker onPick={(p) => { setUserLoc(p); rankAndShow(p); }} />}

        {phase === "empty" && (
          <EmptyState
            onOrderOnline={() => onOpenChange(false)}
            onRequest={() => setPhase("request")}
          />
        )}

        {phase === "request" && (
          <StockistRequestForm onDone={() => onOpenChange(false)} />
        )}

        {phase === "results" && (
          <Results
            strainId={strainId}
            strainName={strainName}
            stockists={results}
            onClose={() => onOpenChange(false)}
            onRequest={() => setPhase("request")}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Results({
  strainId,
  strainName,
  stockists,
  onClose,
  onRequest,
}: {
  strainId: string;
  strainName: string;
  stockists: Ranked[];
  onClose: () => void;
  onRequest: () => void;
}) {
  const farAway = stockists[0]?.distanceKm > 100;
  return (
    <div>
      <MetaLabel className="text-[color:var(--accent-sage,#7d9b76)]">✦ Stockists near you</MetaLabel>
      <h3 className="mt-3 font-display text-[1.875rem] leading-[1.05] text-[color:var(--text-primary)]">
        Pick your spot.
      </h3>
      <p className="mt-3 text-base leading-[1.6] text-[color:var(--text-secondary)]">
        Three closest physical retailers stocking {strainName}. Distance from your location.
      </p>
      {farAway && (
        <p className="mt-4 text-sm text-[color:var(--text-tertiary)]">
          Closest stocking retailer is {Math.round(stockists[0].distanceKm)} km away — you may
          prefer to order online for delivery.
        </p>
      )}
      <Hairline className="my-6" />
      <div className="flex flex-col gap-3">
        {stockists.map((s) => (
          <StockistCard key={s.id} stockist={s} strainId={strainId} />
        ))}
      </div>
      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <button onClick={onClose} className="ghost-link">
          ← Continue browsing
        </button>
        <button
          onClick={onRequest}
          className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)] transition-colors"
        >
          Don't see your area? Request a stockist →
        </button>
      </div>
    </div>
  );
}

function StockistCard({ stockist, strainId }: { stockist: Ranked; strainId: string }) {
  const listingUrl = stockist.product_listing_urls?.[strainId];
  const directions = directionsUrl(Number(stockist.latitude), Number(stockist.longitude));
  return (
    <div className="rounded-[6px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-elevated)] p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="md:max-w-[65%]">
          <p className="font-display text-xl leading-tight text-[color:var(--text-primary)]">
            {stockist.name}
          </p>
          <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
            {[stockist.address, stockist.suburb, stockist.city].filter(Boolean).join(", ")}
          </p>
          <p className="meta-xs mt-2 text-[color:var(--accent-sage,#7d9b76)]">
            {stockist.distanceKm < 1
              ? `${Math.round(stockist.distanceKm * 1000)} M away`
              : `${stockist.distanceKm.toFixed(1)} KM away`}
          </p>
          {stockist.phone && (
            <a
              href={`tel:${stockist.phone}`}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)]"
            >
              <Phone className="h-3 w-3" strokeWidth={1.5} />
              {stockist.phone}
            </a>
          )}
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <a
            href={directions}
            target="_blank"
            rel="noopener noreferrer"
            className="meta-xs whitespace-nowrap text-[color:var(--text-primary)] hover:text-[color:var(--accent-gold)] transition-colors"
          >
            Get directions →
          </a>
          {listingUrl ? (
            <a
              href={listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="meta-xs whitespace-nowrap text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)] transition-colors"
            >
              View online →
            </a>
          ) : stockist.accepts_online_orders && stockist.website ? (
            <a
              href={stockist.website}
              target="_blank"
              rel="noopener noreferrer"
              className="meta-xs whitespace-nowrap text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)] transition-colors"
            >
              Visit store →
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ManualPicker({ onPick }: { onPick: (p: LatLng) => void }) {
  const [province, setProvince] = useState("");
  return (
    <div>
      <MetaLabel className="text-[color:var(--accent-sage,#7d9b76)]">✦ Pick a region</MetaLabel>
      <h3 className="mt-3 font-display text-[1.875rem] leading-[1.05] text-[color:var(--text-primary)]">
        Choose your province.
      </h3>
      <p className="mt-3 text-base leading-[1.6] text-[color:var(--text-secondary)]">
        We couldn't get your location automatically. Pick a province to see the closest stockists.
      </p>
      <Hairline className="my-6" />
      <div className="flex flex-col gap-4">
        <select
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          className="w-full rounded-[4px] border border-[color:var(--border-strong)] bg-[color:var(--bg-base)] px-5 py-4 text-sm outline-none focus:border-[color:var(--accent-gold)]"
        >
          <option value="">Select a province…</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <GoldButton
          disabled={!province}
          onClick={() => province && onPick(PROVINCE_CENTROIDS[province])}
          className="w-full"
        >
          Find stockists
        </GoldButton>
      </div>
    </div>
  );
}

function EmptyState({
  onOrderOnline,
  onRequest,
}: {
  onOrderOnline: () => void;
  onRequest: () => void;
}) {
  return (
    <div className="py-6 text-center">
      <MapPin className="mx-auto h-8 w-8 text-[color:var(--text-tertiary)]" strokeWidth={1.5} />
      <p className="mt-6 font-display text-2xl italic text-[color:var(--text-primary)]">
        We're expanding our retail network.
      </p>
      <p className="mt-3 text-base leading-[1.6] text-[color:var(--text-secondary)]">
        Order online for delivery anywhere in South Africa, or request a stockist near you.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <GoldButton onClick={onOrderOnline} className="w-full">
          Order online
        </GoldButton>
        <button onClick={onRequest} className="ghost-link">
          Request a stockist in your area →
        </button>
      </div>
    </div>
  );
}

function StockistRequestForm({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await submitStockistRequest({
        data: { email, city_or_suburb: city, province, notes },
      });
      setDone(true);
      setTimeout(onDone, 2200);
    } catch {
      setErr("Please check your details and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="py-12 text-center">
        <p className="font-display text-2xl italic text-[color:var(--accent-gold)]">
          ✓ Thanks. We'll consider your area for future expansion.
        </p>
      </div>
    );
  }

  return (
    <div>
      <MetaLabel className="text-[color:var(--accent-sage,#7d9b76)]">✦ Request a stockist</MetaLabel>
      <h3 className="mt-3 font-display text-[1.875rem] leading-[1.05] text-[color:var(--text-primary)]">
        Tell us where to land next.
      </h3>
      <Hairline className="my-6" />
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-[4px] border border-[color:var(--border-strong)] bg-[color:var(--bg-base)] px-5 py-4 text-sm outline-none focus:border-[color:var(--accent-gold)]"
        />
        <input
          type="text"
          required
          placeholder="City or suburb"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-[4px] border border-[color:var(--border-strong)] bg-[color:var(--bg-base)] px-5 py-4 text-sm outline-none focus:border-[color:var(--accent-gold)]"
        />
        <select
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          className="w-full rounded-[4px] border border-[color:var(--border-strong)] bg-[color:var(--bg-base)] px-5 py-4 text-sm outline-none focus:border-[color:var(--accent-gold)]"
        >
          <option value="">Province (optional)…</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Anything else? (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-[4px] border border-[color:var(--border-strong)] bg-[color:var(--bg-base)] px-5 py-4 text-sm outline-none focus:border-[color:var(--accent-gold)]"
        />
        {err && <p className="text-sm text-[color:var(--status-error,#b94a3b)]">{err}</p>}
        <GoldButton type="submit" disabled={busy} className="w-full">
          {busy ? "Sending…" : "Submit request"}
        </GoldButton>
      </form>
    </div>
  );
}