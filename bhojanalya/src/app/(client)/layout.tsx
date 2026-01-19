"use client";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* This Navbar will use the client-specific logic we discussed */}
      <main>{children}</main>
    </div>
  );
}