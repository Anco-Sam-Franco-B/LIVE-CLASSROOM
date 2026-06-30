import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io('/', {
      auth: { token: localStorage.getItem('accessToken') },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
    socket.on('connect_error', () => {});
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function listenPaymentEvents(handlers = {}) {
  const s = getSocket();
  const events = ['payment:created', 'payment:success', 'payment:failed', 'payment:refunded'];
  events.forEach(event => {
    if (handlers[event]) s.on(event, handlers[event]);
  });
  return () => events.forEach(event => s.off(event));
}

export function listenDashboardEvents(handlers = {}) {
  const s = getSocket();
  const events = ['dashboard:update', 'enrollment:new', 'payment:success', 'payment:refunded'];
  events.forEach(event => {
    if (handlers[event]) s.on(event, handlers[event]);
  });
  return () => events.forEach(event => s.off(event));
}
