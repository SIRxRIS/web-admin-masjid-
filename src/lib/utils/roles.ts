// src/lib/utils/roles.ts
import type { Role } from '@prisma/client';

export type UserRole = Role;

export const ROLES = {
  ADMIN: 'ADMIN' as UserRole,
  KETUA: 'KETUA' as UserRole,
  SEKRETARIS: 'SEKRETARIS' as UserRole,
  BENDAHARA: 'BENDAHARA' as UserRole,
  HUMAS_MEDIA: 'HUMAS_MEDIA' as UserRole,
  REMAS_ADMIN: 'REMAS_ADMIN' as UserRole,
  MAJLIS_TALIM_ADMIN: 'MAJLIS_TALIM_ADMIN' as UserRole,
} as const;

/**
 * Check if user has a specific role
 */
export function hasRole(userRole: UserRole | null | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  return userRole === requiredRole;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(userRole: UserRole | null | undefined, requiredRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: UserRole | null | undefined): boolean {
  return hasRole(userRole, ROLES.ADMIN);
}

/**
 * Check if user has management permissions (admin or specific management roles)
 */
export function hasManagementAccess(userRole: UserRole | null | undefined): boolean {
  return hasAnyRole(userRole, [
    ROLES.ADMIN,
    ROLES.KETUA,
    ROLES.SEKRETARIS,
    ROLES.BENDAHARA,
    ROLES.HUMAS_MEDIA,
    ROLES.REMAS_ADMIN,
    ROLES.MAJLIS_TALIM_ADMIN,
  ]);
}

/**
 * Check if user has financial access
 */
export function hasFinancialAccess(userRole: UserRole | null | undefined): boolean {
  return hasAnyRole(userRole, [
    ROLES.ADMIN,
    ROLES.BENDAHARA,
    ROLES.KETUA,
  ]);
}

/**
 * Check if user has content management access
 */
export function hasContentAccess(userRole: UserRole | null | undefined): boolean {
  return hasAnyRole(userRole, [
    ROLES.ADMIN,
    ROLES.HUMAS_MEDIA,
    ROLES.SEKRETARIS,
  ]);
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<string, string> = {
    ADMIN: 'Administrator',
    KETUA: 'Ketua Masjid',
    SEKRETARIS: 'Sekretaris',
    BENDAHARA: 'Bendahara',
    PENGURUS: 'Pengurus',
    HUMAS_MEDIA: 'Humas & Media',
    REMAS_ADMIN: 'Admin Remas',
    MAJLIS_TALIM_ADMIN: 'Admin Majlis Ta\'lim',
  };
  
  return roleNames[role] || role;
}