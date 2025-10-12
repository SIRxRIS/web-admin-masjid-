import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/dashboard-admin";

export const metadata: Metadata = {
  title: "Admin Panel - Masjid Jawahiruzzarqa",
  description: "Panel administrasi untuk konfigurasi sistem, whitelist email, dan monitoring kesehatan aplikasi Masjid Jawahiruzzarqa.",
  keywords: ["admin", "panel", "konfigurasi", "keamanan", "whitelist", "jawahiruzzarqa"],
};

const AdminPage = () => {
  return <AdminDashboard />;
};

export default AdminPage;

