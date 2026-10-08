import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Lets the sign-in page send someone whose email isn't registered yet straight
// to sign-up (the auth API answers "invalid credentials" either way).
export const isEmailRegistered = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ email: z.string().email().max(320) }).parse(data))
  .handler(async ({ data }) => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
    if (!url || !key) throw new Error("Missing Supabase configuration");

    const email = data.email.trim().toLowerCase();
    // The admin users endpoint's `filter` does a partial match; check for an exact one.
    const res = await fetch(`${url}/auth/v1/admin/users?per_page=50&filter=${encodeURIComponent(email)}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(`auth admin ${res.status}`);
    const body = (await res.json()) as { users?: { email?: string | null }[] };
    return { registered: (body.users ?? []).some((u) => u.email?.toLowerCase() === email) };
  });
