import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, SELECTABLE_ROLES } from "@/db/schema";
import { dashboardPathFor } from "@/lib/auth/current-user";

// admin and unassigned are not in SELECTABLE_ROLES, so validation rejects them.
const onboardingSchema = z.object({
  role: z.enum(SELECTABLE_ROLES),
  organisationName: z.string().trim().max(120).optional().or(z.literal("")),
  displayName: z.string().trim().max(80).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { role, organisationName, displayName } = parsed.data;
  try {
    // Update only the caller's own row, and only while it is still unassigned.
    // This blocks role switching through this route and races between two submissions.
    const updated = await db
      .update(users)
      .set({
        role,
        organisationName: organisationName || null,
        displayName: displayName || null,
        onboardedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(users.clerkId, userId), eq(users.role, "unassigned")))
      .returning({ role: users.role });

    if (updated.length === 0) {
      return NextResponse.json({ error: "Role already set or profile not synced" }, { status: 409 });
    }
    return NextResponse.json({ role, redirectTo: dashboardPathFor(role) });
  } catch {
    console.error("onboarding role update failed");
    return NextResponse.json({ error: "Could not save role" }, { status: 500 });
  }
}
