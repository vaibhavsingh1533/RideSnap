import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Connect to the socket server
    // For Vercel/Render support, use VITE_BACKEND_URL or default to localhost:5000 in dev
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    
    const socketInstance = io(backendUrl, {
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketInstance.connect();

    socketInstance.on('connect', () => {
      setConnected(true);
      // console.log('Socket connected:', socketInstance.id);
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
      // console.log('Socket disconnected');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Register user with socket whenever user state changes
  useEffect(() => {
    if (socket && connected && user) {
      socket.emit('register_user', {
        userId: user.id,
        role: user.role
      });
    }
  }, [socket, connected, user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export default SocketContext;
