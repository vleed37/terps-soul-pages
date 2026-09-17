import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminDashboard } from "@/lib/admin-ops.functions";
import { Panel, Stat } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const fetchStats = useServerFn(adminDashboard);
  const { data, isLoading } = useQuery({ queryKey: ["admin-dashboard"], queryFn: () => fetchStats() });

  if (isLoading || !data) {
    return <p className="text-sm text-[color:var(--text-tertiary)]">Loading overview…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Live products" value={data.activeStrains} hint={`${data.archivedStrains} archived`} />
        <Stat label="Awaiting fulfilment" value={data.awaitingFulfilment} hint="Paid, not yet delivered" />
        <Stat label="Reviews to moderate" value={data.pendingReviews} />
        <Stat label="Active stockist accounts" value={data.activeAccounts} hint={`${data.suspendedAccounts} suspended`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Retail orders" value={data.retailOrders} />
        <Stat label="Wholesale orders" value={data.wholesaleOrders} />
        <Stat label="Wholesale products" value={data.wholesaleProducts} hint="Box pricing active" />
        <Stat
          label="Publicly listed stores"
          value={data.publiclyListedAccounts}
          hint={`${data.curatedStockists} curated locations`}
        />
      </div>

      <Panel title="Quick actions">
        <div className="flex flex-wrap gap-3 text-xs">
          <Link to="/admin/orders" className="ghost-link">Process orders →</Link>
          <Link to="/admin/reviews" className="ghost-link">Moderate reviews →</Link>
          <Link to="/admin/strains" className="ghost-link">Manage products →</Link>
          <Link to="/admin/stockists" className="ghost-link">Stockists & accounts →</Link>
        </div>
      </Panel>
    </div>
  );
}
