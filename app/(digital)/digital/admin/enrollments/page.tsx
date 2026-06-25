import { requireAdmin } from '@/lib/auth';
import { EnrollmentManager } from './EnrollmentManager';

export default async function EnrollmentsPage() {
  await requireAdmin();
  return <EnrollmentManager />;
}
