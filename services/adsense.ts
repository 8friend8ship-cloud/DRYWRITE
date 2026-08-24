const ADSENSE_SCRIPT_ID = 'google-adsense-script';
const ADMIN_GUARD_STYLE_ID = 'drywrite-admin-ad-guard';
const DEFAULT_ADSENSE_CLIENT = 'ca-pub-2826263278655860';
const DEFAULT_EXCLUDED_PATHS = ['/login', '/settings', '/privacy', '/terms', '/api'];

function env(name: string): string {
  const value = (import.meta as any)?.env?.[name];
  return typeof value === 'string' ? value.trim() : '';
}

export function getAdSenseClient(): string {
  return env('VITE_ADSENSE_CLIENT') || DEFAULT_ADSENSE_CLIENT;
}

export function isValidAdSenseClient(client = getAdSenseClient()): boolean {
  return /^ca-pub-\d+$/.test(client);
}

export function getExcludedAdPaths(): string[] {
  const configured = env('VITE_ADSENSE_EXCLUDED_PATHS');
  if (!configured) return DEFAULT_EXCLUDED_PATHS;
  return configured.split(',').map((value) => value.trim()).filter(Boolean);
}

export function isAdSensePathAllowed(pathname?: string): boolean {
  if (typeof window === 'undefined' && !pathname) return false;
  const currentPath = pathname ?? window.location.pathname;
  return !getExcludedAdPaths().some((blockedPath) =>
    currentPath === blockedPath || currentPath.startsWith(`${blockedPath}/`),
  );
}

function isAdminSurface(): boolean {
  if (typeof document === 'undefined') return false;
  return Array.from(document.querySelectorAll('h1')).some(
    (heading) => heading.textContent?.trim() === 'Admin Panel',
  );
}

function syncAdminAdGuard(): void {
  if (typeof document === 'undefined') return;
  const existingStyle = document.getElementById(ADMIN_GUARD_STYLE_ID);

  if (isAdminSurface()) {
    document.getElementById(ADSENSE_SCRIPT_ID)?.remove();
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = ADMIN_GUARD_STYLE_ID;
      style.textContent = [
        '.adsbygoogle',
        'ins.adsbygoogle',
        'iframe[src*="googlesyndication"]',
        'iframe[src*="doubleclick"]',
        '[id^="google_ads"]',
        '[class*="google-auto-placed"]',
      ].join(',') + '{display:none!important;visibility:hidden!important;pointer-events:none!important;}';
      document.head.appendChild(style);
    }
    return;
  }

  existingStyle?.remove();
}

function installAdminSurfaceObserver(): void {
  if (typeof document === 'undefined') return;
  if ((window as any).__drywriteAdminAdGuardInstalled) return;
  (window as any).__drywriteAdminAdGuardInstalled = true;

  const observer = new MutationObserver(syncAdminAdGuard);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  syncAdminAdGuard();
}

export function installAdSense(): boolean {
  if (typeof document === 'undefined' || typeof window === 'undefined') return false;
  installAdminSurfaceObserver();
  syncAdminAdGuard();
  if (isAdminSurface()) return false;

  const client = getAdSenseClient();
  if (!isValidAdSenseClient(client) || !isAdSensePathAllowed()) return false;
  if (document.getElementById(ADSENSE_SCRIPT_ID)) return true;

  const script = document.createElement('script');
  script.id = ADSENSE_SCRIPT_ID;
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  document.head.appendChild(script);
  return true;
}
