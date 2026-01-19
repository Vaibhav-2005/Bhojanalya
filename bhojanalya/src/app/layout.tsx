"use client";

import "../app/globals.css";
import Navbar from "../components/layout/Navbar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide navbar on Landing and Auth pages
  const hideNavbar = pathname === "/" || pathname === "/auth";

  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        {!hideNavbar && <Navbar />}
        <main>{children}</main>
      </body>
    </html>
  );
}