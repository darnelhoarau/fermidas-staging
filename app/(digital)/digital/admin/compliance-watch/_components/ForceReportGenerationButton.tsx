'use client';

import { useState } from 'react';
import { PlayIcon, CheckmarkCircle01Icon, DangerIcon } from 'hugeicons-react';

interface ForceReportGenerationButtonProps {
  productId: string;
  killSwitchEnabled: boolean;
}

export function ForceReportGenerationButton({ 
  productId, 
  killSwitchEnabled 
}: ForceReportGenerationButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    reportId?: string;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleForceGeneration = async () => {
    setIsGenerating(true);
    setShowModal(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/compliance-watch/force-generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({
          success: false,
          message: data.error || 'Failed to generate report',
        });
      } else {
        setResult({
          success: true,
          message: data.message || 'Report generated successfully',
          reportId: data.reportId,
        });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (killSwitchEnabled) {
    return (
      <div className="card p-6 opacity-50">
        <h3 className="mb-2 text-lg font-bold text-brand">Generate Report</h3>
        <p className="text-sm text-leaf-700 mb-4">
          Force generate a compliance report now
        </p>
        <button
          disabled
          className="btn btn-ghost w-full"
        >
          Kill Switch Active - Disabled
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="card p-6 transition-shadow hover:shadow-lg">
        <h3 className="mb-2 text-lg font-bold text-brand">Generate Report</h3>
        <p className="text-sm text-leaf-700 mb-4">
          Force generate a compliance report now
        </p>
        <button
          onClick={handleForceGeneration}
          disabled={isGenerating}
          className="btn btn-primary w-full"
        >
          {isGenerating ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generating...
            </>
          ) : (
            <>
              <PlayIcon size={16} className="mr-2" />
              Generate Report
            </>
          )}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card max-h-[80vh] w-full max-w-md overflow-y-auto p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-brand">
                Report Generation
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-leaf-600 hover:text-brand"
              >
                ✕
              </button>
            </div>

            {isGenerating ? (
              <div className="py-12 text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-leaf-200 border-t-leaf-600" />
                <p className="text-leaf-700">Generating compliance report...</p>
                <p className="mt-2 text-sm text-leaf-600">
                  This may take a few minutes
                </p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                {result.success ? (
                  <div className="rounded-lg bg-success/10 p-4">
                    <div className="flex items-center">
                      <CheckmarkCircle01Icon size={20} className="text-success mr-2" />
                      <p className="font-semibold text-success">
                        Report Generated Successfully!
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-leaf-700">
                      {result.message}
                    </p>
                    {result.reportId && (
                      <p className="mt-2 text-xs text-leaf-600">
                        Report ID: {result.reportId}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg bg-error/10 p-4">
                    <div className="flex items-center">
                      <DangerIcon size={20} className="text-error mr-2" />
                      <p className="font-semibold text-error">
                        Generation Failed
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-leaf-700">
                      {result.message}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setShowModal(false)}
                  className="btn btn-ghost w-full"
                >
                  Close
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
