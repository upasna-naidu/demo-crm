import type { Metadata } from "next";
import "./globals.css";
import LayoutClient from "@/components/LayoutClient";
import { AuthProvider } from "@/lib/auth-context";
import { initializeDatabase } from "@/lib/init-db";

// Only initialize PostgreSQL if DATABASE_URL is set (production)
if (process.env.DATABASE_URL) {
  initializeDatabase();
}

export const metadata: Metadata = {
  title: "CRM - Sales Management Platform",
  description: "HubSpot-style CRM application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col h-screen">
        <AuthProvider>
          <LayoutClient>{children}</LayoutClient>
        </AuthProvider>
      </body>
    </html>
  );
}
