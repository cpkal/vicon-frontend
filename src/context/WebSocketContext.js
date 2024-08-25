'use client'
import { useEffect, useState, createContext } from "react";

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
        
    ws.onopen = () => {
      console.log("Connected to server");
      setSocket(ws);
    }

    return () => {
      ws.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={socket}>{children}</WebSocketContext.Provider>
  );
}