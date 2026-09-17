import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { adminListReviews, adminModerateReview } from "@/lib/admin-ops.functions";
import { EmptyState, Panel, Pill, dateZa } from "@/components/admin/AdminUI";
import { GoldButton } from "@/components/brand/GoldButton";
import { StarRating } from "@/components/brand/StarRating";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews;
});

function AdminReviews() {
  return null;
}
