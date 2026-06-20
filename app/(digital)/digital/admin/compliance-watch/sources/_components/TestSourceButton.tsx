'use client';

import { useState } from 'react';

interface TestResult {
  success: boolean;
  sourceName?: string;
  newChangesFound?: number;
  totalItemsOnPage?: number;
  existingItemsFound?: number;
  newItems?: Array<{
    title: string;
    url: string;
    publishedAt: string;
    hash: string;
    content?: string;
  }>;
  recentChanges?: Array<{
    title: string;
    url: string;
    publishedAt: string;
    createdAt: string;
  }>;
  scrapeInfo?: {
    strategy: string;
    confidence: number;
    errors: string[];
    urlsProcessed?: number;
    itemsPerUrl?: Array<{ url: string; itemCount: number }>;
  };
  error?: string;
}

export function TestSourceButton({
  sourceId,
  sourceName,
}: {
  sourceId: string;
  sourceName: string;
}) {
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleTest = async () => {
    setIsTesting(true);
    setShowModal(true);
    setResult(null);

    try {
      const response = await fetch(
        `/api/admin/compliance-watch/sources/${sourceId}/test`,
        {
          method: 'POST',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setResult({ success: false, error: data.error || 'Test failed' });
      } else {
        setResult({
          success: true,
          sourceName: data.sourceName,
          newChangesFound: data.newChangesFound || 0,
          totalItemsOnPage: data.totalItemsOnPage || 0,
          existingItemsFound: data.existingItemsFound || 0,
          newItems: data.newItems || [],
          recentChanges: data.recentChanges || [],
          scrapeInfo: data.scrapeInfo,
        });
      }
    } catch (error) {
      console.error('Error testing source:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleTest}
        disabled={isTesting}
        className='rounded-lg border border-leaf-300 px-3 py-1 text-sm font-medium text-brand hover:bg-leaf-50 disabled:opacity-50'
      >
        {isTesting ? 'Testing...' : 'Test'}
      </button>

      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='card max-h-[80vh] w-full max-w-2xl overflow-y-auto p-8'>
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-2xl font-bold text-brand'>
                Test Results: {sourceName}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className='text-leaf-600 hover:text-brand'
              >
                ✕
              </button>
            </div>

            {isTesting ? (
              <div className='py-12 text-center'>
                <div className='mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-leaf-200 border-t-leaf-600' />
                <p className='text-leaf-700'>Checking for new changes...</p>
              </div>
            ) : result ? (
              <div className='space-y-4'>
                {result.success ? (
                  <>
                    <div className='rounded-lg bg-success/10 p-4'>
                      <p className='font-semibold text-success'>
                        ✓ Change Detection Complete!
                      </p>
                      <div className='mt-2 space-y-1 text-sm text-leaf-700'>
                        <p>
                          <strong>New Changes Found:</strong>{' '}
                          {result.newChangesFound}
                        </p>
                        <p>
                          <strong>Total Items on Page:</strong>{' '}
                          {result.totalItemsOnPage}
                        </p>
                        <p>
                          <strong>Already Seen:</strong>{' '}
                          {result.existingItemsFound}
                        </p>
                        {result.scrapeInfo && (
                          <div className='mt-2 p-2 bg-white/50 rounded text-xs space-y-1'>
                            <p>
                              <strong>Scraping Strategy:</strong>{' '}
                              {result.scrapeInfo.strategy}
                            </p>
                            <p>
                              <strong>Confidence:</strong>{' '}
                              {result.scrapeInfo.confidence}%
                            </p>
                            {result.scrapeInfo.urlsProcessed &&
                              result.scrapeInfo.urlsProcessed > 1 && (
                                <p>
                                  <strong>URLs Processed:</strong>{' '}
                                  {result.scrapeInfo.urlsProcessed}
                                </p>
                              )}
                            {result.scrapeInfo.itemsPerUrl &&
                              result.scrapeInfo.itemsPerUrl.length > 0 && (
                                <div className='mt-2'>
                                  <p>
                                    <strong>Items per URL:</strong>
                                  </p>
                                  <ul className='ml-4 list-disc space-y-0.5'>
                                    {result.scrapeInfo.itemsPerUrl.map(
                                      (urlInfo, idx) => (
                                        <li key={idx} className='text-xs'>
                                          {urlInfo.itemCount} items from{' '}
                                          {urlInfo.url.length > 50
                                            ? urlInfo.url.substring(0, 50) +
                                              '...'
                                            : urlInfo.url}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                            {result.scrapeInfo.errors &&
                              result.scrapeInfo.errors.length > 0 && (
                                <div className='mt-2'>
                                  <p>
                                    <strong>Errors:</strong>
                                  </p>
                                  <ul className='ml-4 list-disc space-y-0.5'>
                                    {result.scrapeInfo.errors.map(
                                      (error, idx) => (
                                        <li
                                          key={idx}
                                          className='text-xs text-error'
                                        >
                                          {error}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                          </div>
                        )}
                        {result.newChangesFound === 0 &&
                          (result.totalItemsOnPage ?? 0) > 0 && (
                            <p className='text-leaf-600'>
                              All items have been seen before
                            </p>
                          )}
                        {(result.totalItemsOnPage ?? 0) === 0 && (
                          <p className='text-warn'>
                            No items found on this page
                          </p>
                        )}
                      </div>
                    </div>

                    {result.newItems && result.newItems.length > 0 && (
                      <div className='rounded-lg border border-leaf-200 p-4'>
                        <h3 className='mb-3 font-semibold text-brand'>
                          New Items Found ({result.newItems.length}):
                        </h3>
                        <div className='space-y-3 max-h-60 overflow-y-auto'>
                          {result.newItems.map((item, index) => (
                            <div
                              key={index}
                              className='border-b border-leaf-100 pb-2 last:border-b-0'
                            >
                              <div className='font-medium text-brand'>
                                {item.title}
                              </div>
                              {item.content && (
                                <div className='text-sm text-leaf-700 mt-1'>
                                  {item.content}
                                </div>
                              )}
                              <div className='text-sm text-leaf-600 mt-1'>
                                <a
                                  href={item.url}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='hover:underline'
                                >
                                  {item.url}
                                </a>
                              </div>
                              <div className='text-xs text-leaf-500'>
                                {item.publishedAt && (
                                  <span>
                                    Published:{' '}
                                    {new Date(
                                      item.publishedAt
                                    ).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.recentChanges &&
                      result.recentChanges.length > 0 && (
                        <div className='rounded-lg border border-leaf-200 p-4'>
                          <h3 className='mb-3 font-semibold text-brand'>
                            Previously Found Changes (
                            {result.recentChanges.length}):
                          </h3>
                          <div className='space-y-3 max-h-60 overflow-y-auto'>
                            {result.recentChanges.map((change, index) => (
                              <div
                                key={index}
                                className='border-b border-leaf-100 pb-2 last:border-b-0'
                              >
                                <div className='font-medium text-brand'>
                                  {change.title}
                                </div>
                                <div className='text-sm text-leaf-600'>
                                  <a
                                    href={change.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='hover:underline'
                                  >
                                    {change.url}
                                  </a>
                                </div>
                                <div className='text-xs text-leaf-500'>
                                  Found:{' '}
                                  {new Date(change.createdAt).toLocaleString()}
                                  {change.publishedAt && (
                                    <span>
                                      {' '}
                                      • Published:{' '}
                                      {new Date(
                                        change.publishedAt
                                      ).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </>
                ) : (
                  <div className='rounded-lg bg-error/10 p-4'>
                    <p className='font-semibold text-error'>✗ Test failed</p>
                    <p className='mt-2 text-sm text-leaf-700'>
                      {result.error || 'Unknown error occurred'}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setShowModal(false)}
                  className='btn btn-ghost w-full'
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
