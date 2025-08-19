'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
  }
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Now using local Vercel API routes - no external backend needed!

  useEffect(() => {
    const savedToken = localStorage.getItem('notifyToken');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      checkSubscription();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated]);

  const authenticate = () => {
    if (!token) return;
    localStorage.setItem('notifyToken', token);
    setIsAuthenticated(true);
    checkSubscription();
    loadHistory();
  };

  const logout = () => {
    localStorage.removeItem('notifyToken');
    setIsAuthenticated(false);
    setToken('');
    setNotifications([]);
    setStatus('');
  };

  const checkSubscription = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    }
  };

  const enablePush = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('❌ Permission denied');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Get VAPID key from backend
      const infoRes = await fetch('/api/info');
      const info = await infoRes.json();

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(info.vapidPublicKey)
      });

      // Send subscription to backend
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subscription)
      });

      if (res.ok) {
        setIsSubscribed(true);
        setStatus('✅ Push notifications enabled!');
      }
    } catch (error) {
      setStatus(`❌ Error: ${(error as Error).message}`);
    }
  };

  const resetSubscriptions = async () => {
    try {
      setStatus('🔄 Resetting subscriptions...');
      
      // First, unsubscribe locally
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }
      
      // Clear all subscriptions on server
      const clearRes = await fetch('/api/clear-subscriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!clearRes.ok) {
        throw new Error('Failed to clear server subscriptions');
      }
      
      setIsSubscribed(false);
      setStatus('✅ Subscriptions cleared! Click subscribe to re-register.');
    } catch (error) {
      setStatus(`❌ Error: ${(error as Error).message}`);
    }
  };

  const sendNotification = async () => {
    if (!message) return;

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message,
          title: 'Notification'
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setStatus(`✅ Sent to ${data.sent} devices`);
        setMessage('');
        loadHistory();
      } else {
        setStatus(`❌ ${data.error}`);
        // If unauthorized, clear the stored token
        if (res.status === 401) {
          logout();
        }
      }
    } catch {
      setStatus('❌ Failed to send');
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      console.error('Failed to load history');
    }
  };

  const quickSend = (text: string) => {
    setMessage(text);
    setTimeout(() => sendNotification(), 100);
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="token"
            className="w-full bg-zinc-900 text-white px-4 py-3 rounded-lg outline-none focus:bg-zinc-800 mb-2"
            onKeyPress={(e) => e.key === 'Enter' && authenticate()}
          />
          <button
            onClick={authenticate}
            className="w-full bg-zinc-900 text-white py-3 rounded-lg hover:bg-zinc-800 transition"
          >
            connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-xl mx-auto pt-8">
        {/* Input and Send */}
        <div className="flex gap-2 mb-4">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="message"
            className="flex-1 bg-zinc-900 text-white px-4 py-3 rounded-lg outline-none focus:bg-zinc-800"
            onKeyPress={(e) => e.key === 'Enter' && sendNotification()}
          />
          <button
            onClick={sendNotification}
            className="bg-zinc-900 text-white px-6 py-3 rounded-lg hover:bg-zinc-800 transition"
          >
            send
          </button>
        </div>

        {/* Feed */}
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div key={notif.id} className="bg-zinc-900 p-3 rounded-lg">
              <div className="text-zinc-400 text-xs">{new Date(notif.timestamp).toLocaleTimeString()}</div>
              <div className="text-white">{notif.message}</div>
            </div>
          ))}
        </div>

        {/* Status message */}
        {status && (
          <div className="fixed top-4 left-4 right-4 text-center text-sm text-zinc-400">
            {status}
          </div>
        )}

        {/* Bottom controls */}
        <div className="fixed bottom-4 left-4 right-4 flex justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={enablePush}
              disabled={isSubscribed}
              className={`text-sm ${
                isSubscribed 
                  ? 'text-zinc-600' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {isSubscribed ? 'subscribed' : 'subscribe'}
            </button>
            
            <button
              onClick={resetSubscriptions}
              className="text-sm text-red-400 hover:text-red-300"
            >
              reset subs
            </button>
          </div>
          
          <button
            onClick={logout}
            className="text-zinc-600 hover:text-zinc-400 text-sm"
          >
            logout
          </button>
        </div>
      </div>
    </div>
  );
}