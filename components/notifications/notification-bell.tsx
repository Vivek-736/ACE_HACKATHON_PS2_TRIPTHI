"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle2,
  Clock,
  PackageCheck,
  ShoppingBag,
  Truck,
  AlertTriangle,
  Sparkles,
  Check,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Notification } from "@/db/schema/notifications";

function getNotificationIcon(type: string) {
  switch (type) {
    case "listing_claimed":
      return <PackageCheck className="size-4 text-primary" />;
    case "order_assigned":
      return <Truck className="size-4 text-primary" />;
    case "food_collected":
      return <ShoppingBag className="size-4 text-secondary-foreground" />;
    case "food_delivered":
      return <CheckCircle2 className="size-4 text-primary" />;
    case "listing_expired":
      return <Clock className="size-4 text-destructive" />;
    case "volunteer_reminder":
      return <AlertTriangle className="size-4 text-amber-600" />;
    case "urgent_surplus":
      return <Sparkles className="size-4 text-amber-500" />;
    default:
      return <Bell className="size-4 text-muted-foreground" />;
  }
}

function formatRelativeTime(dateString: string | Date): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "Just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function NotificationBell() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = React.useState(false);

  // Poll notifications every 12 seconds
  const { data, isLoading } = useQuery<{
    notifications: Notification[];
    unreadCount: number;
  }>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications?limit=25");
      if (!res.ok) {
        throw new Error("Failed to load notifications");
      }
      const json = await res.json();
      return json.data || { notifications: [], unreadCount: 0 };
    },
    refetchInterval: 12000,
    refetchOnWindowFocus: true,
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Mutation: Mark single notification read
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mutation: Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/notifications/mark-all-read", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleNotificationClick = (item: Notification) => {
    if (!item.read) {
      markReadMutation.mutate(item.id);
    }
    if (item.link) {
      setIsOpen(false);
      router.push(item.link);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        type="button"
        aria-label={`Notifications (${unreadCount} unread)`}
        className="relative inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-xs animate-in zoom-in-75">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 shadow-lg border border-border bg-card"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">
              Notifications
            </span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="px-1.5 py-0 text-[11px]">
                {unreadCount} unread
              </Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Check className="mr-1 size-3" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Content list */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
          {isLoading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-muted-foreground">
              <Spinner className="size-5 mb-2 text-primary" />
              Loading notifications&hellip;
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-2">
                <Bell className="size-5 opacity-40" />
              </div>
              <p className="text-xs font-medium text-foreground">
                No notifications yet
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Updates on claims, dispatches, and deliveries will appear here.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`flex items-start gap-3 p-3.5 text-left transition-colors cursor-pointer hover:bg-muted/40 ${
                  !item.read ? "bg-primary/5 font-medium" : "opacity-85"
                }`}
              >
                <div className="mt-0.5 shrink-0 rounded-full bg-background p-1.5 border border-border shadow-2xs">
                  {getNotificationIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {item.title}
                    </p>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                {!item.read && (
                  <span
                    className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                    title="Unread"
                  />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-2 bg-muted/20 text-center">
          <p className="text-[10px] text-muted-foreground">
            Auto-refreshes in real-time • Near-live dispatch alerts
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
