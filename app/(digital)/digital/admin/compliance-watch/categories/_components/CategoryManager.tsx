'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  isActive: boolean;
  sort: number;
  _count: { sources: number };
}

export function CategoryManager({
  categories: initialCategories,
}: {
  categories: Category[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const moveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex((c) => c.id === categoryId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === categories.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newCategories = [...categories];
    [newCategories[currentIndex], newCategories[newIndex]] = [
      newCategories[newIndex],
      newCategories[currentIndex],
    ];

    // Update sort values
    const updates = newCategories.map((cat, idx) => ({
      id: cat.id,
      sort: idx,
    }));

    setCategories(newCategories);

    // Persist to database
    try {
      await Promise.all(
        updates.map((update) =>
          fetch(`/api/admin/compliance-watch/categories/${update.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sort: update.sort }),
          })
        )
      );
      router.refresh();
    } catch (error) {
      console.error('Error updating category order:', error);
      setCategories(initialCategories); // Revert on error
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCategory) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(
        `/api/admin/compliance-watch/categories/${editingCategory.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.get('name'),
            isActive: formData.get('isActive') === 'on',
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update category');

      setEditingCategory(null);
      router.refresh();
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/admin/compliance-watch/categories/${deletingCategory.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Failed to delete category');

      setDeletingCategory(null);
      router.refresh();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className='card mx-auto max-w-3xl divide-y divide-leaf-100'>
        {categories.map((category, index) => (
          <div key={category.id} className='p-4'>
            <div className='flex items-center gap-4'>
              {/* Up/Down Arrows */}
              <div className='flex flex-col gap-1'>
                <button
                  onClick={() => moveCategory(category.id, 'up')}
                  disabled={index === 0}
                  className='text-leaf-700 hover:text-leaf-900 disabled:opacity-30 disabled:cursor-not-allowed'
                  title='Move up'
                >
                  ↑
                </button>
                <button
                  onClick={() => moveCategory(category.id, 'down')}
                  disabled={index === categories.length - 1}
                  className='text-leaf-700 hover:text-leaf-900 disabled:opacity-30 disabled:cursor-not-allowed'
                  title='Move down'
                >
                  ↓
                </button>
              </div>

              <div className='flex-1'>
                <div className='mb-1 flex items-center gap-3'>
                  <h3 className='font-semibold text-brand'>{category.name}</h3>
                  <span
                    className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${
                      category.isActive
                        ? 'bg-success/10 text-success'
                        : 'bg-leaf-100 text-leaf-700'
                    }`}
                  >
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className='text-sm text-leaf-600'>
                  {category._count?.sources || 0} source
                  {(category._count?.sources || 0) !== 1 ? 's' : ''}
                </div>
              </div>

              <div className='flex gap-2'>
                <button
                  onClick={() => setEditingCategory(category)}
                  className='rounded-lg border border-leaf-300 px-3 py-1 text-sm font-medium text-brand hover:bg-leaf-50'
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeletingCategory(category)}
                  className='rounded-lg border border-error/30 px-3 py-1 text-sm font-medium text-error hover:bg-error/10'
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingCategory && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='card max-h-[90vh] w-full max-w-md overflow-y-auto p-8'>
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-2xl font-bold text-brand'>Edit Category</h2>
              <button
                onClick={() => setEditingCategory(null)}
                className='text-leaf-600 hover:text-brand'
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEdit} className='space-y-6'>
              <div>
                <label className='mb-2 block text-sm font-medium text-brand'>
                  Category Name <span className='text-error'>*</span>
                </label>
                <input
                  title='Category Name'
                  type='text'
                  name='name'
                  required
                  defaultValue={editingCategory.name}
                  className='w-full rounded-lg border border-leaf-300 px-4 py-2 text-brand focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20'
                />
              </div>

              <div className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  id='isActive'
                  name='isActive'
                  defaultChecked={editingCategory.isActive}
                  className='h-4 w-4 rounded border-leaf-300 text-leaf-600 focus:ring-2 focus:ring-leaf-600/20'
                />
                <label
                  htmlFor='isActive'
                  className='text-sm font-medium text-brand'
                >
                  Active
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
                  onClick={() => setEditingCategory(null)}
                  className='btn btn-ghost flex-1'
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='card w-full max-w-md p-8'>
            <div className='mb-6'>
              <h2 className='text-2xl font-bold text-error'>
                Delete Category?
              </h2>
            </div>

            <div className='mb-6 space-y-4'>
              <p className='text-leaf-700'>
                Are you sure you want to delete{' '}
                <strong className='text-brand'>{deletingCategory.name}</strong>?
              </p>

              {deletingCategory._count.sources > 0 && (
                <div className='rounded-lg border-2 border-warn bg-warn/10 p-4'>
                  <p className='font-semibold text-warn'>⚠️ Warning</p>
                  <p className='mt-2 text-sm text-warn/90'>
                    This category has{' '}
                    <strong>{deletingCategory._count.sources}</strong> source
                    {deletingCategory._count.sources !== 1 ? 's' : ''}{' '}
                    associated with it. Deleting this category will also delete
                    all its sources and related data.
                  </p>
                </div>
              )}

              <p className='text-sm text-leaf-600'>
                This action cannot be undone.
              </p>
            </div>

            <div className='flex gap-3'>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className='flex-1 rounded-lg bg-error px-6 py-3 font-semibold text-white hover:bg-error/90 disabled:opacity-50'
              >
                {isSubmitting ? 'Deleting...' : 'Delete Category'}
              </button>
              <button
                onClick={() => setDeletingCategory(null)}
                disabled={isSubmitting}
                className='btn btn-ghost flex-1'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
