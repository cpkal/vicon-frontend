'use client'
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import './page.module.css';

const MultiUserCall = () => {
  const { roomId } = useParams();
  const [peerId, setPeerId] = useState('');
  const peerRef = useRef(null);
  const [countPeersInRoom, setCountPeersInRoom] = useState(1);
  const wsRef = useRef(null);
  const myVideo = useRef();

  const [cameraStatus, setCameraStatus] = useState(false);
  const [micStatus, setMicStatus] = useState(false);

  useEffect(() => {
    //get status camera and mic from localstorage
    setCameraStatus(localStorage.getItem('isCameraEnabled'));
    setMicStatus(localStorage.getItem('isMicEnabled'));

    // Initialize PeerJS instance only once
    if (!peerRef.current) {
      peerRef.current = new Peer({
        host: 'localhost',
        port: 9000,
        path: '/'
      });

      const peer = peerRef.current;

      // Handle the 'open' event
      peer.on('open', (id) => {
        setPeerId(id);
        console.log('My peer ID: ' + id);
        
        // Connect to the signaling server
        wsRef.current = new WebSocket('ws://localhost:8080');
        wsRef.current.onopen = () => {
          wsRef.current.send(JSON.stringify({ type: 'join', peerId: id, roomId }));
          setPeerId(id);
        };

        wsRef.current.onmessage = (message) => {
          const data = JSON.parse(message.data);
          if (data.type === 'peers') {
            // Handle received peer IDs
            // console.log(data.peers);
            const peersInRoom = data.peers.filter((peer) => peer.peerId !== id);
            console.log("Peers in room ", peersInRoom.length)
            // Connect to peers in room
            setCountPeersInRoom(peersInRoom.length+1);
            connectToPeers(peersInRoom, peer);


            //update micStatus??

          }
        };
      });

      peer.on('call', (call) => {
        navigator.mediaDevices.getUserMedia({ video: false , audio: true }).then((stream) => {
          myVideo.current.srcObject = stream;
          myVideo.current.play();
          console.log('mystream', stream);
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            console.log('remote stream', remoteStream.getAudioTracks())
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
    navigator.mediaDevices.getUserMedia({ video: false , audio: true }).then((stream) => {
      myVideo.current.srcObject = stream;
      myVideo.current.play();

      //initial mic and camera status
      stream.getAudioTracks().forEach((track) => track.enabled = micStatus)
      stream.getVideoTracks().forEach((track) => track.enabled = cameraStatus)

      console.log(stream.getAudioTracks())

      peers.forEach((remotePeer) => {
        const remoteId = remotePeer.peerId;
        const call = peer.call(remoteId, stream);
        call.on('stream', (remoteStream) => {
          addRemoteVideo(remoteId, remoteStream);
        });
      });
    });
  };

  const addRemoteVideo = (peerId, stream) => {
    let div = document.getElementById(`video-${peerId}`)

    if(!div) {
      div = document.createElement('div');
      div.className = 'py-16 px-8 rounded-md';
      div.style.backgroundColor = '#3C4043';
      
      let div2 = document.createElement('div');
      div2.className = 'w-16 h-16 rounded-full bg-cyan-900 text-white mx-auto flex items-center justify-center';
      let p = document.createElement('p');
      p.className = 'text-2xl font-medium';
      p.innerText = 'PG';
      div2.appendChild(p);
      div.appendChild(div2);
      let videoElement = document.getElementById(`video-${peerId}`);
      if (!videoElement) {
        videoElement = document.createElement('video');
        videoElement.id = `video-${peerId}`;
        videoElement.autoplay = true;
        //add video style and height and width
        videoElement.style.width = '300px';
        videoElement.style.height = '300px';
        videoElement.style.border = '1px solid black';
        videoElement.className = 'hidden';
        // document.body.appendChild(videoElement);
      }
      videoElement.srcObject = stream;
      videoElement.play();
      div.appendChild(videoElement);
    }
    
    
    document.getElementById('remote-videos').appendChild(div);

    // document.getElementById('remote-videos').appendChild(videoElement);
    
  };

  const leaveRoom = () => {
    wsRef.current.send(JSON.stringify({ type: 'leave', peerId , roomId }));
  }

  const handleMicStatus = () => {
    setMicStatus(prev => !prev);
    myVideo.current.srcObject.getAudioTracks().forEach((track) => {
      track.enabled = micStatus;
    })
    wsRef.current.send(JSON.stringify({ type: 'toggle-mic', peerId, roomId, micStatus }));
  }

  const handleCameraStatus = () => {
    setCameraStatus(prev => !prev);
    myVideo.current.srcObject.getVideoTracks().forEach((track) => {
      track.enabled = cameraStatus;
    })
  }

  return (
    <div className='h-screen w-screen relative' style={{backgroundColor: '#202124'}}>
      {/* render if connected user is only one */}
      { countPeersInRoom == 1 ? (
        <div className='h-full flex flex-col items-center justify-center'>
          <div className={`w-32 h-32 rounded-full bg-green-900 text-white mx-auto transform -translate-y-4 flex items-center justify-center ${cameraStatus == true ? 'hidden' : ''}`}>
            <p className='text-5xl'>HP</p>
          </div>
          <video ref={myVideo} playsInline autoPlay className={cameraStatus == true ? '' : 'hidden'} />
        </div>
      ) : countPeersInRoom == 0 ? (
        <>
          <div className='h-full flex flex-col items-center justify-center' >
            <div id='remote-video-disabled' className='w-16 h-16 rounded-full bg-green-900 text-white mx-auto transform -translate-y-4 flex items-center justify-center'>
              <p className='text-2xl font-medium'>HP</p>
            </div>
          </div>
          <div className='absolute right-0 bottom-0 mb-16 mr-4'>
            <div style={{backgroundColor: '#3C4043'}} className='px-24 py-14 rounded-md flex flex-col justify-center'>
              <div className={`w-16 h-16 rounded-full bg-cyan-900 text-white mx-auto flex items-center justify-center ${cameraStatus === true ? '' : 'hidden'}`}>
                <p className='text-2xl font-medium'>PG</p>
              </div>
              <video ref={myVideo} playsInline autoPlay className={cameraStatus == true ? 'hidden' : ''} />
            </div>
          </div>
        </>
      ) : (
        <div className='h-full p-8'>
          <div className={`grid grid-cols-4 gap-2`} id='remote-videos'> 
            <div className='py-16 px-8 rounded-md' style={{backgroundColor: '#3C4043'}}>
              <div className='w-16 h-16 rounded-full bg-cyan-900 text-white mx-auto flex items-center justify-center'>
                <p className='text-2xl font-medium'>PG</p>
              </div>
              <video ref={myVideo} playsInline autoPlay className={cameraStatus == true ? '' : 'hidden'} />
            </div>    



          </div>
        </div> 
      ) }
      

      {/* render if connected user is only two */}
      {/* <div className='h-full flex flex-col items-center justify-center'>
        <div className='w-16 h-16 rounded-full bg-green-900 text-white mx-auto transform -translate-y-4 flex items-center justify-center'>
          <p className='text-2xl font-medium'>HP</p>
        </div>
      </div>
      <div className='absolute right-0 bottom-0 mb-16 mr-4'>
        <div style={{backgroundColor: '#3C4043'}} className='px-24 py-14 rounded-md flex flex-col justify-center'>
          <div className='w-16 h-16 rounded-full bg-cyan-900 text-white mx-auto flex items-center justify-center'>
            <p className='text-2xl font-medium'>PG</p>
          </div>
        </div>
      </div> */}

      {/* render if connected user is more than two */}
      {/* <div className='h-full p-8'>
        <div className='grid grid-cols-4 gap-2'>
          <div className='py-16 px-8 rounded-md' style={{backgroundColor: '#3C4043'}}>
            <div className='w-16 h-16 rounded-full bg-cyan-900 text-white mx-auto flex items-center justify-center'>
              <p className='text-2xl font-medium'>PG</p>
            </div>
          </div>
          <div className='py-16 px-8 rounded-md' style={{backgroundColor: '#3C4043'}}>
            <div className='w-16 h-16 rounded-full bg-cyan-900 text-white mx-auto flex items-center justify-center'>
              <p className='text-2xl font-medium'>PG</p>
            </div>
          </div>
          <div className='py-16 px-8 rounded-md' style={{backgroundColor: '#3C4043'}}>
            <div className='w-16 h-16 rounded-full bg-cyan-900 text-white mx-auto flex items-center justify-center'>
              <p className='text-2xl font-medium'>PG</p>
            </div>
          </div>
          <div className='py-16 px-8 rounded-md' style={{backgroundColor: '#3C4043'}}>
            <div className='w-16 h-16 rounded-full bg-cyan-900 text-white mx-auto flex items-center justify-center'>
              <p className='text-2xl font-medium'>PG</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* <img src='/assets/images/gmeet_lobby.png' /> */}

      <div className='absolute bottom-0 left-0 p-4 text-white w-full flex items-center justify-between'>
        <div>
          <p className='text-md font-semibold'>8:35 AM | oco-wssi-pqd</p>  
        </div>
        <div className='flex space-x-4'>

          <div style={{backgroundColor: '#2F3235'}} className='rounded-full flex justify-between' onClick={handleMicStatus}>
            <div className=' py-2 px-1 rounded-full'  >
              <img src='/assets/icons/keyboard_arrow_up.svg' />
            </div>
            <div className='rounded-full p-2 hover:cursor-pointer' style={{backgroundColor: !micStatus ? '#3C4043' : '#EA4335'}}>
              <img src={`/assets/icons/${!micStatus ? 'mic_on' : 'mic_off'}.svg`} />
            </div>
          </div>

          <div style={{backgroundColor: '#2F3235'}} className='rounded-full flex justify-between'>
            <div className=' py-2 px-1 rounded-full'  >
              <img src='/assets/icons/keyboard_arrow_up.svg' />
            </div>
            <div className='rounded-full p-2' style={{backgroundColor: !cameraStatus ? '#3C4043' : '#EA4335'}} onClick={handleCameraStatus}>
              <img src={`/assets/icons/${!cameraStatus ? 'videocam_on' : 'videocam_off'}.svg`} />
            </div>
          </div>

          <button style={{backgroundColor: '#3C4043'}} className='rounded-full p-2'><img src='/assets/icons/closed_caption.svg' /></button>
          <button style={{backgroundColor: '#3C4043'}} className='rounded-full p-2'><img src='/assets/icons/mood.svg' /></button>
          <button style={{backgroundColor: '#3C4043'}} className='rounded-full p-2'><img src='/assets/icons/present_to_all.svg' /></button>
          <button style={{backgroundColor: '#3C4043'}} className='rounded-full p-2'><img src='/assets/icons/back_hand.svg' /></button>
          <button style={{backgroundColor: '#EA4335'}} className='rounded-full py-2 px-4' onClick={leaveRoom}><img src='/assets/icons/call_end.svg' /></button>
        </div>
        <div className='flex space-x-4'>
          <button>
            <img src='/assets/icons/info.svg' />
          </button>
          <button>
            <img src='/assets/icons/group.svg' />
          </button>
          <button>
            <img src='/assets/icons/chat.svg' />
          </button>
          <button>
            <img src='/assets/icons/category.svg' />
          </button>
          <button>
            <img src='/assets/icons/lock_person.svg' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiUserCall;
