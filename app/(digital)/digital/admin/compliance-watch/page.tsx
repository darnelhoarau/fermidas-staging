import { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { Container } from '@/components/Container';
import { ForceReportGenerationButton } from './_components/ForceReportGenerationButton';

export const metadata: Metadata = {
  title: 'Compliance Watch Admin',
  description: 'Manage Compliance Watch sources and settings',
};

export default async function AdminDashboardPage() {
  await requireAdmin();

  const product = await db.findProductBySlug('compliance-watch');

  if (!product) {
    return <div>Product not found</div>;
  }

  const [totalSources, recentReports, killSwitch, totalSubscribers] =
    await Promise.all([
      db.countSources(product.id),
      db.findRecentPublishedReports(product.id, 5),
      db.getSetting('compliance_watch:kill_switch'),
      db.countActiveSubscribers(product.id),
    ]);

  const activeSources = totalSources;
  const totalCategories = (await db.findCategoriesByProduct(product.id)).length;

  const killSwitchEnabled = killSwitch
    ? JSON.parse(killSwitch.value_json)
    : false;

  return (
    <section className="bg-gradient-to-br from-mint to-white pt-12 pb-24 md:pb-28">
      <Container>
        <div className="mb-12">
          <h1 className="font-display mb-4 text-2xl font-bold text-brand md:text-4xl">
            Compliance Watch Admin
          </h1>
          <p className="text-lg text-leaf-700">
            Manage sources, categories, and report settings
          </p>
        </div>

        {/* Kill Switch Warning */}
        {killSwitchEnabled && (
          <div className="mb-8 rounded-2xl border-2 border-error bg-error/10 p-6">
            <h2 className="mb-2 text-xl font-bold text-error">
              ⚠️ Kill Switch Active
            </h2>
            <p className="text-error/90">
              Report generation is currently disabled. Go to Settings to re-enable.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-6">
            <div className="mb-2 text-3xl font-bold text-brand">{totalSources}</div>
            <div className="text-sm text-leaf-700">Total Sources</div>
          </div>

          <div className="card p-6">
            <div className="mb-2 text-3xl font-bold text-brand">{activeSources}</div>
            <div className="text-sm text-leaf-700">Active Sources</div>
          </div>

          <div className="card p-6">
            <div className="mb-2 text-3xl font-bold text-brand">{totalCategories}</div>
            <div className="text-sm text-leaf-700">Categories</div>
          </div>

          <div className="card p-6">
            <div className="mb-2 text-3xl font-bold text-brand">{totalSubscribers}</div>
            <div className="text-sm text-leaf-700">Active Subscribers</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-brand">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/digital/admin/compliance-watch/sources"
              className="card p-6 transition-shadow hover:shadow-lg"
            >
              <h3 className="mb-2 text-lg font-bold text-brand">Manage Sources</h3>
              <p className="text-sm text-leaf-700">
                Add, edit, or disable monitoring sources
              </p>
            </Link>

            <Link
              href="/digital/admin/compliance-watch/categories"
              className="card p-6 transition-shadow hover:shadow-lg"
            >
              <h3 className="mb-2 text-lg font-bold text-brand">
                Manage Categories
              </h3>
              <p className="text-sm text-leaf-700">
                Organize sources into categories
              </p>
            </Link>

            <Link
              href="/digital/admin/compliance-watch/settings"
              className="card p-6 transition-shadow hover:shadow-lg"
            >
              <h3 className="mb-2 text-lg font-bold text-brand">Settings</h3>
              <p className="text-sm text-leaf-700">
                Configure kill switch and report frequency
              </p>
            </Link>

            <ForceReportGenerationButton 
              productId={product.id} 
              killSwitchEnabled={killSwitchEnabled}
            />
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-brand">Recent Reports</h2>
          {recentReports.length === 0 ? (
            <div className="card p-6">
              <p className="text-leaf-700">
                No reports generated yet. Reports will appear here once created.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <Link
                  key={report.id}
                  href={`/digital/compliance-watch/reports/${report.date.toISOString().split('T')[0]}`}
                  className="card flex items-center justify-between p-4 transition-shadow hover:shadow-lg"
                >
                  <div>
                    <div className="font-semibold text-brand">
                      {new Date(report.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-sm text-leaf-700">
                      {report.total_items} updates
                    </div>
                  </div>
                  <div className="text-sm text-leaf-600">View →</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
