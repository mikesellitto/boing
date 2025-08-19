// Configuration module for Boing
// All environment variables and settings are centralized here

export const config = {
  // VAPID Configuration
  vapid: {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC || '',
    privateKey: process.env.VAPID_PRIVATE || '',
    email: process.env.VAPID_EMAIL || 'mailto:admin@example.com'
  },
  
  // Authentication
  auth: {
    token: process.env.AUTH_TOKEN || '',
    enableAuth: process.env.ENABLE_AUTH !== 'false' // Default true
  },
  
  // Push notification settings
  push: {
    ttl: parseInt(process.env.PUSH_TTL || '0'), // 0 = immediate delivery
    urgency: process.env.PUSH_URGENCY || 'high', // high, normal, low, very-low
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.RETRY_DELAY || '1000') // milliseconds
  },
  
  // Storage settings
  storage: {
    maxNotifications: parseInt(process.env.MAX_NOTIFICATIONS || '100'),
    maxSubscriptions: parseInt(process.env.MAX_SUBSCRIPTIONS || '1000')
  },
  
  // UI settings
  ui: {
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'Boing',
    appDescription: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Real-time push notifications',
    iconUrl: process.env.NEXT_PUBLIC_ICON_URL || '/icon-192.png',
    badgeUrl: process.env.NEXT_PUBLIC_BADGE_URL || '/badge-72.png'
  }
};

// Validation function
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.vapid.publicKey) {
    errors.push('NEXT_PUBLIC_VAPID_PUBLIC is required');
  }
  
  if (!config.vapid.privateKey) {
    errors.push('VAPID_PRIVATE is required');
  }
  
  if (config.auth.enableAuth && !config.auth.token) {
    errors.push('AUTH_TOKEN is required when authentication is enabled');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}