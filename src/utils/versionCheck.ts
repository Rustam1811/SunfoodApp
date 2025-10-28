/**
 * Version checking and auto-update system for production
 * Checks for new app version every 30 seconds and auto-updates
 */

let lastVersionCheck = 0;
const CHECK_INTERVAL = 30000; // 30 seconds

interface VersionInfo {
  version: string;
  timestamp: number;
}

/**
 * Get current version from manifest or meta tag
 */
function getCurrentVersion(): string {
  // Try to get from meta tag first (updated on each build)
  const metaTag = document.querySelector('meta[name="app-version"]');
  if (metaTag) {
    return metaTag.getAttribute('content') || 'unknown';
  }
  // Fallback to timestamp-based version
  return `v${Date.now()}`;
}

/**
 * Fetch version info from server
 */
async function getServerVersion(): Promise<VersionInfo> {
  try {
    const response = await fetch('/version.json', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('[Version Check] Failed to fetch server version:', error);
    throw error;
  }
}

/**
 * Perform version check and reload if update available
 */
export async function checkForUpdates(): Promise<void> {
  const now = Date.now();

  // Rate limit: only check every 30 seconds
  if (now - lastVersionCheck < CHECK_INTERVAL) {
    return;
  }

  lastVersionCheck = now;

  try {
    const currentVersion = getCurrentVersion();
    const serverVersion = await getServerVersion();

    console.log(
      `[Version Check] Current: ${currentVersion}, Server: ${serverVersion.version}`
    );

    // If versions differ, reload with cache busting
    if (currentVersion !== serverVersion.version) {
      console.log('[Version Check] New version available! Updating...');

      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('[Version Check] Cleared all caches');
      }

      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
        console.log('[Version Check] Unregistered service workers');
      }

      // Show notification before reload
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('SunFood обновляется', {
          body: 'Новая версия загружена. Приложение перезагружается...',
          icon: '/favicon.png'
        });
      }

      // Reload with cache busting
      window.location.href = `${window.location.origin}${window.location.pathname}?v=${serverVersion.timestamp}`;
    }
  } catch (error) {
    console.debug('[Version Check] Check failed (will retry):', error);
    // Silent fail - retry next time
  }
}

/**
 * Start automatic version checking
 */
export function startAutoVersionCheck(): void {
  // Check immediately on app start
  checkForUpdates();

  // Check every 30 seconds
  setInterval(() => {
    checkForUpdates();
  }, CHECK_INTERVAL);

  // Also check when user returns to tab
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // User came back to tab
      console.log('[Version Check] User returned to tab, checking for updates...');
      checkForUpdates();
    }
  });

  // Check when online status changes
  window.addEventListener('online', () => {
    console.log('[Version Check] Back online, checking for updates...');
    checkForUpdates();
  });
}
