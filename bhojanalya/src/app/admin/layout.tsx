import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bhojanalya Admin",
  description: "Super Admin Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans text-slate-900">
      <main className="relative z-0">
        {children}
      </main>
    </div>
  );
}