import Peer from 'peerjs';

let peerInstance = null;

export const usePeer = (id) => {
  if (!peerInstance) {
    peerInstance = new Peer(id, {
      host: 'localhost', // Replace with your server or signaling server URL
      port: 9000, // Replace with your port or signaling server port
      path: '/' // Default path for PeerJS server
    });
  }
  return peerInstance;
};
