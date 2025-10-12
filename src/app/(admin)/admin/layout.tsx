// src/app/(admin)/admin/layout.tsx

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}

