'use client';

import React, { createContext, useContext, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface ISocketContext {
  connectSocket: () => void;
  disconnectSocket: () => void;
  getSocket: () => Socket | null;
}

const SocketContext = createContext<ISocketContext | null>(null);

export const useSocket = (): ISocketContext => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);

  const connectSocket = () => {
    if (!socketRef.current) {
      console.log("connected")
      socketRef.current = io('https://campusbites-mxpe.onrender.com');

      socketRef.current.on("connect", () => {
        console.log("Socket connected:", socketRef.current?.id);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    }
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const getSocket = () => socketRef.current;

  return (
    <SocketContext.Provider value={{ connectSocket, disconnectSocket, getSocket }}>
      {children}
    </SocketContext.Provider>
  );
};
