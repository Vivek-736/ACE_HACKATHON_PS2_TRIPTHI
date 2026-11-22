import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, type User, type UserRole } from "@/db/schema";

export type CurrentUser = User;

const ADMIN_EMAILS = [
  "vivek338614@gmail.com",
  process.env.ADMIN_EMAIL,
]
  .filter(Boolean)
  .map((e) => e!.toLowerCase().trim());

// Returns the signed-in user's database row, or null when signed out.
// Identity comes only from Clerk's server-side auth().
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (rows[0]) {
      // Auto-promote designated admin email to admin role
      if (
        rows[0].email &&
        ADMIN_EMAILS.includes(rows[0].email.toLowerCase().trim()) &&
        rows[0].role !== "admin"
      ) {
        const [updated] = await db
          .update(users)
          .set({ role: "admin", updatedAt: new Date() })
          .where(eq(users.id, rows[0].id))
          .returning();
        return updated ?? rows[0];
      }
      return rows[0];
    }

    // Auto-sync immediately from Clerk server data if not yet in database
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.primaryEmailAddress?.emailAddress ?? null;
    const firstName = clerkUser.firstName ?? null;
    const lastName = clerkUser.lastName ?? null;
    const imageUrl = clerkUser.imageUrl ?? null;
    const isAdmin = email ? ADMIN_EMAILS.includes(email.toLowerCase().trim()) : false;

    const inserted = await db
      .insert(users)
      .values({
        clerkId: userId,
        email,
        firstName,
        lastName,
        imageUrl,
        role: isAdmin ? "admin" : "unassigned",
      })
      .onConflictDoUpdate({
        target: users.clerkId,
        set: {
          email,
          firstName,
          lastName,
          imageUrl,
          ...(isAdmin ? { role: "admin" } : {}),
          updatedAt: new Date(),
        },
      })
      .returning();

    return inserted[0] ?? null;
  } catch (error) {
    console.error("Failed to get or sync current user:", error);
    return null;
  }
}

// Redirect-target helper: where a user with this role should go.
export function dashboardPathFor(role: UserRole): string {
  switch (role) {
    case "donor":
      return "/dashboard/donor";
    case "receiver":
      return "/dashboard/receiver";
    case "volunteer":
      return "/dashboard/volunteer";
    case "admin":
      return "/dashboard/admin";
    default:
      return "/onboarding";
  }
}
