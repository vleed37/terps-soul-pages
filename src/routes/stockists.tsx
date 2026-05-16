import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { MapPin, Phone } from "lucide-react";
import { listStockists } from "@/lib/stockists.functions";
import { listStrains } from "@/lib/strains.functions";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Hairline } from "@/components/brand/Hairline";
import { ScrollReveal } from "@/components/brand/ScrollReveal";
import { GoldButton } from "@/components/brand/GoldButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import type { Stockist, Strain } from "@/lib/types";

const StockistMap = lazy(() =>
  import("@/components/brand/StockistMap").then((m) => ({ default: m.StockistMap })),
);

const stockistsQuery = queryOptions({
  queryKey: ["stockists", "all"],
  queryFn: () => listStockists(),
});
const strainsQuery = queryOptions({
  queryKey: ["strains", "all"],
  queryFn: () => listStrains(),
});

export const Route = createFileRoute("/stockists")({
  head: () => ({
    meta: [
      { title: "Stockists — Terps" },
      { name: "description", content: "Find Terps at premium retailers across South Africa. Locate the nearest stockist." },
      { property: "og:title", content: "Stockists — Terps" },
      { property: "og:description", content: "Stocked at premium retailers across South Africa. Find one near you." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(stockistsQuery),
      context.queryClient.ensureQueryData(strainsQuery),
    ]);
  },
  component: StockistsPage,
});

function haversineKm(a: [number, number], b: [number, number]) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

function isOpenNow(hours: Stockist["hours_json"]) {
  if (!hours) return false;
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const now = new Date();
  const day = days[now.getDay()];
  const h = hours[day];
  if (!h?.open || !h?.close) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = h.open.split(":").map(Number);
  const [ch, cm] = h.close.split(":").map(Number);
  return cur >= oh * 60 + om && cur <= ch * 60 + cm;
}

function StockistsPage() {
  const { data: stockistsData } = useSuspenseQuery(stockistsQuery);
  const { data: strainsData } = useSuspenseQuery(strainsQuery);
  const stockists = (stockistsData ?? []) as unknown as Stockist[];
  const strains = (strainsData ?? []) as unknown as Strain[];

  const [query, setQuery] = useState("");
  const [province, setProvince] = useState<string>("all");
  const [strainFilter, setStrainFilter] = useState<string>("all");
  const [openOnly, setOpenOnly] = useState(false);
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
  const [focused, setFocused] = useState<Stockist | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const provinces = useMemo(
    () => Array.from(new Set(stockists.map((s) => s.province))).sort(),
    [stockists],
  );
  const strainById = useMemo(() => new Map(strains.map((s) => [s.id, s] as const)), [strains]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = stockists.filter((s) => {
      if (q) {
        const hay = `${s.name} ${s.address} ${s.suburb ?? ""} ${s.city} ${s.postal_code ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (province !== "all" && s.province !== province) return false;
      if (strainFilter !== "all" && !(s.carried_strain_ids ?? []).includes(strainFilter))
        return false;
      if (openOnly && !isOpenNow(s.hours_json)) return false;
      return true;
    });
    if (userLoc) {
      list = [...list].sort((a, b) => {
        if (a.latitude == null || b.latitude == null) return 0;
        return (
          haversineKm(userLoc, [a.latitude!, a.longitude!]) -
          haversineKm(userLoc, [b.latitude!, b.longitude!])
        );
      });
    }
    return list;
  }, [stockists, query, province, strainFilter, openOnly, userLoc]);

  const requestLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]),
      () => {},
    );
  };

  return (
    <div className="px-6 py-20 md:px-12 md:py-28">
      {/* HERO */}
      <ScrollReveal className="mx-auto max-w-3xl text-center">
        <MetaLabel gold>✦ Find Terps</MetaLabel>
        <h1 className="mt-5 font-display text-5xl leading-[1.05] md:text-[5.5rem]">
          Where to <em className="text-[color:var(--accent-gold)]">find us.</em>
        </h1>
        <p className="mx-auto mt-6 max-w-[600px] text-base text-[color:var(--text-secondary)] md:text-lg">
          Stocked at premium retailers across South Africa. Each one personally selected.
        </p>
        <div className="mx-auto mt-10 flex max-w-md items-center gap-3 rounded-[4px] border border-[color:var(--border-strong)] bg-[color:var(--bg-surface)] px-4 py-3 focus-within:border-[color:var(--accent-gold)]">
          <MapPin size={16} strokeWidth={1.5} className="text-[color:var(--accent-gold)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your suburb or city"
            className="border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
          />
        </div>
        <button
          onClick={requestLocation}
          className="mt-4 font-display text-sm italic text-[color:var(--accent-gold)] hover:underline"
        >
          Use my location →
        </button>
      </ScrollReveal>

      {/* MAIN LAYOUT */}
      <div className="mx-auto mt-16 max-w-[1500px]">
        {/* Filter bar */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Select value={province} onValueChange={setProvince}>
            <SelectTrigger className="w-[200px] border-[color:var(--border-subtle)] bg-transparent text-xs uppercase tracking-[0.15em]">
              <SelectValue placeholder="Province" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All provinces</SelectItem>
              {provinces.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={strainFilter} onValueChange={setStrainFilter}>
            <SelectTrigger className="w-[220px] border-[color:var(--border-subtle)] bg-transparent text-xs uppercase tracking-[0.15em]">
              <SelectValue placeholder="Strain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any strain</SelectItem>
              {strains.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="flex items-center gap-3 text-xs uppercase tracking-[0.15em] text-[color:var(--text-secondary)]">
            Open now
            <Switch checked={openOnly} onCheckedChange={setOpenOnly} />
          </label>
          <span className="ml-auto text-xs text-[color:var(--text-tertiary)] uppercase tracking-[0.15em]">
            {filtered.length} {filtered.length === 1 ? "stockist" : "stockists"}
          </span>
          <button
            type="button"
            onClick={() => setShowMap((v) => !v)}
            className="ghost-link md:hidden"
          >
            {showMap ? "Hide map" : "Show map"} →
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          {/* LIST */}
          <div className="md:col-span-3">
            <div className="rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)]">
              {filtered.length === 0 ? (
                <p className="px-6 py-20 text-center font-display italic text-2xl text-[color:var(--text-secondary)]">
                  No stockists match that search.
                </p>
              ) : (
                filtered.map((s, i) => {
                  const distance =
                    userLoc && s.latitude != null && s.longitude != null
                      ? haversineKm(userLoc, [s.latitude, s.longitude])
                      : null;
                  const open = isOpenNow(s.hours_json);
                  const carried = (s.carried_strain_ids ?? [])
                    .map((id) => strainById.get(id))
                    .filter(Boolean) as Strain[];
                  const isFocused = focused?.id === s.id;
                  return (
                    <article
                      id={`stockist-${s.id}`}
                      key={s.id}
                      className={`p-6 transition-colors ${i > 0 ? "border-t border-[color:var(--accent-gold)]/15" : ""} ${isFocused ? "bg-[color:var(--accent-gold-muted)]" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-display text-2xl">{s.name}</h3>
                        {open && (
                          <span className="rounded-full border border-[color:var(--accent-gold)] px-2.5 py-1 text-[0.625rem] uppercase tracking-[0.15em] text-[color:var(--accent-gold)]">
                            Open now
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-base text-[color:var(--text-secondary)]">
                        {s.address}
                        {s.suburb ? `, ${s.suburb}` : ""}, {s.city}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs uppercase tracking-[0.15em] text-[color:var(--text-tertiary)]">
                        {distance !== null && <span>{distance.toFixed(1)} km away</span>}
                        <span>{s.province}</span>
                      </div>
                      {s.phone && (
                        <a
                          href={`tel:${s.phone}`}
                          className="mt-3 inline-flex items-center gap-2 text-sm text-[color:var(--text-primary)] hover:text-[color:var(--accent-gold)]"
                        >
                          <Phone size={13} strokeWidth={1.5} />
                          {s.phone}
                        </a>
                      )}
                      {carried.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {carried.map((c) => (
                            <span
                              key={c.id}
                              className="inline-block rounded-full border border-[color:var(--border-strong)] px-3 py-1 text-xs text-[color:var(--text-secondary)]"
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${s.address}, ${s.city}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-display text-sm italic text-[color:var(--accent-gold)] hover:underline"
                        >
                          Get directions →
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setFocused(s);
                            setShowMap(true);
                          }}
                          className="ghost-link"
                        >
                          View on map
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>

          {/* MAP */}
          <div className={`md:col-span-2 ${showMap ? "block" : "hidden md:block"}`}>
            <div className="sticky top-24 h-[50vh] overflow-hidden rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] md:h-[70vh]">
              {mounted ? (
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center text-sm text-[color:var(--text-tertiary)]">
                    Loading map…
                  </div>
                }
              >
                <StockistMap
                  stockists={filtered}
                  focused={focused}
                  onMarkerClick={(s) => {
                    setFocused(s);
                    const el = document.getElementById(`stockist-${s.id}`);
                    el?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                />
              </Suspense>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[color:var(--text-tertiary)]">
                  Loading map…
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM CTA */}
      <section className="relative mx-auto mt-32 overflow-hidden rounded-lg">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.15), transparent 60%), var(--bg-rich)",
          }}
        />
        <div className="relative px-6 py-20 text-center md:py-28">
          <ScrollReveal>
            <MetaLabel gold>✦ For retailers</MetaLabel>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">
              Stock Terps in your store.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base text-[color:var(--text-secondary)] md:text-lg">
              Interested in carrying Terps as a retailer? We work with curated dispensaries across SA.
            </p>
            <Link to="/wholesale" className="mt-10 inline-block">
              <GoldButton>Become a stockist</GoldButton>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
