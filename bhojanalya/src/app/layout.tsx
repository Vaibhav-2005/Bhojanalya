import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar"; // The Smart Navbar
import "./globals.css";
import SessionGuard from "@/components/SessionGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bhojanalya",
  description: "Restaurant Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionGuard />
        <Navbar />
        {children}
      </body>
    </html>
  );
}