import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { ExternalAdminRedirect } from "@/components/admin/ExternalAdminRedirect";
import { AdminShell } from "@/components/admin/AdminShell";
import { Syne, DM_Sans } from "next/font/google";

const externalAdmin = process.env.NEXT_PUBLIC_ADMIN_URL;

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["400", "500", "600"],
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (externalAdmin) {
    return <ExternalAdminRedirect base={externalAdmin} />;
  }
  return (
    <div className={`${syne.variable} ${dmSans.variable} font-[family-name:var(--font-dm)]`}>
      <AdminAuthGate>
        <AdminShell>{children}</AdminShell>
      </AdminAuthGate>
    </div>
  );
}
