export type AdminRole = 'super_admin' | 'admin' | 'editor';

export function isAdminRole(role: unknown): role is AdminRole {
  return role === 'super_admin' || role === 'admin' || role === 'editor';
}

export function canAccessAdmin(role: unknown, path: string) {
  if (!isAdminRole(role)) return false;
  return role !== 'editor' || path === '/admin/blog' || path.startsWith('/admin/blog/');
}
