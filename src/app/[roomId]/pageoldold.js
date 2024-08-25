'use client'
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

const MultiUserCall = () => {
  const { roomId } = useParams();
  const [peerId, setPeerId] = useState('');
  const peerRef = useRef(null);
  const wsRef = useRef(null);
  const myVideo = useRef();

  useEffect(() => {
    // Initialize PeerJS instance only once
    if (!peerRef.current) {
      peerRef.current = new Peer();

      const peer = peerRef.current;

      // Handle the 'open' event
      peer.on('open', (id) => {
        setPeerId(id);
        console.log('My peer ID: ' + id);
        
        // Connect to the signaling server
        wsRef.current = new WebSocket('ws://localhost:8080');
        wsRef.current.onopen = () => {
          wsRef.current.send(JSON.stringify({ type: 'join', peerId: id  }));
        };

        wsRef.current.onmessage = (message) => {
          const data = JSON.parse(message.data);
          if (data.type === 'peers') {
            // Handle received peer IDs
            const peersInRoom = data.peers.filter((pid) => pid !== id);
            // Connect to peers in room
            connectToPeers(peersInRoom, peer);
          }
        };
      });

      peer.on('call', (call) => {
        navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then((stream) => {
          myVideo.current.srcObject = stream;
          myVideo.current.play();
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            addRemoteVideo(call.peer, remoteStream);
          });
        });
      });
    }

    return () => {
      // Clean up peer instance when component unmounts
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const connectToPeers = (peers, peer) => {
    navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then((stream) => {
      myVideo.current.srcObject = stream;
      myVideo.current.play();

      peers.forEach((remotePeerId) => {
        const call = peer.call(remotePeerId, stream);
        call.on('stream', (remoteStream) => {
          addRemoteVideo(remotePeerId, remoteStream);
        });
      });
    });
  };

  const addRemoteVideo = (peerId, stream) => {
    let videoElement = document.getElementById(`video-${peerId}`);
    if (!videoElement) {
      videoElement = document.createElement('video');
      videoElement.id = `video-${peerId}`;
      videoElement.autoplay = true;
      //add video style and height and width
      videoElement.style.width = '300px';
      videoElement.style.height = '300px';
      videoElement.style.border = '1px solid black';
      document.body.appendChild(videoElement);
    }
    videoElement.srcObject = stream;
    videoElement.play();
  };

  return (
    <div>
      <h3>Your Peer ID: {peerId}</h3>
      <video ref={myVideo} playsInline autoPlay />
    </div>
  );
};

export default MultiUserCall;
