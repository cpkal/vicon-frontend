import { useContext } from 'react';
import { WebSocketContext } from '@/context/WebsocketContext';

export const useWebsocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebsocket must be used within a WebSocketProvider');
  }

  return context;
}

