import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import * as db from '@/lib/db';
import { isPaymentEnabled } from '@/lib/mpgs';
import { isPaymentExempt } from '@/lib/payment-config';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Reports | Compliance Watch | Fermidas',
  description: 'Access your Compliance Watch daily reports',
};

export default async function ReportsListPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/digital/auth/signin');
  }

  const product = await db.findProductBySlug('compliance-watch');
  if (!product) {
    return <div>Product not found</div>;
  }

  const paymentEnabled = isPaymentEnabled();
  const isAdmin = isPaymentExempt(session.user);

  // Admins and free-mode: see all published reports without entitlement check
  if (!paymentEnabled || isAdmin) {
    const reports = await db.findAllPublishedReports(product.id);

    return (
      <ReportsLayout
        isAdmin={isAdmin}
        accessLabel={isAdmin ? 'Full access (admin)' : 'Free access'}
        reports={reports}
      />
    );
  }

  // Paid mode: check subscription and purchases
  const [subscription, purchases] = await Promise.all([
    db.findActiveSubscription(session.user.id, product.id),
    db.findUserPurchases(session.user.id),
  ]);

  const hasAccess = !!subscription || purchases.length > 0;

  if (!hasAccess) {
    return (
      <div className='container py-24'>
        <div className='card mx-auto max-w-2xl p-8 text-center'>
          <h1 className='mb-4 text-2xl font-bold text-brand'>
            No Active Subscription
          </h1>
          <p className='mb-6 text-leaf-700'>
            You don&apos;t have an active subscription or any purchased reports.
          </p>
          <Link href='/digital/compliance-watch' className='btn btn-primary'>
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  // Subscribers see all reports; one-off buyers see only their purchased dates
  let reports = await db.findAllPublishedReports(product.id);

  if (!subscription) {
    const purchasedDates = new Set(
      purchases.map((p: { report_date: string }) =>
        new Date(p.report_date).toDateString(),
      ),
    );
    reports = reports.filter((r) =>
      purchasedDates.has(new Date(r.date).toDateString()),
    );
  }

  const accessLabel = subscription
    ? `Active subscription until ${new Date(subscription.current_period_end).toLocaleDateString()}`
    : `${purchases.length} purchased report${purchases.length !== 1 ? 's' : ''}`;

  return (
    <ReportsLayout
      isAdmin={false}
      accessLabel={accessLabel}
      reports={reports}
    />
  );
}

function ReportsLayout({
  isAdmin,
  accessLabel,
  reports,
}: {
  isAdmin: boolean;
  accessLabel: string;
  reports: { id: string; date: Date; total_items: number }[];
}) {
  return (
    <section className='bg-gradient-to-br from-mint to-white pb-24 pt-12 md:pb-28'>
      <div className='container'>
        <div className='mb-12'>
          <h1 className='font-display mb-4 text-2xl font-bold text-brand md:text-4xl'>
            Compliance Watch Reports
          </h1>
          <p className='text-lg text-leaf-700'>{accessLabel}</p>
        </div>

        {reports.length === 0 ? (
          <div className='card p-8 text-center'>
            <p className='text-leaf-700'>
              No reports available yet. Reports are generated daily at 06:00
              UTC.
            </p>
          </div>
        ) : (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/digital/compliance-watch/reports/${formatDate(report.date)}`}
                className='card group p-6 transition-all hover:shadow-lg'
              >
                <div className='mb-3 text-sm font-medium text-leaf-700'>
                  {new Date(report.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className='mb-4 text-2xl font-bold text-brand'>
                  {report.total_items ?? 0} Update
                  {(report.total_items ?? 0) !== 1 ? 's' : ''}
                </div>
                <div className='font-semibold text-leaf-700 group-hover:text-leaf-900'>
                  View Report →
                </div>
              </Link>
            ))}
          </div>
        )}

        {isAdmin && reports.length > 0 && (
          <p className='mt-6 text-center text-xs text-leaf-500'>
            {reports.length} report{reports.length !== 1 ? 's' : ''} total
          </p>
        )}
      </div>
    </section>
  );
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
