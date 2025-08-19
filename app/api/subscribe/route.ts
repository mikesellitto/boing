import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { config } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const subscription = await request.json();
    
    // Validate subscription format
    if (!subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ 
        error: 'Invalid subscription format' 
      }, { status: 400 });
    }
    
    // Store subscription in Vercel KV
    const subscriptions = await kv.get<any[]>('subscriptions') || [];
    
    // Check if already exists
    const exists = subscriptions.find((s: any) => s.endpoint === subscription.endpoint);
    if (!exists) {
      // Limit subscriptions
      if (subscriptions.length >= config.storage.maxSubscriptions) {
        return NextResponse.json({ 
          error: 'Maximum subscriptions reached' 
        }, { status: 429 });
      }
      
      subscriptions.push(subscription);
      await kv.set('subscriptions', subscriptions);
    }
    
    return NextResponse.json({ 
      status: 'subscribed',
      total: subscriptions.length 
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}