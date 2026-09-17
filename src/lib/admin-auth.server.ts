import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * The single authoritative admin check.
 *
 * Authorization is decided by the database `user_roles` table through the
 * security-definer `has_role` function — never by a client-supplied or
 * client-readable role string in the JWT metadata. Every admin read and write
 * calls this before touching data.
 *
 * The first admin is assigned by inserting a row into `public.user_roles`
 * (`role = 'admin'`) for that user id. After that, existing admins can grant
 * the role to a colleague from Admin → Settings.
 */
export async function requireAdmin(userId: string | undefined): Promise<string> {
  if (!userId) throw new Response("Unauthorized", { status: 401 });
  const { data, error } = await supabaseAdmin.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) {
    console.error("admin role check failed", error.message);
    throw new Response("Forbidden", { status: 403 });
  }
  if (data !== true) throw new Response("Forbidden", { status: 403 });
  return userId;
}
