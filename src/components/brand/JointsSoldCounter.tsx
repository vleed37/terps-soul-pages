import { useQuery } from "@tanstack/react-query";
import { getJointsSoldTotal, JOINTS_SOLD_REFRESH_MS } from "@/lib/stats.functions";

/**
 * "Terps joints sold" — units from verified paid orders only, plus the
 * owner-configured baseline. Hidden until the first paid unit exists, so the
 * component never displays an invented figure. No animation, no simulated
 * increments; the value refreshes on a fixed interval.
 */
export function JointsSoldCounter({ className = "" }: { className?: string }) {
  const { data } = useQuery({
    queryKey: ["joints-sold"],
    queryFn: () => getJointsSoldTotal(),
    staleTime: JOINTS_SOLD_REFRESH_MS,
    refetchInterval: JOINTS_SOLD_REFRESH_MS,
    refetchOnWindowFocus: false,
  });

  const total = data?.total ?? 0;
  if (total <= 0) return null;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-tertiary)] ${className}`}
    >
      <span className="text-[color:var(--accent-gold)]">
        {total.toLocaleString("en-ZA")}
      </span>
      <span>Terps joints sold</span>
    </span>
  );
}
