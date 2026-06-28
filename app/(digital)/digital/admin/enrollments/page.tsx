import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';

export default async function EnrollmentsPage() {
  await requireAdmin();
  redirect('/digital/admin/system');
}
