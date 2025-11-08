'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    // In production, replace with your Socket.io server URL
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const joinSportRoom = (sport: string) => {
  const socket = getSocket();
  socket.emit('join-sport', sport);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onScoreUpdate = (callback: (data: any) => void) => {
  const socket = getSocket();
  socket.on('update', callback);
  return () => socket.off('update', callback);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

