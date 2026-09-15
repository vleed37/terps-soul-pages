import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { GoldButton } from "@/components/brand/GoldButton";
import { StarRating, StarPicker } from "@/components/brand/StarRating";
import {
  getStrainReviews,
  getMyReviewState,
  submitReview,
  reportReview,
} from "@/lib/reviews.functions";

const MIN_LEN = 20;
const MAX_LEN = 2000;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ReviewsSection({
  strainId,
  strainName,
}: {
  strainId: string;
  strainName: string;
}) {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const loc = useLocation();
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const reviewsQ = useQuery({
    queryKey: ["reviews", strainId],
    queryFn: () => getStrainReviews({ data: { strainId } }),
  });

  const mineQ = useQuery({
    queryKey: ["my-review", strainId, user?.id ?? "anon"],
    queryFn: () => getMyReviewState({ data: { strainId } }),
    enabled: !!user,
  });

  const submit = useMutation({
    mutationFn: () => submitReview({ data: { strainId, rating, body } }),
    onSuccess: () => {
      toast.success("Thanks — your review is with us for moderation.");
      setFormOpen(false);
      qc.invalidateQueries({ queryKey: ["my-review", strainId] });
      qc.invalidateQueries({ queryKey: ["reviews", strainId] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not save your review."),
  });

  const report = useMutation({
    mutationFn: (reviewId: string) =>
      reportReview({ data: { reviewId, reason: "Reported from product page" } }),
    onSuccess: () => toast.success("Thanks — we'll take a look at that review."),
    onError: () => toast.error("Could not send that report."),
  });

  const reviews = reviewsQ.data?.reviews ?? [];
  const summary = reviewsQ.data?.summary;
  const count = summary?.count ?? 0;
  const average = summary?.average ?? null;
  const mine = mineQ.data?.review ?? null;
  const canReview = mineQ.data?.canReview === true;

  const bodyLen = body.trim().length;
  const valid = rating >= 1 && rating <= 5 && bodyLen >= MIN_LEN && bodyLen <= MAX_LEN;

  return (
    <section className="mt-20" aria-labelledby="reviews-heading">
      <MetaLabel gold>✦ Customer Reviews</MetaLabel>
      <h2 id="reviews-heading" className="mt-3 font-display text-3xl md:text-4xl">
        What customers say.
      </h2>

      {/* Aggregate — approved reviews only */}
      {count > 0 && average !== null ? (
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
          <div>
            <p className="font-display text-5xl leading-none">{average.toFixed(1)}</p>
            <StarRating value={average} size={16} className="mt-3" />
            <p className="mt-2 text-sm text-[color:var(--text-tertiary)]">
              Based on {count} review{count === 1 ? "" : "s"}
            </p>
          </div>
          <div className="space-y-2">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const n = summary!.breakdown[String(star) as "1"] ?? 0;
              const pct = count > 0 ? Math.round((n / count) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-8 tabular-nums text-[color:var(--text-tertiary)]">
                    {star} ★
                  </span>
                  <span className="h-[6px] flex-1 overflow-hidden rounded-full bg-[color:var(--bg-elevated)]">
                    <span
                      className="block h-full rounded-full bg-[color:var(--accent-gold)]"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="w-8 tabular-nums text-right text-[color:var(--text-tertiary)]">
                    {n}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="mt-6 text-base text-[color:var(--text-secondary)]">No reviews yet.</p>
      )}

      {/* Write / sign-in */}
      <div className="mt-10">
        {loading ? null : !user ? (
          <p className="text-sm text-[color:var(--text-secondary)]">
            <Link
              to="/account/login"
              search={{ redirect: loc.pathname }}
              className="ghost-link"
            >
              Sign in
            </Link>{" "}
            to review {strainName}. Reviews are open to customers who have bought it.
          </p>
        ) : canReview ? (
          <div>
            {mine && !formOpen ? (
              <div className="rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <StarRating value={mine.rating} />
                  <span className="meta-xs text-[color:var(--text-tertiary)]">
                    {mine.status === "approved"
                      ? "Published"
                      : mine.status === "rejected"
                        ? "Not published"
                        : "Awaiting moderation"}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-[1.8] text-[color:var(--text-secondary)]">
                  {mine.body}
                </p>
                <button
                  type="button"
                  className="ghost-link mt-4"
                  onClick={() => {
                    setRating(mine.rating);
                    setBody(mine.body);
                    setFormOpen(true);
                  }}
                >
                  Edit your review
                </button>
                <p className="mt-2 text-xs text-[color:var(--text-tertiary)]">
                  Edited reviews go back for moderation before they appear.
                </p>
              </div>
            ) : formOpen ? (
              <form
                className="rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (valid) submit.mutate();
                }}
              >
                <MetaLabel>Your rating</MetaLabel>
                <div className="mt-2">
                  <StarPicker value={rating} onChange={setRating} />
                </div>
                <label htmlFor="review-body" className="meta-xs mt-6 block">
                  Your review
                </label>
                <textarea
                  id="review-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value.slice(0, MAX_LEN))}
                  rows={5}
                  maxLength={MAX_LEN}
                  className="mt-2 w-full rounded-[4px] border border-[color:var(--border-strong)] bg-transparent p-3 text-sm"
                  placeholder={`How was ${strainName}? Flavour, burn, the experience.`}
                />
                <p className="mt-1 text-xs text-[color:var(--text-tertiary)]">
                  {bodyLen}/{MAX_LEN} — at least {MIN_LEN} characters.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <GoldButton type="submit" disabled={!valid || submit.isPending}>
                    {submit.isPending ? "Sending…" : "Submit review"}
                  </GoldButton>
                  <button
                    type="button"
                    className="ghost-link"
                    onClick={() => setFormOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <GoldButton
                onClick={() => {
                  setRating(0);
                  setBody("");
                  setFormOpen(true);
                }}
              >
                Write a review
              </GoldButton>
            )}
          </div>
        ) : (
          <p className="text-sm text-[color:var(--text-secondary)]">
            Reviews are open to customers who have bought this product on a completed order.
          </p>
        )}
      </div>

      {/* List */}
      {reviews.length > 0 && (
        <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-body text-sm font-semibold">{r.display_name}</p>
                <span className="meta-xs text-[color:var(--accent-sage,#7d9b76)]">
                  Verified purchase
                </span>
              </div>
              <StarRating value={r.rating} className="mt-2" />
              <p className="mt-3 whitespace-pre-line text-sm leading-[1.8] text-[color:var(--text-secondary)]">
                {r.body}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-[color:var(--text-tertiary)]">
                  {formatDate(r.submitted_at)}
                </span>
                <button
                  type="button"
                  onClick={() => report.mutate(r.id)}
                  disabled={report.isPending}
                  className="text-xs text-[color:var(--text-tertiary)] underline hover:text-[color:var(--text-primary)]"
                >
                  Report
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
