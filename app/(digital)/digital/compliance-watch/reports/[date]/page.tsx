import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import * as db from '@/lib/db';
import { isPaymentEnabled } from '@/lib/mpgs';
import { isPaymentExempt } from '@/lib/payment-config';
import { formatReportDate } from '@/lib/reports/renderer';
import { PrintButton } from './PrintButton';
import { ReportSidebar } from './ReportSidebar';
import { ReportLanguageSwitcher } from './ReportLanguageSwitcher';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { date } = await params;
  return {
    title: `Compliance Watch Report - ${date} | Fermidas`,
    description: 'Daily Seychelles compliance and regulatory updates',
  };
}

export default async function ReportPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/digital/auth/signin');
  }

  const { date } = await params;

  const reportDate = new Date(date);
  if (isNaN(reportDate.getTime())) {
    notFound();
  }

  const product = await db.findProductBySlug('compliance-watch');
  if (!product) notFound();

  const report = await db.findReportByDate(product.id, reportDate);

  if (!report || report.status !== 'PUBLISHED') {
    notFound();
  }

  const hasAccess =
    isPaymentExempt(session.user) ||
    (await checkReportAccess(session.user.id, product.id, reportDate));

  if (!hasAccess) {
    return (
      <div className='container py-24'>
        <div className='card mx-auto max-w-2xl p-8 text-center'>
          <h1 className='mb-4 text-2xl font-bold text-brand'>
            Subscription Required
          </h1>
          <p className='mb-6 text-leaf-700'>
            You need an active subscription or one-time purchase to view this
            report.
          </p>
          <Link href='/digital/compliance-watch' className='btn btn-primary'>
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  const allLanguages = await db.findAllReportLanguages(report.id);

  if (!allLanguages.length) {
    return <div>Report content not available</div>;
  }

  const formattedDate = formatReportDate(
    new Date(report.date),
    report.language_default ?? 'en',
  );

  return (
    <section className='section no-top bg-gradient-to-br from-mint to-white'>
      <div className='container py-12'>
        {/* Top bar */}
        <div className='mb-8 flex items-center justify-between print:hidden'>
          <Link
            href='/digital/compliance-watch/reports'
            className='text-sm text-leaf-700 hover:text-leaf-900'
          >
            ← All Reports
          </Link>
          <div className='flex gap-2'>
            <PrintButton />
          </div>
        </div>

        {/* Report header */}
        <div className='mb-8 border-b-4 border-[#749694] pb-6'>
          <p className='mb-1 text-sm font-semibold uppercase tracking-widest text-[#749694]'>
            Fermidas
          </p>
          <h1 className='mb-1 text-3xl font-bold text-[#141a1b]'>
            {product.name}
          </h1>
          <p className='text-lg text-[#5f7b7b]'>{formattedDate}</p>
        </div>

        {/* Two-column layout: sidebar + content */}
        <div className='flex items-start gap-8'>
          <ReportSidebar />
          <div className='min-w-0 flex-1'>
            <ReportLanguageSwitcher
              languages={allLanguages.map((l) => ({
                code: l.language,
                html: l.html,
              }))}
              defaultLanguage={report.language_default ?? 'en'}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

async function checkReportAccess(
  userId: string,
  productId: string,
  reportDate: Date,
): Promise<boolean> {
  if (!isPaymentEnabled()) {
    return true;
  }

  const subscription = await db.findActiveSubscription(userId, productId);

  if (subscription) {
    return true;
  }

  const purchase = await db.findOneOffPurchase(userId, productId, reportDate);

  return !!purchase;
}
