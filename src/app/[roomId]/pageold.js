'use client'
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
// import { useWebsocket } from "@/hooks/websocket";
import Peer from "peerjs";
import { usePeer } from "@/hooks/peer";

export default function RoomPage() {
  const { roomId } = useParams();
  const [peerId, setPeerId] = useState(null);
  // const [remoteId, setRemoteId] = useState('');

  const [peersInRoom, setPeersInRoom] = useState([]);

  const localVideoRef = useRef();
  const peerConnections = useRef({});

  // const remoteVideoRef = useRef();
  const peer = useRef();
  // const socket = useWebsocket();

  useEffect(() => {
    // if (!socket) return;

    peer.current = usePeer();

    peer.current.on('open', (id) => {
      setPeerId(id);
      console.log('Peer id:', id);
      //join room
      joinRoom(id);
    })

    peer.current.on('call', (call) => {
      navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        .then((stream) => {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play();
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            // remoteVideoRef.current.srcObject = remoteStream;
            // remoteVideoRef.current.play();

            addRemoteVideo(remoteStream);
          })
        })
    })
  }, []);

  const joinRoom = (id) => {
    const roomPeers = ['peerB', 'peerC']; // Example peer IDs
    setPeersInRoom(roomPeers);

    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then((stream) => {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play();

      roomPeers.forEach((remotePeerId) => {
        const call = peer.current.call(remotePeerId, stream);
        peerConnections.current[remotePeerId] = call;
        
        call.on('stream', (remoteStream) => {
          // remoteVideoRef.current.srcObject = remoteStream;
          // remoteVideoRef.current.play();

          addRemoteVideo(remotePeerId, remoteStream);
        })
      })
    })
  }

  const addRemoteVideo = (remotePeerId, stream) => {
    const video = document.createElement('video');
    video.id = `remote-video-${remotePeerId}`;
    video.srcObject = stream;
    video.playsInline = true;
    video.autoPlay = true;
    video.className = 'border border-gray-900';
    document.body.appendChild(video);
  }

  // const callPeer = (remoteId) => {
  //   navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
  //     .then((stream) => {
  //       localVideoRef.current.srcObject = stream;
  //       localVideoRef.current.play();
  //       const call = peer.current.call(remoteId, stream);
  //       call.on('stream', (remoteStream) => {
  //         remoteVideoRef.current.srcObject = remoteStream;
  //         remoteVideoRef.current.play();
  //       })
  //     })
  // }

  return (
    <main>
      <div>
        <h3>Your Peer ID: {peerId}</h3>
        {/* <input 
          type="text" 
          value={remoteId} 
          onChange={(e) => setRemoteId(e.target.value)} 
          placeholder="Enter peer ID to call"
        />
        <button onClick={() => callPeer(remoteId)}>Call</button> */}
      </div>
      <video ref={localVideoRef} playsInline autoPlay className="border border-gray-900"></video>
      {/* <video ref={remoteVideoRef} playsInline autoPlay className="border border-gray-900"></video> */}
    </main>
  );
}