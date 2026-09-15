import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SpectrumMY LMS — Programme & Learning Management System",
    template: "%s | SpectrumMY LMS",
  },
  description:
    "SpectrumMY Programme & Learning Management System — Learn. Participate. Perform. Measure.",
  keywords: ["SpectrumMY", "LMS", "programme management", "eKelas", "Malaysia", "MDEC"],
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
