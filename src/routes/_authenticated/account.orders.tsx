import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Hairline } from "@/components/brand/Hairline";
import { getMyOrders } from "@/lib/account.functions";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_authenticated/account/orders")({
  head: () => ({ meta: [{ title: "Terps — Orders" }] }),
  component: OrdersPage,
});

const STATUSES = ["all", "pending", "paid", "shipped", "delivered", "cancelled"] as const;

function OrdersPage() {
  const fetchOrders = useServerFn(getMyOrders);
  const { data: orders = [] } = useQuery({ queryKey: ["my-orders"], queryFn: () => fetchOrders() });
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const filtered = useMemo(() => {
    let arr = [...orders];
    if (status !== "all") arr = arr.filter((o) => o.status === status);
    arr.sort((a, b) => {
      const ta = new Date(a.created_at!).getTime();
      const tb = new Date(b.created_at!).getTime();
      return sort === "newest" ? tb - ta : ta - tb;
    });
    return arr;
  }, [orders, status, sort]);

  return (
    <div>
      <MetaLabel gold>ORDER HISTORY</MetaLabel>
      <h1 className="mt-3 font-display text-4xl md:text-5xl">Your orders.</h1>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="meta-xs rounded-[4px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] px-3 py-2">
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.toUpperCase()}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="meta-xs rounded-[4px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] px-3 py-2">
          <option value="newest">NEWEST</option>
          <option value="oldest">OLDEST</option>
        </select>
      </div>

      <div className="mt-8 space-y-4">
        {filtered.length === 0 && (
          <p className="text-[color:var(--text-secondary)]">No orders yet.</p>
        )}
        {filtered.map((o, idx) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.06 }}
            className="rounded-[12px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-2xl">#{o.order_number}</p>
                <p className="meta-xs mt-1 text-[color:var(--text-tertiary)]">
                  {new Date(o.created_at!).toLocaleDateString()}
                </p>
              </div>
              <span
                className="meta-xs rounded-full px-3 py-1"
                style={{
                  color: o.status === "cancelled" ? "var(--text-tertiary)" : "var(--accent-gold)",
                  border: "1px solid var(--accent-gold-muted)",
                }}
              >
                {o.status?.toUpperCase()}
              </span>
            </div>
            <p className="mt-3 text-[color:var(--text-secondary)]">
              {o.items.length} item{o.items.length === 1 ? "" : "s"} · R{Number(o.total).toFixed(0)}
            </p>
            <Hairline className="my-5" />
            <div className="flex justify-end">
              <Link
                to="/account/orders/$orderNumber"
                params={{ orderNumber: o.order_number }}
                className="font-display italic text-sm text-[color:var(--accent-gold)] hover:underline"
              >
                VIEW ORDER DETAILS →
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
