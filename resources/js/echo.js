import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Debug log for environment variables (only in development)
if (import.meta.env.DEV) {
    console.log('Pusher Key:', import.meta.env.VITE_PUSHER_APP_KEY);
}

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY || '83e3a0d0037a6dc1f7b8', // Fallback to provided key
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap1',
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
});
