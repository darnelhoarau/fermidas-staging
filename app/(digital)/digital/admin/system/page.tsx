import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { SystemAdminClient } from './SystemAdminClient';

export default async function SystemAdminPage() {
  await requireAdmin();
  const users = await db.listUsers();
  return <SystemAdminClient users={users} />;
}
