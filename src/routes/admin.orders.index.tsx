import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListOrders } from "@/lib/admin-ops.functions";
import {
  EmptyState,
  Panel,
  Pill,
  TableShell,
  Td,
  Th,
  dateZa,
  moneyZar,
  paymentTone,
} from "@/components/admin/AdminUI";
import { GoldButton } from "@/components/brand/GoldButton";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/orders/")({
  component: AdminOrders,
});

function AdminOrders() {
  const listOrders = useServerFn(adminListOrders);
  const [type, setType] = useState<"wholesale" | "retail">("wholesale");
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", type, q],
    queryFn: () => listOrders({ data: { type, q: q.trim() || undefined } }),
  });

  const rows = data ?? [];

  return (
    <Panel
      title="Orders"
      description="Payment status is set by the payment provider only. Here you record packing, shipping and delivery."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <GoldButton variant={type === "wholesale" ? "primary" : "secondary"} onClick={() => setType("wholesale")}>
            Wholesale
          </GoldButton>
          <GoldButton variant={type === "retail" ? "primary" : "secondary"} onClick={() => setType("retail")}>
            Retail
          </GoldButton>
          <Input
            value={q}
            placeholder="Search order or email"
            className="w-56"
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      }
    >
      {isLoading ? (
        <p className="text-sm text-[color:var(--text-tertiary)]">Loading orders…</p>
      ) : rows.length === 0 ? (
        <EmptyState text="No orders match this view." />
      ) : (
        <TableShell>
          <thead className="bg-[color:var(--bg-elevated)]">
            <tr>
              <Th>Order</Th>
              <Th>Date</Th>
              <Th>Customer</Th>
              <Th>Total</Th>
              <Th>Payment</Th>
              <Th>Fulfilment</Th>
              <Th />
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border-subtle)]">
            {rows.map((o) => (
              <tr key={o.id}>
                <Td>
                  <Link
                    to="/admin/orders/$type/$id"
                    params={{ type: o.type, id: o.id }}
                    className="font-display hover:text-[color:var(--accent-gold)]"
                  >
                    {o.order_number}
                  </Link>
                </Td>
                <Td>{dateZa(o.created_at)}</Td>
                <Td>{o.who}</Td>
                <Td>{moneyZar(o.total)}</Td>
                <Td>
                  <Pill text={o.payment_status} tone={paymentTone(o.payment_status) as never} />
                </Td>
                <Td>
                  <Pill text={o.fulfilment_status} />
                </Td>
                <Td>
                  <Link
                    to="/admin/orders/$type/$id"
                    params={{ type: o.type, id: o.id }}
                    className="ghost-link text-xs"
                  >
                    Open →
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </Panel>
  );
}
