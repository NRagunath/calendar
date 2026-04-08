import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Glassmorphic Calendar | 12 Beautiful Seasons",
  description:
    "A stunning, unique glassmorphic date range picker component with 12 handcrafted backgrounds, note saving, and intuitive range selection.",
  keywords: ["calendar", "glassmorphism", "next.js"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
