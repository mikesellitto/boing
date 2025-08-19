import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { config } from '@/lib/config';

export async function POST(request: Request) {
  try {
    // Check authentication if enabled
    if (config.auth.enableAuth) {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (token !== config.auth.token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Clear all notifications
    await kv.set('notifications', []);
    
    return NextResponse.json({ 
      status: 'cleared',
      message: 'All notifications cleared'
    });
  } catch (error) {
    console.error('Clear error:', error);
    return NextResponse.json({ error: 'Failed to clear notifications' }, { status: 500 });
  }
}