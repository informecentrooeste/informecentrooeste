export function getImageUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/')) return `/api${url}`;
  return url;
}
