'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SuggestSelectorsButton } from './SuggestSelectorsButton';

interface SourceUrl {
  url: string;
  type: 'RSS' | 'HTML' | 'JSON';
  css_list_selector?: string | null;
  css_item_selector?: string | null;
  css_content_selector?: string | null;
  xpath_item?: string | null;
  xpath_content?: string | null;
}

interface Source {
  id: string;
  name: string;
  url?: string; // Legacy - for backward compatibility
  type?: string; // Legacy
  urls?: SourceUrl[]; // New format
  selector?: string | null; // Legacy
  isActive: boolean;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
}

export function EditSourceButton({
  source,
  productId,
}: {
  source: Source;
  productId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    source.categoryId
  );

  // Initialize URLs array - support both old and new format
  const getInitialUrls = useCallback((): SourceUrl[] => {
    if (source.urls && source.urls.length > 0) {
      return source.urls;
    }
    // Fallback to legacy format
    if (source.url) {
      return [
        {
          url: source.url,
          type: (source.type as 'RSS' | 'HTML' | 'JSON') || 'HTML',
          css_list_selector: null,
          css_item_selector: source.selector || null,
          css_content_selector: null,
          xpath_item: null,
          xpath_content: null,
        },
      ];
    }
    // Default empty
    return [
      {
        url: '',
        type: 'HTML',
        css_list_selector: null,
        css_item_selector: null,
        css_content_selector: null,
        xpath_item: null,
        xpath_content: null,
      },
    ];
  }, [source.urls, source.url, source.type, source.selector]);

  const [urls, setUrls] = useState<SourceUrl[]>(getInitialUrls());
  const [validatingUrls, setValidatingUrls] = useState<Set<number>>(new Set());
  const [urlValidationResults, setUrlValidationResults] = useState<
    Map<
      number,
      {
        valid: boolean;
        accessible: boolean;
        crawlable: boolean;
        error?: string;
      }
    >
  >(new Map());
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      // Reset to source's current category when opening
      setSelectedCategoryId(source.categoryId);
      setUrls(getInitialUrls());
      // Fetch categories
      fetch(`/api/admin/compliance-watch/categories?productId=${productId}`)
        .then((res) => res.json())
        .then((data) => setCategories(data.categories || []))
        .catch((err) => console.error('Failed to fetch categories:', err));
    }
  }, [isOpen, source.categoryId, productId, getInitialUrls]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    // Filter out empty URLs and normalize optional fields (empty strings to null)
    const validUrls = urls
      .filter((u) => u.url.trim() !== '')
      .map((u) => ({
        url: u.url.trim(),
        type: u.type,
        css_list_selector: u.css_list_selector?.trim() || null,
        css_item_selector: u.css_item_selector?.trim() || null,
        css_content_selector: u.css_content_selector?.trim() || null,
        xpath_item: u.xpath_item?.trim() || null,
        xpath_content: u.xpath_content?.trim() || null,
      }));

    if (validUrls.length === 0) {
      alert('Please add at least one URL');
      setIsSubmitting(false);
      return;
    }

    // Check for duplicate URLs before submitting
    const urlSet = new Set<string>();
    for (const urlObj of validUrls) {
      const normalizedUrl = urlObj.url.toLowerCase();
      if (urlSet.has(normalizedUrl)) {
        alert(
          `Duplicate URL detected: ${urlObj.url}\nPlease remove the duplicate before saving.`
        );
        setIsSubmitting(false);
        return;
      }
      urlSet.add(normalizedUrl);
    }

    const data = {
      name: formData.get('name'),
      urls: validUrls,
      isActive: formData.get('isActive') === 'on',
      categoryId: formData.get('categoryId'),
    };

    console.log('Submitting source update:', { sourceId: source.id, data });

    try {
      const response = await fetch(
        `/api/admin/compliance-watch/sources/${source.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        throw new Error(
          errorData.error || `Failed to update source: ${response.status}`
        );
      }

      const result = await response.json();
      console.log('Source updated successfully:', result);

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating source:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update source. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addUrl = () => {
    setUrls([
      ...urls,
      {
        url: '',
        type: 'HTML',
        css_list_selector: null,
        css_item_selector: null,
        css_content_selector: null,
        xpath_item: null,
        xpath_content: null,
      },
    ]);
  };

  const checkDuplicateUrl = (url: string, currentIndex: number): boolean => {
    const normalizedUrl = url.trim().toLowerCase();
    return urls.some(
      (u, index) =>
        index !== currentIndex && u.url.trim().toLowerCase() === normalizedUrl
    );
  };

  const removeUrl = (index: number) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index));
    } else {
      alert('At least one URL is required');
    }
  };

  const updateUrl = (
    index: number,
    field: keyof SourceUrl,
    value: string | null
  ) => {
    const newUrls = [...urls];
    newUrls[index] = { ...newUrls[index], [field]: value };

    // Check for duplicate URLs when updating the url field
    if (field === 'url' && value && value.trim() !== '') {
      const isDuplicate = checkDuplicateUrl(value, index);
      if (isDuplicate) {
        alert('This URL is already added. Please use a different URL.');
        return; // Don't update if duplicate
      }
      // Clear validation result when URL changes
      const newValidationResults = new Map(urlValidationResults);
      newValidationResults.delete(index);
      setUrlValidationResults(newValidationResults);
    }

    setUrls(newUrls);
  };

  const validateUrl = async (index: number) => {
    const url = urls[index]?.url?.trim();
    if (!url) {
      alert('Please enter a URL first');
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      setUrlValidationResults((prev) => {
        const newMap = new Map(prev);
        newMap.set(index, {
          valid: false,
          accessible: false,
          crawlable: false,
          error: 'Invalid URL format',
        });
        return newMap;
      });
      return;
    }

    setValidatingUrls((prev) => new Set(prev).add(index));

    try {
      const response = await fetch('/api/admin/compliance-watch/validate-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`Validation failed: ${response.statusText}`);
      }

      const result = await response.json();

      setUrlValidationResults((prev) => {
        const newMap = new Map(prev);
        newMap.set(index, result);
        return newMap;
      });
    } catch (error) {
      console.error('Error validating URL:', error);
      setUrlValidationResults((prev) => {
        const newMap = new Map(prev);
        newMap.set(index, {
          valid: false,
          accessible: false,
          crawlable: false,
          error: error instanceof Error ? error.message : 'Validation failed',
        });
        return newMap;
      });
    } finally {
      setValidatingUrls((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className='rounded-lg border border-leaf-300 px-3 py-1 text-sm font-medium text-brand hover:bg-leaf-50'
      >
        Edit
      </button>
    );
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div className='card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-8'>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-2xl font-bold text-brand'>Edit Source</h2>
          <button
            onClick={() => setIsOpen(false)}
            className='text-leaf-600 hover:text-brand'
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label className='mb-2 block text-sm font-medium text-brand'>
              Category <span className='text-error'>*</span>
            </label>
            <select
              title='Category'
              name='categoryId'
              aria-label='Category'
              required
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className='w-full rounded-lg border border-leaf-300 px-4 py-2 text-brand focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20'
            >
              <option value=''>Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-brand'>
              Source Name <span className='text-error'>*</span>
            </label>
            <input
              title='Source Name'
              placeholder='Source Name'
              type='text'
              name='name'
              required
              defaultValue={source.name}
              className='w-full rounded-lg border border-leaf-300 px-4 py-2 text-brand focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20'
            />
          </div>

          {/* Multiple URLs Section */}
          <div className='space-y-4'>
            <label className='mb-2 block text-sm font-medium text-brand'>
              URLs <span className='text-error'>*</span>
            </label>

            {urls.map((urlData, index) => (
              <div
                key={index}
                className='rounded-lg border border-leaf-200 bg-leaf-50 p-4 space-y-4'
              >
                <div className='flex items-center justify-between'>
                  <h3 className='text-sm font-semibold text-brand'>
                    URL {index + 1}
                  </h3>
                  {urls.length > 1 && (
                    <button
                      type='button'
                      onClick={() => removeUrl(index)}
                      className='text-xs text-error hover:underline'
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-brand'>
                    URL <span className='text-error'>*</span>
                  </label>
                  <div className='flex items-center gap-2'>
                    <input
                      type='url'
                      value={urlData.url}
                      onChange={(e) => updateUrl(index, 'url', e.target.value)}
                      placeholder='https://...'
                      required
                      className='flex-1 rounded-lg border border-leaf-300 px-4 py-2 text-brand focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20'
                    />
                    <button
                      type='button'
                      onClick={() => validateUrl(index)}
                      disabled={
                        validatingUrls.has(index) || !urlData.url.trim()
                      }
                      className='flex h-10 w-10 items-center justify-center rounded-full border border-leaf-300 bg-white transition-colors hover:bg-leaf-50 disabled:cursor-not-allowed disabled:opacity-50'
                      title='Validate URL accessibility and crawlability'
                      aria-label='Validate URL'
                    >
                      {validatingUrls.has(index) ? (
                        <svg
                          className='h-5 w-5 animate-spin text-leaf-600'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          ></circle>
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          ></path>
                        </svg>
                      ) : urlValidationResults.has(index) ? (
                        (() => {
                          const result = urlValidationResults.get(index)!;
                          if (
                            result.valid &&
                            result.accessible &&
                            result.crawlable
                          ) {
                            return (
                              <svg
                                className='h-5 w-5 text-success'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M5 13l4 4L19 7'
                                />
                              </svg>
                            );
                          } else {
                            return (
                              <svg
                                className='h-5 w-5 text-error'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M6 18L18 6M6 6l12 12'
                                />
                              </svg>
                            );
                          }
                        })()
                      ) : (
                        <svg
                          className='h-5 w-5 text-leaf-700'
                          fill='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <circle cx='12' cy='12' r='10' />
                        </svg>
                      )}
                    </button>
                  </div>
                  {urlValidationResults.has(index) && (
                    <div className='mt-1 text-xs'>
                      {(() => {
                        const result = urlValidationResults.get(index)!;
                        if (
                          result.valid &&
                          result.accessible &&
                          result.crawlable
                        ) {
                          return (
                            <span className='text-success'>
                              ✓ URL is accessible and crawlable
                            </span>
                          );
                        } else if (
                          result.valid &&
                          result.accessible &&
                          !result.crawlable
                        ) {
                          return (
                            <span className='text-error'>
                              ⚠ URL is accessible but crawling is blocked by
                              robots.txt
                            </span>
                          );
                        } else if (result.valid && !result.accessible) {
                          return (
                            <span className='text-error'>
                              ✗ URL is not accessible:{' '}
                              {result.error || 'Unknown error'}
                            </span>
                          );
                        } else {
                          return (
                            <span className='text-error'>
                              ✗ {result.error || 'Invalid URL'}
                            </span>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-brand'>
                    Type <span className='text-error'>*</span>
                  </label>
                  <select
                    title='URL Type'
                    aria-label='URL Type'
                    value={urlData.type}
                    onChange={(e) =>
                      updateUrl(
                        index,
                        'type',
                        e.target.value as 'RSS' | 'HTML' | 'JSON'
                      )
                    }
                    required
                    className='w-full rounded-lg border border-leaf-300 px-4 py-2 text-brand focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20'
                  >
                    <option value='RSS'>RSS Feed</option>
                    <option value='HTML'>HTML Page</option>
                    <option value='JSON'>JSON API</option>
                  </select>
                </div>

                {urlData.type === 'HTML' && (
                  <div>
                    <div className='mb-2 flex items-center justify-between'>
                      <label className='block text-sm font-medium text-brand'>
                        CSS Selectors (for HTML type)
                      </label>
                      <SuggestSelectorsButton
                        sourceId={source.id}
                        sourceUrl={urlData.url}
                        onSelectorsSuggested={(selectors) => {
                          updateUrl(
                            index,
                            'css_list_selector',
                            selectors.listSelector || null
                          );
                          updateUrl(
                            index,
                            'css_item_selector',
                            selectors.itemSelector || null
                          );
                          updateUrl(
                            index,
                            'css_content_selector',
                            selectors.contentSelector || null
                          );
                        }}
                      />
                    </div>
                    <div className='space-y-2'>
                      <input
                        type='text'
                        value={urlData.css_list_selector || ''}
                        onChange={(e) =>
                          updateUrl(
                            index,
                            'css_list_selector',
                            e.target.value || null
                          )
                        }
                        placeholder='List selector (e.g. .news-list)'
                        className='w-full rounded-lg border border-leaf-300 px-4 py-2 text-sm text-brand focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20'
                      />
                      <input
                        type='text'
                        value={urlData.css_item_selector || ''}
                        onChange={(e) =>
                          updateUrl(
                            index,
                            'css_item_selector',
                            e.target.value || null
                          )
                        }
                        placeholder='Item selector (e.g. .news-item)'
                        className='w-full rounded-lg border border-leaf-300 px-4 py-2 text-sm text-brand focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20'
                      />
                      <input
                        type='text'
                        value={urlData.css_content_selector || ''}
                        onChange={(e) =>
                          updateUrl(
                            index,
                            'css_content_selector',
                            e.target.value || null
                          )
                        }
                        placeholder='Content selector (e.g. .news-content)'
                        className='w-full rounded-lg border border-leaf-300 px-4 py-2 text-sm text-brand focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20'
                      />
                    </div>
                    <p className='mt-1 text-xs text-leaf-500'>
                      Leave empty to use intelligent auto-detection
                    </p>
                  </div>
                )}
              </div>
            ))}

            <button
              type='button'
              onClick={addUrl}
              className='w-full rounded-lg border-2 border-dashed border-leaf-300 px-4 py-3 text-sm font-medium text-brand hover:border-leaf-400 hover:bg-leaf-50 transition-colors'
            >
              + Add another URL
            </button>
          </div>

          <div className='flex items-center gap-3'>
            <input
              type='checkbox'
              id={`isActive-${source.id}`}
              name='isActive'
              defaultChecked={source.isActive}
              className='h-4 w-4 rounded border-leaf-300 text-leaf-600 focus:ring-2 focus:ring-leaf-600/20'
            />
            <label
              htmlFor={`isActive-${source.id}`}
              className='text-sm font-medium text-brand'
            >
              Active (include in daily reports)
            </label>
          </div>

          <div className='flex gap-3 border-t border-leaf-100 pt-6'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='btn btn-primary flex-1'
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type='button'
              onClick={() => setIsOpen(false)}
              className='btn btn-ghost flex-1'
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
