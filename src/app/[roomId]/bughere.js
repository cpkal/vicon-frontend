'use client'
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import ParticipantModal from '@/components/Room/ParticipantModal';
import RoomDetailModal from '@/components/Room/RoomDetailModal';
import { usePeer } from '@/hooks/peer';
import { ACTION_TYPES } from '@/constants/room/actionTypes';

const Room = () => {
  const { roomId } = useParams();
  const [peerId, setPeerId] = useState('');
  const peerRef = useRef(null);
  const [xPeers, setxPeers] = useState(null);
  const [countPeersInRoom, setCountPeersInRoom] = useState(1);
  const wsRef = useRef(null);
  const myVideo = useRef();
  const myPresentation = useRef();
  const [isPresenting, setIsPresenting] = useState(false);
  const presentingRef = useRef();
  const [presentationStream, setPresentationStream] = useState(null);
  const [showRoomDetailModal, setShowRoomDetailModal] = useState(false);
  const [showPeopleModal, setShowPeopleModal] = useState(false);

  const [cameraStatus, setCameraStatus] = useState(false);
  const [micStatus, setMicStatus] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setCameraStatus(localStorage.getItem('isCameraEnabled'));
    setMicStatus(localStorage.getItem('isMicEnabled'));

    if (!peerRef.current) {
      peerRef.current = new Peer(
        { host: 'localhost', port: 9000, path: '/' }
      )

      peerRef.current.on('open', (id) => {
        setPeerId(id);

        wsRef.current = new WebSocket('ws://localhost:8080');
        wsRef.current.onopen = () => {
          wsRef.current.send(JSON.stringify({ type: 'join', peerId: id, roomId }));
          setPeerId(id);
        };

        wsRef.current.onmessage = (message) => {
          const data = JSON.parse(message.data);
          console.log('ahahah', data);

          switch (data.type) {
            case ACTION_TYPES.PARTICIPANTS:
              const peersInRoom = data.peers.filter((peer) => peer.peerId !== id);
              setxPeers(peersInRoom);
              setCountPeersInRoom(peersInRoom.length+1);
              connectToPeers(peersInRoom, peerRef.current);
              break;

            case ACTION_TYPES.LEAVE_ROOM:
              console.log('xdding');
              const remoteVideo = document.getElementById(`video-${data.peerId}`); 
              if(remoteVideo) remoteVideo.remove();
              break;

            case ACTION_TYPES.RAISE_HAND:
              const audio = new Audio('/assets/sounds/meet_raise_hand.mp3');
              audio.play();
              break;

            default:
              break;
          }
        };
      });

      peerRef.current.on('call', (call) => {
        navigator.mediaDevices.getUserMedia({ video: false , audio: true }).then((stream) => {
          myVideo.current.srcObject = stream;
          myVideo.current.play();
          call.answer(stream);
          call.on('stream', (remoteStream) => {     
            let xd = isPresenting;
            wsRef.current.onmessage = async (message) => {
              const data = JSON.parse(message.data);
              presentingRef.current = data;

              if(data.type === 'peers-presentation-stopped') {
                setIsPresenting(false);
                // myVideo.current.srcObject = stream;
                myPresentation.current.srcObject = null;
                myPresentation.current.className = 'hidden';
                // myVideo.current.play();
              }
            }  
            
            
            const video = document.getElementById('presentation');
            
            if(presentingRef.current?.isPresentation && presentingRef.current?.type === 'peers-presentation') {
              video.className = '';
              video.srcObject = remoteStream;

            }
            
            video.play();

            // setIsPresenting(true);

            // document.body.appendChild(video);
            // addRemoteVideo(call.peer, remoteStream);
          });
          
        });
      });
    }

    return () => {
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
    navigator.mediaDevices.getUserMedia({ video: true , audio: true }).then((stream) => {
      myVideo.current.srcObject = stream;
      myVideo.current.play();

      //initial mic and camera status
      stream.getAudioTracks().forEach((track) => track.enabled = micStatus)
      stream.getVideoTracks().forEach((track) => track.enabled = cameraStatus)

      peers.forEach((remotePeer) => {
        const remoteId = remotePeer.peerId;
        const call = peer.call(remoteId, stream);
        call.on('stream', (remoteStream) => {
          addRemoteVideo(remoteId, remoteStream);
        });
      });
    }).catch((error) => {
      console.log('No camera found, switch to audio only');
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        myVideo.current.srcObject = stream;
        myVideo.current.play();

        stream.getAudioTracks().forEach((track) => track.enabled = micStatus)

        peers.forEach((remotePeer) => {
          const remoteId = remotePeer.peerId;
          const call = peer.call(remoteId, stream);
          call.on('stream', (remoteStream) => {
            addRemoteVideo(remoteId, remoteStream);
          });
        });
      })
    })
  };

  const addRemoteVideo = (peerId, stream) => {
    let div = document.getElementById(`video-${peerId}`)

    if(!div) {
      div = document.createElement('div');
      div.id = `video-${peerId}`;
      div.className = 'py-16 px-8 rounded-md';
      div.style.backgroundColor = '#3C4043';
      
      let div2 = document.createElement('div');
      div2.className = 'w-16 h-16 rounded-full bg-cyan-900 text-white mx-auto flex items-center justify-center';
      let p = document.createElement('p');
      p.className = 'text-2xl font-medium';
      p.innerText = 'PG';
      div2.appendChild(p);
      div.appendChild(div2);

      let videoElement = document.createElement('video');
      videoElement.id = `video-${peerId}`;
      videoElement.autoplay = true;
      //add video style and height and width
      videoElement.style.width = '300px';
      videoElement.style.height = '300px';
      videoElement.style.border = '1px solid black';
      videoElement.className = 'hidden';
      videoElement.srcObject = stream;
      videoElement.play();
      div.appendChild(videoElement);
    }
    
    document.getElementById('remote-videos').appendChild(div);    
  };

  const addPresentationVideo = (remoteId, remoteStream) => {
    const presentation = document.getElementById('presentation');
    myVideo.current.srcObject = remoteStream;
  }

  const handleLeaveRoom = () => {
    wsRef.current.send(JSON.stringify({ type: 'leave', peerId , roomId }));
    router.push('/');
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

  const handlePresentation = () => {
    const screenPeer = new Peer({
      host: 'localhost',
      port: 9000,
      path: '/'
    });

    screenPeer.on('open', (id) => {
      screenPeer.on('data', function(data) {
        console.log('Received', data);
      })
    })
    
    navigator.mediaDevices.getDisplayMedia({video: true, audio: false}).then(stream => {
      myPresentation.current.srcObject = stream;
      myPresentation.current.play();
      setIsPresenting(true);
      setPresentationStream(stream);

      xPeers.forEach((remotePeer) => {
        const remoteId = remotePeer.peerId;
        const call = screenPeer.call(remoteId, stream);
        call.on('stream', (remoteStream) => {
          addPresentationVideo(remoteId, remoteStream);
        })
      })
      
      wsRef.current.send(JSON.stringify({ type: 'presentation-stream', peerId, roomId, stream }))
 
    })
  }

  const handleRaiseHand = () => {
    wsRef.current.send(JSON.stringify({ type: 'raise-hand', peerId, roomId }));
  }


  useEffect(() => {
  }, [isPresenting])

  useEffect(() => {
    if(presentationStream) {
      presentationStream.getVideoTracks()[0].addEventListener('ended', () => {
        myPresentation.current.srcObject = null;
        myPresentation.current.className = 'hidden';

        wsRef.current.send(JSON.stringify({ type: 'presentation-stopped', peerId, roomId }))
      })
    }
  }, [presentationStream])

  return (
    <div className='h-screen w-screen relative' style={{backgroundColor: '#202124'}}>
      {/* presentation component */}
      <div className='' style={{backgroundColor: '#202124'}}>
        <video ref={myPresentation} playsInline autoPlay className={isPresenting ? '' : 'hidden'} id='presentation' />
      </div>

      {/* render if connected user is only one */}
      { countPeersInRoom == 1 ? (
        <div className='h-full flex flex-col items-center justify-center'>
          <div className={`w-32 h-32 rounded-full bg-green-900 text-white mx-auto transform -translate-y-4 flex items-center justify-center ${cameraStatus == true ? 'hidden' : ''}`}>
            <p className='text-5xl'>HP</p>
          </div>
          <video ref={myVideo} playsInline autoPlay className={cameraStatus == true ? '' : 'hidden'} />
        </div>
      ) : countPeersInRoom == 0 ? (
        // not used yet
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
          <button style={{backgroundColor: '#3C4043'}} className='rounded-full p-2' onClick={handlePresentation}><img src='/assets/icons/present_to_all.svg' /></button>
          <button style={{backgroundColor: '#3C4043'}} className='rounded-full p-2' onClick={handleRaiseHand}><img src='/assets/icons/back_hand.svg'  /></button>
          <button style={{backgroundColor: '#EA4335'}} className='rounded-full py-2 px-4' onClick={handleLeaveRoom}><img src='/assets/icons/call_end.svg' /></button>
        </div>
        <div className='flex space-x-4'>
          <button>
            <img src='/assets/icons/group.svg' onClick={() => setShowPeopleModal(prev => !prev)} />
          </button>
          <button>
            <img src='/assets/icons/chat.svg' />
          </button>
          <button className='rounded-full' onClick={() => setShowRoomDetailModal(prev => !prev)}>
            <img src='/assets/icons/info.svg' />
          </button>
        </div>
      </div>

      { showRoomDetailModal && <RoomDetailModal onToggleRoomDetailModal={() => setShowRoomDetailModal(prev => !prev)} />}
      { showPeopleModal &&  <ParticipantModal onToggleParticipantModal={() => setShowPeopleModal(prev => !prev)} />}
    </div>
  );
};

export default Room;
