import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000'; // Adjust to your backend port

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true
});

export const connectSocket = (tenantKey) => {
  if (!socket.connected) {
    socket.connect();
    socket.emit('join_tenant', tenantKey);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
