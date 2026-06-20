export function generateTitle(pageTitle?: string): string {
  const baseTitle = 'Fermidas';
  return pageTitle ? `${pageTitle} | ${baseTitle}` : baseTitle;
}

export function generateDescription(description?: string): string {
  return (
    description ||
    'Trusted compliance and governance advisory services. We help organisations thrive in complex regulatory environments with technical expertise and ethical leadership.'
  );
}
