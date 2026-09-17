import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { adminGetOrder, adminUpdateFulfilment } from "@/lib/admin-ops.functions";
import {
  Field,
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

export const Route = createFileRoute("/admin/orders/$type/$id")({
  component: AdminOrderDetail,
});

const RETAIL_STAGES = ["pending", "fulfilling", "shipped", "delivered", "cancelled"] as const;
const WHOLESALE_STAGES = ["pending", "preparing", "shipped", "delivered", "cancelled"] as const;

function AdminOrderDetail() {
  const { type, id } = Route.useParams();
  const orderType = type === "retail" ? "retail" : "wholesale";
  const qc = useQueryClient();
  const getOrder = useServerFn(adminGetOrder);
  const update = useServerFn(adminUpdateFulfilment);
  const [tracking, setTracking] = useState<string | null>(null);
  const [trackingUrl, setTrackingUrl] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-order", orderType, id],
    queryFn: () => getOrder({ data: { type: orderType, id } }),
  });

  const mut = useMutation({
    mutationFn: (stage: string) =>
      update({
        data: {
          type: orderType,
          id,
          status: stage as never,
          tracking_number: tracking,
          ...(orderType === "retail" ? { tracking_url: trackingUrl } : {}),
        },
      }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Order updated.");
      qc.invalidateQueries({ queryKey: ["admin-order", orderType, id] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-sm text-[color:var(--text-tertiary)]">Loading order…</p>;
  if (!data) return <p className="text-sm text-[color:var(--text-tertiary)]">Order not found.</p>;

  const order = data.order as Record<string, any>;
  const stages = orderType === "retail" ? RETAIL_STAGES : WHOLESALE_STAGES;
  const currentStage = orderType === "retail" ? order.status : order.fulfillment_status;
  const total = orderType === "retail" ? order.total : order.total_zar;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl">{order.order_number}</h2>
          <p className="mt-1 text-xs text-[color:var(--text-tertiary)]">
            {orderType === "retail" ? "Retail order" : "Wholesale order"} · placed {dateZa(order.created_at)}
          </p>
        </div>
        <Link to="/admin/orders" className="ghost-link text-xs">
          ← All orders
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Summary">
          <dl className="space-y-3 text-sm">
            <Row label="Total" value={moneyZar(total)} />
            <Row
              label="Payment"
              value={<Pill text={order.payment_status} tone={paymentTone(order.payment_status) as never} />}
            />
            <Row label="Fulfilment" value={<Pill text={currentStage} />} />
            {orderType === "wholesale" && (
              <>
                <Row label="Subtotal" value={moneyZar(order.subtotal_zar)} />
                <Row label="VAT" value={moneyZar(order.vat_zar)} />
                <Row label="Shipping" value={moneyZar(order.shipping_zar)} />
              </>
            )}
            {orderType === "retail" && (
              <>
                <Row label="Subtotal" value={moneyZar(order.subtotal)} />
                <Row label="Delivery" value={moneyZar(order.delivery_fee)} />
                <Row label="Discount" value={moneyZar(order.discount)} />
              </>
            )}
            <Row label="Paid at" value={dateZa(order.paid_at ?? order.payment_completed_at)} />
            <Row label="Shipped" value={dateZa(order.shipped_at)} />
            <Row label="Delivered" value={dateZa(order.fulfilled_at)} />
          </dl>
        </Panel>

        <Panel title={orderType === "wholesale" ? "Stockist" : "Customer"}>
          {orderType === "wholesale" && data.account ? (
            <dl className="space-y-3 text-sm">
              <Row label="Business" value={data.account.business_name} />
              <Row label="Trading as" value={data.account.trading_as ?? "—"} />
              <Row label="Contact" value={data.account.primary_contact_name} />
              <Row label="Email" value={data.account.primary_contact_email} />
              <Row label="Phone" value={data.account.primary_contact_phone} />
              <Row label="Account status" value={<Pill text={data.account.approval_status} />} />
            </dl>
          ) : (
            <dl className="space-y-3 text-sm">
              <Row label="Name" value={order.guest_name ?? data.customer?.full_name ?? "—"} />
              <Row label="Email" value={order.guest_email ?? "—"} />
              <Row label="Phone" value={order.guest_phone ?? data.customer?.phone ?? "—"} />
              <Row label="Method" value={order.delivery_method ?? "—"} />
            </dl>
          )}
          <div className="mt-5 rounded-[6px] border border-[color:var(--border-subtle)] p-4 text-xs text-[color:var(--text-secondary)]">
            <p className="meta-xs text-[color:var(--text-tertiary)]">Delivery address</p>
            <pre className="mt-2 whitespace-pre-wrap font-body">
              {formatAddress(orderType === "retail" ? order.delivery_address : order.shipping_address)}
            </pre>
          </div>
        </Panel>

        <Panel title="Fulfilment" description="Recording progress here does not change payment or stock.">
          <div className="space-y-4">
            <Field label="Tracking number">
              <Input
                defaultValue={order.tracking_number ?? ""}
                placeholder="Courier waybill"
                onChange={(e) => setTracking(e.target.value)}
              />
            </Field>
            {orderType === "retail" && (
              <Field label="Tracking link">
                <Input
                  defaultValue={order.tracking_url ?? ""}
                  placeholder="https://…"
                  onChange={(e) => setTrackingUrl(e.target.value)}
                />
              </Field>
            )}
            <div className="flex flex-wrap gap-2">
              {stages.map((s) => (
                <GoldButton
                  key={s}
                  variant={s === currentStage ? "primary" : "secondary"}
                  disabled={mut.isPending}
                  onClick={() => mut.mutate(s)}
                >
                  {s}
                </GoldButton>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Order lines" description="Saved at the time of purchase — never rewritten.">
        <TableShell>
          <thead className="bg-[color:var(--bg-elevated)]">
            <tr>
              <Th>Item</Th>
              <Th>Detail</Th>
              <Th>Qty</Th>
              <Th>Line total</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border-subtle)]">
            {(data.items as any[]).map((i) => (
              <tr key={i.id}>
                <Td>
                  <span className="font-display">{i.strain_name}</span>
                  {i.item_type === "mixed_box" && (
                    <span className="ml-2">
                      <Pill text="mixed box" tone="warn" />
                    </span>
                  )}
                </Td>
                <Td>
                  {i.item_type === "mixed_box" && Array.isArray(i.box_composition) ? (
                    <ul className="space-y-1 text-xs text-[color:var(--text-secondary)]">
                      {i.box_composition.map((c: any, idx: number) => (
                        <li key={idx}>
                          {c.units ?? c.quantity} × {c.strain_name ?? c.name}
                        </li>
                      ))}
                    </ul>
                  ) : orderType === "wholesale" ? (
                    <span className="text-xs text-[color:var(--text-tertiary)]">
                      {i.box_quantity_per_unit} units per box · {i.product_line ?? "—"}
                    </span>
                  ) : (
                    <span className="text-xs text-[color:var(--text-tertiary)]">{i.strain_slug}</span>
                  )}
                </Td>
                <Td>
                  {orderType === "wholesale"
                    ? `${i.boxes_ordered} box(es) · ${i.total_units} units`
                    : i.quantity}
                </Td>
                <Td>{moneyZar(orderType === "wholesale" ? i.line_total_zar : i.line_total)}</Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </Panel>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="meta-xs text-[color:var(--text-tertiary)]">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

function formatAddress(a: unknown) {
  if (!a || typeof a !== "object") return "—";
  return Object.entries(a as Record<string, unknown>)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k.replace(/_/g, " ")}: ${String(v)}`)
    .join("\n");
}
