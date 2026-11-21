import Image from "next/image";

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading Tripti"
      className="flex min-h-[70vh] flex-1 flex-col items-center justify-center px-4 py-16 text-center select-none"
    >
      <div className="relative flex items-center justify-center">
        {/* Subtle Ambient Glow */}
        <div
          className="pointer-events-none absolute -inset-6 rounded-full bg-primary/10 blur-xl motion-reduce:hidden"
          aria-hidden="true"
        />

        {/* Outer Circular Pulse Ring */}
        <div
          className="absolute -inset-3 rounded-full border border-primary/20 animate-[spin_8s_linear_infinite] motion-reduce:animate-none"
          aria-hidden="true"
        />

        {/* Secondary Accent Pulse Ring */}
        <div
          className="absolute -inset-1 rounded-2xl bg-secondary/30 blur-xs animate-pulse motion-reduce:animate-none"
          aria-hidden="true"
        />

        {/* Central Logo Emblem */}
        <div className="relative flex size-16 items-center justify-center rounded-2xl border border-border bg-card p-2 shadow-xs">
          <Image
            src="/logo.svg"
            alt="Tripti Logo"
            width={44}
            height={44}
            priority
          />
        </div>
      </div>

      {/* Brand Identity & Status Messaging */}
      <div className="mt-6 flex flex-col items-center gap-1.5">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Tripti
        </h2>
        <p className="text-xs text-muted-foreground motion-reduce:animate-none animate-pulse">
          Connecting surplus food with communities in need&hellip;
        </p>
      </div>

      {/* Progress Track */}
      <div
        className="mt-5 h-1 w-40 overflow-hidden rounded-full bg-muted"
        aria-hidden="true"
      >
        <div className="h-full w-1/2 rounded-full bg-primary/80 animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite] motion-reduce:animate-none" />
      </div>

      <span className="sr-only">Loading Tripti application...</span>
    </div>
  );
}