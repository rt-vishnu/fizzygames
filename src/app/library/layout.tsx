import type { Metadata } from "next";

// The library page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "My library",
  description: "Games you starred or recently played on this device.",
};

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
