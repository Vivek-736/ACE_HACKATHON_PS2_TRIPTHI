import Image from "next/image";
import Link from "next/link";

const links = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Impact", href: "/#impact" },
  { label: "Sign In", href: "/sign-in" },
  { label: "Get Started", href: "/sign-up" },
];

const linkClassName =
  "rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

async function getCopyrightYear(): Promise<number> {
  "use cache";
  return new Date().getFullYear();
}

export default async function Footer() {
  const year = await getCopyrightYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="" width={28} height={28} />
              <span className="text-base font-semibold text-foreground">Tripthi</span>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              Connecting surplus food with the communities that need.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={linkClassName}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          © {year} Tripthi. All rights reserved.
        </p>
      </div>
    </footer>
  );
}