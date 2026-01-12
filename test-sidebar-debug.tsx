// Quick debug - check what's happening with sidebar
import { useSession } from 'next-auth/react';

// This would show in console what role the user has
export function DebugSidebar() {
  const { data: session } = useSession();
  console.log('Session:', session);
  console.log('User Role:', session?.user?.role);
  console.log('User Role Type:', typeof session?.user?.role);
  return null;
}
