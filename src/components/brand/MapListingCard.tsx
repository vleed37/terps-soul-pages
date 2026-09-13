import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { getMyListingStatus, updateMyPublicListing } from "@/lib/wholesale.functions";
import { GoldButton } from "@/components/brand/GoldButton";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Hairline } from "@/components/brand/Hairline";
import { Switch } from "@/components/ui/switch";

const PROVINCES = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape",
  "Free State", "Mpumalanga", "Limpopo", "North West", "Northern Cape",
] as const;

type Account = {
  map_listing_opt_in?: boolean | null;
  public_store_name?: string | null;
  public_address?: string | null;
  public_city?: string | null;
  public_province?: string | null;
  public_phone?: string | null;
} | null | undefined;

const inputCls =
  "mt-1.5 w-full rounded-[4px] border border-[color:var(--border-strong)] bg-[color:var(--bg-base)] px-3 py-2.5 text-sm outline-none focus:border-[color:var(--accent-gold)]";
const labelCls = "meta-xs text-[color:var(--text-tertiary)]";

/** Lets a stockist choose to appear on the public Find Terps map. */
export function MapListingCard({ account }: { account: Account }) {
  const save = useServerFn(updateMyPublicListing);
  const status = useServerFn(getMyListingStatus);
  const qc = useQueryClient();
  const statusQ = useQuery({ queryKey: ["wholesale-listing-status"], queryFn: () => status() });

  const [optIn, setOptIn] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState<string>("Gauteng");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!account) return;
    setOptIn(Boolean(account.map_listing_opt_in));
    setName(account.public_store_name ?? "");
    setAddress(account.public_address ?? "");
    setCity(account.public_city ?? "");
    setProvince(account.public_province ?? "Gauteng");
    setPhone(account.public_phone ?? "");
  }, [account]);

  const mutation = useMutation({
    mutationFn: () =>
      save({
        data: {
          map_listing_opt_in: optIn,
          public_store_name: name,
          public_address: address,
          public_city: city,
          public_province: province,
          public_phone: phone,
        },
      }),
    onSuccess: () => {
      toast.success("Listing preferences saved.");
      void qc.invalidateQueries({ queryKey: ["wholesale-account"] });
      void qc.invalidateQueries({ queryKey: ["wholesale-listing-status"] });
    },
    onError: () => toast.error("Could not save. Please try again."),
  });

  const s = statusQ.data;

  return (
    <div className="rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-8">
      <MetaLabel gold>Find Terps map</MetaLabel>
      <h3 className="mt-3 font-display text-2xl">Show my store publicly</h3>
      <p className="mt-2 max-w-xl text-sm text-[color:var(--text-secondary)]">
        Optional. Your store only appears on the public map once you switch this on, fill in the
        details below, and have completed at least one paid wholesale order. Nothing else from your
        account is ever shown publicly.
      </p>

      <Hairline className="my-6" />

      <label className="flex items-center justify-between gap-4">
        <span className="text-sm">List my store on the public map</span>
        <Switch checked={optIn} onCheckedChange={setOptIn} />
      </label>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelCls}>Store name shown publicly</label>
          <input maxLength={200} value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>Street address</label>
          <input maxLength={200} value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>City</label>
          <input maxLength={120} value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Province</label>
          <select value={province} onChange={(e) => setProvince(e.target.value)} className={inputCls}>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>Public phone number</label>
          <input maxLength={30} value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
        </div>
      </div>

      {s && (
        <ul className="mt-6 space-y-1.5 text-sm text-[color:var(--text-secondary)]">
          <Check ok={s.optedIn} label="Switched on" />
          <Check ok={s.detailsComplete} label="Store name, address and phone filled in" />
          <Check ok={s.hasPaidOrder} label="At least one paid wholesale order" />
          <li className="pt-2 font-display text-base text-[color:var(--text-primary)]">
            {s.listed ? "Your store is showing on the public map." : "Not yet showing publicly."}
          </li>
        </ul>
      )}

      <GoldButton
        type="button"
        className="mt-8"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? "Saving…" : "Save listing details"}
      </GoldButton>
    </div>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className={ok ? "text-[color:var(--accent-gold)]" : "text-[color:var(--text-tertiary)]"}>
        {ok ? "✦" : "·"}
      </span>
      <span>{label}</span>
    </li>
  );
}
