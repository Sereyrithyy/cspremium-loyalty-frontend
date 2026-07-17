import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center">
      <p className="font-display text-6xl text-gold-dim">404</p>
      <h1 className="mt-4 font-display text-2xl text-ivory">We couldn&apos;t find that page.</h1>
      <p className="mt-2 max-w-sm text-[14px] text-mist">
        Check the membership link, or head back and search by phone number.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-ink hover:bg-gold-bright"
      >
        Back to home
      </Link>
    </main>
  );
}
