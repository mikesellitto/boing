// Modular push notification service
import webpush from 'web-push';
import { config } from './config';

export interface PushSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  timestamp?: number;
  data?: any;
}

export interface PushOptions {
  ttl?: number;
  urgency?: 'very-low' | 'low' | 'normal' | 'high';
  topic?: string;
}

export class PushService {
  private static instance: PushService;
  private vapidConfigured = false;
  
  private constructor() {}
  
  public static getInstance(): PushService {
    if (!PushService.instance) {
      PushService.instance = new PushService();
    }
    return PushService.instance;
  }
  
  public configureVapid(): void {
    if (this.vapidConfigured) return;
    
    if (!config.vapid.publicKey || !config.vapid.privateKey) {
      throw new Error('VAPID keys not configured');
    }
    
    try {
      webpush.setVapidDetails(
        config.vapid.email,
        config.vapid.publicKey,
        config.vapid.privateKey
      );
      this.vapidConfigured = true;
      console.log('VAPID configured successfully');
    } catch (error) {
      console.error('VAPID setup error:', error);
      throw error;
    }
  }
  
  public async sendNotification(
    subscription: PushSubscription,
    payload: PushPayload,
    options?: PushOptions
  ): Promise<void> {
    this.configureVapid();
    
    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || config.ui.iconUrl,
      badge: payload.badge || config.ui.badgeUrl,
      timestamp: payload.timestamp || Date.now(),
      data: {
        url: payload.url || '/',
        ...payload.data
      }
    });
    
    const pushOptions = {
      TTL: options?.ttl ?? config.push.ttl,
      urgency: options?.urgency || config.push.urgency as any,
      topic: options?.topic
    };
    
    return webpush.sendNotification(subscription, pushPayload, pushOptions);
  }
  
  public async sendToMultiple(
    subscriptions: PushSubscription[],
    payload: PushPayload,
    options?: PushOptions
  ): Promise<{ sent: number; failed: number; invalidSubscriptions: PushSubscription[] }> {
    let sent = 0;
    let failed = 0;
    const invalidSubscriptions: PushSubscription[] = [];
    
    for (const subscription of subscriptions) {
      try {
        await this.sendNotification(subscription, payload, options);
        sent++;
        console.log('Successfully sent push notification');
      } catch (error: any) {
        console.error('Push send error:', error.message);
        failed++;
        
        // Track invalid subscriptions for removal
        if (error.statusCode === 410 || error.statusCode === 404) {
          invalidSubscriptions.push(subscription);
        }
      }
    }
    
    return { sent, failed, invalidSubscriptions };
  }
}