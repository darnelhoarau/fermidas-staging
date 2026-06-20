'use client';

import { useState } from 'react';

interface SuggestSelectorsButtonProps {
  sourceId: string;
  sourceUrl: string;
  onSelectorsSuggested: (selectors: {
    listSelector: string;
    itemSelector: string;
    titleSelector: string;
    linkSelector: string;
    dateSelector: string;
    contentSelector: string;
  }) => void;
}

export function SuggestSelectorsButton({
  sourceId,
  sourceUrl,
  onSelectorsSuggested,
}: SuggestSelectorsButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    listSelector: string;
    itemSelector: string;
    titleSelector: string;
    linkSelector: string;
    dateSelector: string;
    contentSelector: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setShowModal(true);
    setSuggestions(null);

    try {
      const response = await fetch(
        `/api/admin/compliance-watch/sources/${sourceId}/suggest-selectors`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: sourceUrl }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze website');
      }

      setSuggestions(data.suggestions);
      setError(null);
    } catch (err) {
      console.error('Error analyzing website:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSuggestions(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplySuggestions = () => {
    if (suggestions && !error) {
      onSelectorsSuggested(suggestions);
      setShowModal(false);
    }
  };

  return (
    <>
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className='rounded-lg border border-leaf-300 px-3 py-1 text-sm font-medium text-brand hover:bg-leaf-50 disabled:opacity-50'
      >
        {isAnalyzing ? 'Analyzing...' : 'Suggest Selectors'}
      </button>

      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='card max-h-[80vh] w-full max-w-2xl overflow-y-auto p-8'>
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-2xl font-bold text-brand'>
                Website Analysis: {sourceUrl}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className='text-leaf-600 hover:text-brand'
              >
                ✕
              </button>
            </div>

            {isAnalyzing ? (
              <div className='py-12 text-center'>
                <div className='mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-leaf-200 border-t-leaf-600' />
                <p className='text-leaf-700'>Analyzing website structure...</p>
              </div>
            ) : suggestions ? (
              <div className='space-y-4'>
                {error ? (
                  <div className='rounded-lg bg-error/10 p-4'>
                    <p className='font-semibold text-error'>
                      ✗ Analysis failed
                    </p>
                    <p className='mt-2 text-sm text-leaf-700'>{error}</p>
                  </div>
                ) : (
                  <>
                    <div className='rounded-lg bg-success/10 p-4'>
                      <p className='font-semibold text-success'>
                        ✓ Website analysis complete!
                      </p>
                      <p className='mt-2 text-sm text-leaf-700'>
                        Found suggested selectors for this website structure.
                      </p>
                    </div>

                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium text-brand mb-2'>
                          List Container Selector
                        </label>
                        <input
                          title='List Container Selector'
                          type='text'
                          value={suggestions.listSelector || ''}
                          readOnly
                          className='w-full rounded-lg border border-leaf-300 px-3 py-2 text-sm text-brand bg-leaf-50'
                        />
                        <p className='text-xs text-leaf-500 mt-1'>
                          Selects the container that holds all content items
                        </p>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-brand mb-2'>
                          Item Selector
                        </label>
                        <input
                          title='Item Selector'
                          type='text'
                          value={suggestions.itemSelector || ''}
                          readOnly
                          className='w-full rounded-lg border border-leaf-300 px-3 py-2 text-sm text-brand bg-leaf-50'
                        />
                        <p className='text-xs text-leaf-500 mt-1'>
                          Selects individual content items within the container
                        </p>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-brand mb-2'>
                          Title Selector
                        </label>
                        <input
                          title='Title Selector'
                          type='text'
                          value={suggestions.titleSelector || ''}
                          readOnly
                          className='w-full rounded-lg border border-leaf-300 px-3 py-2 text-sm text-brand bg-leaf-50'
                        />
                        <p className='text-xs text-leaf-500 mt-1'>
                          Selects the title/headline within each item
                        </p>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-brand mb-2'>
                          Link Selector
                        </label>
                        <input
                          title='Link Selector'
                          type='text'
                          value={suggestions.linkSelector || ''}
                          readOnly
                          className='w-full rounded-lg border border-leaf-300 px-3 py-2 text-sm text-brand bg-leaf-50'
                        />
                        <p className='text-xs text-leaf-500 mt-1'>
                          Selects the link URL within each item
                        </p>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-brand mb-2'>
                          Date Selector
                        </label>
                        <input
                          title='Date Selector'
                          type='text'
                          value={suggestions.dateSelector || ''}
                          readOnly
                          className='w-full rounded-lg border border-leaf-300 px-3 py-2 text-sm text-brand bg-leaf-50'
                        />
                        <p className='text-xs text-leaf-500 mt-1'>
                          Selects the publication date within each item
                        </p>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-brand mb-2'>
                          Content Selector
                        </label>
                        <input
                          title='Content Selector'
                          type='text'
                          value={suggestions.contentSelector || ''}
                          readOnly
                          className='w-full rounded-lg border border-leaf-300 px-3 py-2 text-sm text-brand bg-leaf-50'
                        />
                        <p className='text-xs text-leaf-500 mt-1'>
                          Selects the content/summary within each item
                        </p>
                      </div>
                    </div>

                    <div className='flex justify-end gap-3 pt-4'>
                      <button
                        onClick={() => setShowModal(false)}
                        className='btn btn-ghost'
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleApplySuggestions}
                        className='btn btn-primary'
                      >
                        Apply Suggestions
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
