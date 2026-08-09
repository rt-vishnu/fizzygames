import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-xl place-items-center py-24 text-center">
      <p className="text-6xl">🕹️</p>
      <h1 className="mt-4 text-3xl font-black tracking-tight text-ink">
        Game over
      </h1>
      <p className="mt-2 text-body">
        That page isn&apos;t in the cabinet. Try the arcade floor instead.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-brand px-6 py-3 text-sm font-bold text-ink shadow-lg shadow-brand/30 hover:brightness-110"
      >
        Back to home
      </Link>
    </div>
  );
}
