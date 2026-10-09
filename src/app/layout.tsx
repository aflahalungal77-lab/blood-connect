
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blood Connect Meenarkuzhi",
  description:
    "Connect blood donors and emergency blood requests in Meenarkuzhi and nearby areas.",
  applicationName: "Blood Connect Meenarkuzhi",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Blood Connect",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/customer-192.png",
    apple: "/icons/customer-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#b91c1c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}