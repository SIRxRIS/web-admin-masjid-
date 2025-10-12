// src/components/auth/RoleGuard.tsx
"use client";
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole, hasRole, hasAnyRole } from '@/lib/utils/roles';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Lock } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
  showLoading?: boolean;
}

export default function RoleGuard({
  children,
  requiredRole,
  requiredRoles,
  fallback,
  showLoading = true,
}: RoleGuardProps) {
  const { userProfile, loading } = useAuth();

  // Show loading state
  if (loading && showLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          Memuat...
        </span>
      </div>
    );
  }

  // Check if user is authenticated
  if (!userProfile) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Akses Terbatas
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Silakan login terlebih dahulu untuk mengakses halaman ini.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // Check role permissions
  const hasPermission = requiredRole
    ? hasRole(userProfile.role, requiredRole)
    : requiredRoles
    ? hasAnyRole(userProfile.role, requiredRoles)
    : true;

  if (!hasPermission) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Akses Ditolak
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Anda tidak memiliki izin untuk mengakses halaman ini.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                Role Anda: {userProfile.role || 'Tidak ada role'}
                <br />
                Role yang diperlukan: {requiredRole || requiredRoles?.join(', ') || 'Tidak ditentukan'}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  return <>{children}</>;
}