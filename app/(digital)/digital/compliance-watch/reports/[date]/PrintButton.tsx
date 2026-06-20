'use client';

export function PrintButton() {
  return (
    <button
      type='button'
      onClick={() => window.print()}
      className='print:hidden rounded-lg border border-leaf-300 px-4 py-2 text-sm font-medium text-brand hover:bg-leaf-50'
    >
      Print
    </button>
  );
}
