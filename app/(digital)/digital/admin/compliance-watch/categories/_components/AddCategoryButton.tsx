'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AddCategoryButton({ productId }: { productId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/admin/compliance-watch/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          name: formData.get('name'),
          isActive: formData.get('isActive') === 'on',
        }),
      });

      if (!response.ok) throw new Error('Failed to create category');

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary"
      >
        Add Category
      </button>

      {/* Add Category Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card max-h-[90vh] w-full max-w-md overflow-y-auto p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-brand">Add Category</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-leaf-600 hover:text-brand"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-brand">
                  Category Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full rounded-lg border border-leaf-300 px-4 py-2 text-brand focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20"
                  placeholder="Enter category name"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  defaultChecked={true}
                  className="h-4 w-4 rounded border-leaf-300 text-leaf-600 focus:ring-2 focus:ring-leaf-600/20"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-brand">
                  Active
                </label>
              </div>

              <div className="flex gap-3 border-t border-leaf-100 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1"
                >
                  {isSubmitting ? 'Creating...' : 'Create Category'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
