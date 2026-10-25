import type { Metadata, Viewport } from "next";
import "./globals.css";


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fcf103",
};

export const metadata: Metadata = {
  title: "Jenga Teacher — Расписание",
  description: "Расписание и посещаемость преподавателей Jenga",
  applicationName: "Jenga",
  manifest: "/manifest.webmanifest",
  themeColor: "#fcf103",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Jenga",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/jenga-icon.png",
    shortcut: "/jenga-icon.png",
    apple: "/jenga-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

