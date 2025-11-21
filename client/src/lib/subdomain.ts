/**
 * Detect which app to show based on subdomain
 * store.joystick.ee -> store
 * forum.joystick.ee -> forum
 * joystick.ee -> landing (default)
 */
export function getAppType(): 'store' | 'forum' | 'landing' {
  if (typeof window === 'undefined') {
    return 'landing';
  }

  const hostname = window.location.hostname;
  
  if (hostname.startsWith('forum.') || hostname.startsWith('forum-')) {
    return 'forum';
  }
  
  if (hostname.startsWith('store.') || hostname.startsWith('store-')) {
    return 'store';
  }

  // Default to landing for root domain
  return 'landing';
}

export function isStoreApp(): boolean {
  return getAppType() === 'store';
}

export function isForumApp(): boolean {
  return getAppType() === 'forum';
}

export function isLandingApp(): boolean {
  return getAppType() === 'landing';
}
