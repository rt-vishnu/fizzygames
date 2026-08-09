"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/games";

const PRIMARY = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/popular", label: "Popular", icon: "🔥" },
  { href: "/new", label: "New", icon: "✨" },
  { href: "/library", label: "My library", icon: "💾" },
  { href: "/profile", label: "Profile", icon: "🏆" },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const link = (href: string, active: boolean) =>
    [
      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition",
      active
        ? "bg-brand/15 text-ink ring-1 ring-brand/40"
        : "text-body hover:bg-canvas hover:text-ink",
    ].join(" ");

  return (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto p-3">
      <ul className="space-y-1">
        {PRIMARY.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={link(item.href, pathname === item.href)}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div>
        <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-body">
          Categories
        </p>
        <ul className="space-y-1">
          {CATEGORIES.map((cat) => {
            const href = `/category/${cat.slug}`;
            return (
              <li key={cat.slug}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  className={link(href, pathname === href)}
                >
                  <span aria-hidden="true">{cat.emoji}</span>
                  {cat.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-auto px-3 text-xs leading-relaxed text-mute">
        Playpit is a demo game portal. Every title here is an original built for
        the project.
      </p>
    </nav>
  );
}
