import webpush from 'web-push';

const vapidKeys = webpush.generateVAPIDKeys();

console.log('New VAPID keys generated:\n');
console.log('NEXT_PUBLIC_VAPID_PUBLIC=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE=' + vapidKeys.privateKey);
console.log('\nAdd these to Vercel environment variables');