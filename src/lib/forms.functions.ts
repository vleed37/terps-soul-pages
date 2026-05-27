import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const emailSchema = z.string().trim().toLowerCase().email().max(255);

export const subscribeEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ email: emailSchema, source: z.string().max(50).optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("subscribers")
      .insert({ email: data.email, source: data.source ?? "homepage" });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });

export const requestRestock = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ email: emailSchema, strain_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("restock_notifications")
      .insert({ email: data.email, strain_id: data.strain_id });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitWholesaleInquiry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      full_name: z.string().trim().min(1).max(120),
      business_name: z.string().trim().max(200).optional().or(z.literal("")),
      email: emailSchema,
      phone: z.string().trim().max(30).optional().or(z.literal("")),
      message: z.string().trim().max(2000).optional().or(z.literal("")),
      location: z.string().trim().max(200).optional().or(z.literal("")),
      business_type: z.string().trim().max(60).optional().or(z.literal("")),
      volume: z.string().trim().max(60).optional().or(z.literal("")),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const extras: string[] = [];
    if (data.location) extras.push(`Location: ${data.location}`);
    if (data.business_type) extras.push(`Business type: ${data.business_type}`);
    if (data.volume) extras.push(`Monthly volume: ${data.volume}`);
    const composedMessage = [extras.join(" · "), data.message].filter(Boolean).join("\n\n");
    const { error } = await supabaseAdmin.from("wholesale_inquiries").insert({
      full_name: data.full_name,
      business_name: data.business_name || null,
      email: data.email,
      phone: data.phone || null,
      message: composedMessage || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitStockistRequest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      email: emailSchema,
      city_or_suburb: z.string().trim().min(1).max(200),
      province: z.string().trim().max(60).optional().or(z.literal("")),
      notes: z.string().trim().max(1000).optional().or(z.literal("")),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("stockist_requests").insert({
      email: data.email,
      city_or_suburb: data.city_or_suburb,
      province: data.province || null,
      notes: data.notes || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
