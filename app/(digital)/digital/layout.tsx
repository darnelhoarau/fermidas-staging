// Digital products layout
// Note: Header and Footer are provided by the root layout
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export default async function DigitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the current pathname to exclude auth routes
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  // Exclude auth routes from authentication check
  const isAuthRoute = pathname.startsWith('/digital/auth/');

  // Skip auth check entirely for auth routes to prevent loops
  if (isAuthRoute) {
    return <>{children}</>;
  }

  const session = await auth();

  if (!session?.user) {
    const callbackUrl = pathname
      ? encodeURIComponent(pathname)
      : encodeURIComponent('/digital');
    redirect(`/digital/auth/signin?callbackUrl=${callbackUrl}`);
  }

  return <>{children}</>;
}
