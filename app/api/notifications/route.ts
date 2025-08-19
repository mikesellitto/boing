import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { config } from '@/lib/config';

export async function GET(request: Request) {
  try {
    // Check authentication if enabled
    if (config.auth.enableAuth) {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (token !== config.auth.token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const notifications = await kv.get<any[]>('notifications') || [];
    
    return NextResponse.json({ 
      notifications,
      count: notifications.length 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 });
  }
}