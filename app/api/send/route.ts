import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { PushService } from '@/lib/push-service';
import { config, validateConfig } from '@/lib/config';

export async function POST(request: Request) {
  // Validate configuration
  const configValidation = validateConfig();
  if (!configValidation.valid) {
    console.error('Configuration errors:', configValidation.errors);
    return NextResponse.json({ 
      error: 'Server misconfigured', 
      details: configValidation.errors 
    }, { status: 500 });
  }
  
  try {
    // Check authentication
    if (config.auth.enableAuth) {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (token !== config.auth.token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { message, title = 'Notification', url, data } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }
    
    // Save to history
    const notifications = await kv.get<any[]>('notifications') || [];
    const notification = {
      id: Date.now().toString(),
      title,
      message,
      timestamp: new Date().toISOString(),
      url,
      data
    };
    
    notifications.unshift(notification);
    if (notifications.length > config.storage.maxNotifications) {
      notifications.splice(config.storage.maxNotifications);
    }
    await kv.set('notifications', notifications);
    
    // Get subscriptions
    const subscriptions = await kv.get<any[]>('subscriptions') || [];
    
    if (subscriptions.length === 0) {
      return NextResponse.json({
        status: 'no_subscribers',
        message: 'No active subscriptions',
        id: notification.id
      });
    }
    
    // Send push notifications
    const pushService = PushService.getInstance();
    const result = await pushService.sendToMultiple(
      subscriptions,
      {
        title,
        body: message,
        url,
        data
      }
    );
    
    // Remove invalid subscriptions
    if (result.invalidSubscriptions.length > 0) {
      const validSubscriptions = subscriptions.filter(sub => 
        !result.invalidSubscriptions.some(invalid => 
          invalid.endpoint === sub.endpoint
        )
      );
      await kv.set('subscriptions', validSubscriptions);
    }
    
    return NextResponse.json({
      status: 'sent',
      sent: result.sent,
      failed: result.failed,
      total: subscriptions.length,
      id: notification.id
    });
  } catch (error) {
    console.error('Send error:', error);
    return NextResponse.json({ 
      error: 'Failed to send notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}