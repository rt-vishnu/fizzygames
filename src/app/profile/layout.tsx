import type { Metadata } from "next";

// The profile page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Player profile",
  description: "Your scores, achievements and time played on this device.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
