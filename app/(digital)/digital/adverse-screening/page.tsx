import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Adverse Screening | Fermidas',
  description: 'Coming soon',
};

export default function AdverseScreeningPage() {
  return (
    <div className="container flex min-h-screen items-center justify-center py-24">
      <div className="card max-w-2xl p-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-brand">
          Adverse Screening
        </h1>
        <p className="mb-8 text-xl text-leaf-700">
          Advanced screening reports for due diligence.
        </p>
        <p className="mb-8 text-leaf-600">Coming Soon</p>
        <Link href="/digital" className="btn btn-primary">
          Browse Other Products
        </Link>
      </div>
    </div>
  );
}

