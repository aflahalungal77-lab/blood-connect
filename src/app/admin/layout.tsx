
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Blood Connect Admin",
  applicationName: "Blood Connect Admin",
  manifest: "/manifest-admin.json",
  description: "Blood Connect administration dashboard.",
  icons: {
    icon: "/icons/admin-192.png",
    apple: "/icons/admin-192.png",
  },
  appleWebApp: {
    capable: true,
    title: "BC Admin",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#7f1d1d",
  width: "device-width",
  initialScale: 1,
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}