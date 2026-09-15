import { useQuery } from "@tanstack/react-query";
import { getStrainReviews } from "@/lib/reviews.functions";
import { StarRating } from "@/components/brand/StarRating";

/**
 * Compact average + count shown beside the product name. Renders nothing until
 * approved reviews exist — no fabricated zero-star rating.
 */
export function InlineRating({ strainId }: { strainId: string }) {
  const { data } = useQuery({
    queryKey: ["reviews", strainId],
    queryFn: () => getStrainReviews({ data: { strainId } }),
  });
  const summary = data?.summary;
  if (!summary || summary.count === 0 || summary.average === null) return null;

  return (
    <a href="#reviews-heading" className="mt-3 inline-flex items-center gap-2 text-sm">
      <StarRating value={summary.average} />
      <span className="font-semibold">{summary.average.toFixed(1)}</span>
      <span className="text-[color:var(--text-tertiary)]">
        ({summary.count} review{summary.count === 1 ? "" : "s"})
      </span>
    </a>
  );
}
