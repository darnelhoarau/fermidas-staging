import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { Container } from '@/components/Container';
import { SystemAdminClient } from './SystemAdminClient';

export default async function SystemAdminPage() {
  await requireAdmin();
  const users = await db.listUsers();
  return (
    <section className='bg-gradient-to-br from-mint to-white pt-12 pb-24 md:pb-28'>
      <Container>
        <div className='mb-12'>
          <h1 className='font-display mb-4 text-2xl font-bold text-brand md:text-4xl'>
            System Admin
          </h1>
          <p className='text-lg text-leaf-700'>
            Manage users, endpoint access, payment settings, and enrollments.
          </p>
        </div>
        <SystemAdminClient users={users} />
      </Container>
    </section>
  );
}