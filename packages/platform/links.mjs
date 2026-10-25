/** Resolve sibling apps without hard-coding a school or activating future DNS. */
export function siblingAppUrl(target, location, override) {
  if (!['crm', 'teacher'].includes(target)) return null;
  if (override) {
    try {
      const url = new URL(override);
      if (['http:', 'https:'].includes(url.protocol)) return url.href;
    } catch { /* Invalid deployment setting: fall back to known host patterns. */ }
  }
  const url = new URL(location.href);
  if (['localhost', '127.0.0.1'].includes(url.hostname)) {
    url.port = target === 'crm' ? '5173' : '5174';
  } else if (/^(crm|teacher)\./.test(url.hostname)) {
    url.hostname = url.hostname.replace(/^(crm|teacher)\./, `${target}.`);
  } else {
    return null;
  }
  url.pathname = '/'; url.search = ''; url.hash = '';
  return url.href;
}
