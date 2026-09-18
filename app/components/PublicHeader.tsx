import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/recipes", label: "Recipes" },
  { href: "/favorites", label: "Favorites" },
];

type PublicHeaderProps = {
  active?: "home" | "recipes" | "favorites";
};

export default function PublicHeader({ active = "home" }: PublicHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:min-h-[72px] sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 text-xl font-extrabold tracking-tight sm:text-2xl">
          Recipe<span className="text-orange-600">CMS</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {links.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-semibold transition hover:text-orange-600 ${active === (["home", "recipes", "favorites"] as const)[index] ? "text-orange-600" : "text-gray-600"}`}
              aria-current={active === (["home", "recipes", "favorites"] as const)[index] ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/#categories" className="font-semibold text-gray-600 transition hover:text-orange-600">
            Categories
          </Link>
          <Link href="/#blog" className="font-semibold text-gray-600 transition hover:text-orange-600">
            Newsletter
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="hidden rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 sm:inline-flex sm:px-5"
          >
            Admin
          </Link>

          <details className="relative md:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm">
              <span className="sr-only">Open menu</span>
              <span aria-hidden="true" className="text-lg leading-none">☰</span>
            </summary>

            <nav aria-label="Mobile navigation" className="absolute right-0 top-12 z-[60] w-56 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="block rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                  {link.label}
                </Link>
              ))}
              <Link href="/#categories" className="block rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                Categories
              </Link>
              <Link href="/#blog" className="block rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                Newsletter
              </Link>
              <Link href="/admin" className="mt-1 block rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700">
                Admin
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
