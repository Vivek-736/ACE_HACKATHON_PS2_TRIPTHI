"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { useUser, UserButton } from "@clerk/nextjs";
import { buttonVariants } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Impact", href: "#impact" },
] as const;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          className={`flex items-center gap-2 rounded-md text-lg font-semibold text-foreground ${FOCUS_RING}`}
        >
          <Image src="/logo.svg" alt="" width={36} height={36} />
          <span>Tripti</span>
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none ${FOCUS_RING}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Auth Navigation */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoaded && isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className={`${buttonVariants({ variant: "default", size: "sm" })} ${FOCUS_RING} gap-1.5`}
              >
                <LayoutDashboard className="size-4" />
                <span>Console</span>
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "size-8 border border-border",
                  },
                }}
              />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className={`${buttonVariants({ variant: "ghost" })} ${FOCUS_RING}`}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className={`${buttonVariants({ variant: "default" })} ${FOCUS_RING}`}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((prev) => !prev)}
          className={`inline-flex size-10 items-center justify-center rounded-md text-foreground hover:bg-muted md:hidden ${FOCUS_RING}`}
        >
          {open ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile Drawer */}
      <div
        id="mobile-menu"
        className={`overflow-hidden border-t border-border bg-background transition-all duration-200 ease-in-out motion-reduce:transition-none md:hidden ${
          open ? "max-h-96 opacity-100" : "invisible max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground ${FOCUS_RING}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            {isLoaded && isSignedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className={`${buttonVariants({ variant: "default" })} w-full ${FOCUS_RING} justify-center gap-1.5`}
              >
                <LayoutDashboard className="size-4" />
                <span>Go to Console</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setOpen(false)}
                  className={`${buttonVariants({ variant: "ghost" })} w-full ${FOCUS_RING}`}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setOpen(false)}
                  className={`${buttonVariants({ variant: "default" })} w-full ${FOCUS_RING}`}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
