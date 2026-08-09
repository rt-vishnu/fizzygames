import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Shell from "@/components/Shell";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Playpit — free browser games",
    template: "%s · Playpit",
  },
  description:
    "A portal of free HTML5 games you can play instantly in your browser. No downloads, no accounts.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} antialiased`}>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
