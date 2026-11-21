"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

export function UserSyncProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const syncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    if (syncedUserId.current === user.id) return;

    syncedUserId.current = user.id;

    fetch("/api/users/sync", { method: "POST" })
      .then((response) => {
        if (!response.ok) {
          syncedUserId.current = null;
          console.error("User sync failed with status", response.status);
        }
      })
      .catch(() => {
        syncedUserId.current = null;
        console.error("User sync request failed");
      });
  }, [isLoaded, isSignedIn, user]);

  return <>{children}</>;
}