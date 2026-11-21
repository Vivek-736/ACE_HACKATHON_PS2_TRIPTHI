import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const clerkUser = await currentUser();
    const email = clerkUser?.primaryEmailAddress?.emailAddress ?? null;
    const firstName = clerkUser?.firstName ?? null;
    const lastName = clerkUser?.lastName ?? null;
    const imageUrl = clerkUser?.imageUrl ?? null;

    // Identity comes only from Clerk server data. `role` is deliberately absent
    // so no client request can set or change a user's role here.
    await db
      .insert(users)
      .values({ clerkId: userId, email, firstName, lastName, imageUrl })
      .onConflictDoUpdate({
        target: users.clerkId,
        set: { email, firstName, lastName, imageUrl, updatedAt: new Date() },
      });

    return NextResponse.json({ ok: true });
  } catch {
    console.error("users sync failed");
    return NextResponse.json({ error: "Could not sync user" }, { status: 500 });
  }
}