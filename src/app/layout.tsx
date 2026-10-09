import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blood Connect Meenarkuzhi | Find Blood. Save Lives.",
  description: "Connect blood donors and emergency blood requests in Meenarkuzhi and nearby areas.",
  metadataBase: new URL("https://example.com")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}