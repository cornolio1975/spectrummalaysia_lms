import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NADI2U LMS — Programme & Learning Management System",
    template: "%s | NADI2U LMS",
  },
  description:
    "NADI2U Programme & Learning Management System — Learn. Participate. Perform. Measure.",
  keywords: ["NADI2U", "LMS", "programme management", "eKelas", "Malaysia", "MDEC"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
