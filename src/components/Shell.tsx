"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "./Sidebar";
import SearchBox from "./SearchBox";

export default function Shell({ children }: { children: React.ReactNode }) {
  const [drawer, setDrawer] = useState(false);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-3 sm:px-5">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-ink lg:hidden"
          >
            ☰
          </button>

          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-positive text-lg shadow-lg shadow-brand/30">
              🎮
            </span>
            <span className="hidden text-lg font-black tracking-tight text-ink sm:block">
              Play<span className="text-positive-deep">pit</span>
            </span>
          </Link>

          <div className="flex flex-1 justify-center">
            <SearchBox />
          </div>

          <Link
            href="/library"
            className="hidden shrink-0 rounded-full bg-canvas px-4 py-2 text-sm font-semibold text-ink ring-1 ring-line hover:ring-brand sm:block"
          >
            My library
          </Link>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 border-r border-line lg:block">
          <Sidebar />
        </aside>

        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setDrawer(false)}
              className="absolute inset-0 bg-black/70"
            />
            <div className="absolute inset-y-0 left-0 w-64 border-r border-line bg-canvas">
              <Sidebar onNavigate={() => setDrawer(false)} />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 px-3 py-6 sm:px-6">{children}</main>
      </div>

      <footer className="border-t border-line px-6 py-8 text-center text-xs text-body">
        <p>Playpit — a demo HTML5 game portal. Built with Next.js.</p>
        <p className="mt-1 text-mute">
          Not affiliated with any existing games site. All titles are originals.
        </p>
      </footer>
    </div>
  );
}
