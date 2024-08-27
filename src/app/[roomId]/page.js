'use client'
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import './page.module.css';

const MultiUserCall = () => {
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
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPeopleModal, setShowPeopleModal] = useState(false);

  const [cameraStatus, setCameraStatus] = useState(false);
  const [micStatus, setMicStatus] = useState(false);

  const router = useRouter();

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
        console.log('My peer id', id)
        setPeerId(id);
        
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
            const peersInRoom = data.peers.filter((peer) => peer.peerId !== id);

            setxPeers(peersInRoom);
            
            // Connect to peers in room
            setCountPeersInRoom(peersInRoom.length+1);

            connectToPeers(peersInRoom, peer, data);
            
          } else if(data.type === 'leave') {
            const remoteVideo = document.getElementById(`video-${data.peerId}`); 
            if(remoteVideo) remoteVideo.remove();
          } else if(data.type === 'raise-hand') {
            // Handle user raising hand
            console.log('raising hand');
            const audio = new Audio('/assets/sounds/meet_raise_hand.mp3');
            audio.play();

            //make html element notification that peer has raised hand
            // let div = document.createElement('div');
            // div.className = 'py-16 px-8 rounded-md absolute bottom-0 right-0';
            // div.style.backgroundColor = '#3C4043';
            
            // let div2 = document.createElement('div');
            // div2.className = 'w-16 h-16 rounded-full bg-cyan-900 text-white mx-auto flex items-center justify-center';
            // let p = document.createElement('p');
            // p.className = 'text-2xl font-medium';
            // p.innerText = 'PG';
            // div2.appendChild(p);
            // div.appendChild(div2);

            // document.body.appendChild(div);
            // console.log('hi')
            
          }
        };
      });

      // 
      peer.on('call', (call) => {
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
                console.log('presentation stopped');
                setIsPresenting(false);
                // myVideo.current.srcObject = stream;
                myPresentation.current.srcObject = null;
                myPresentation.current.className = 'hidden';
                // myVideo.current.play();
              }
            }  
            
            
            const video = document.getElementById('presentation');

            console.log(presentingRef.current)
            
            if(presentingRef.current?.isPresentation && presentingRef.current?.type === 'peers-presentation') {
              video.className = '';
              video.srcObject = remoteStream;

            }
            
            video.play();

            // setIsPresenting(true);

            // console.log('xdding', xd)

            // document.body.appendChild(video);
            // addRemoteVideo(call.peer, remoteStream);
            // console.log('i also get executed bro')
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

  const connectToPeers = (peers, peer, presenter) => {
    if(presenter.isPresentation) {
      // console.log('simalakama ')
      // navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then((stream) => {
      //   console.log('shesh', stream)
      //   myPresentation.current.srcObject = stream;
      //   myPresentation.current.play();
      //   setIsPresenting(true);

      //   // peers.forEach((remotePeer) => {
      //   //   const remoteId = remotePeer.peerId;
      //   //   const call = peer.call(remoteId, stream);
      //   //   call.on('stream', (remoteStream) => {
      //   //     //add remote video? what
      //   //     console.log(remoteStream);
      //   //     addRemoteVideo(call.peer, remoteStream);
      //   //   })
      //   // })
      // })
    } else {
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
    }
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
      // let videoElement = document.getElementById(`video-${peerId}`);
      // if (!videoElement) {
      
      let videoElement = document.createElement('video');
      videoElement.id = `video-${peerId}`;
      videoElement.autoplay = true;
      //add video style and height and width
      videoElement.style.width = '300px';
      videoElement.style.height = '300px';
      videoElement.style.border = '1px solid black';
      videoElement.className = 'hidden';
        // document.body.appendChild(videoElement);
      // }
      videoElement.srcObject = stream;
      videoElement.play();
      div.appendChild(videoElement);
    }
    
    
    document.getElementById('remote-videos').appendChild(div);

    // document.getElementById('remote-videos').appendChild(videoElement);
    
  };

  const addPresentationVideo = (remoteId, remoteStream) => {
    // addPresentationVideo(remoteId, remoteStream);
    const presentation = document.getElementById('presentation');
    console.log('uoooo', presentation);
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
    console.log('presentation');
    //create new peer for share screen
    // const presentationPeer = new Peer({
    //   host: 'localhost',
    //   port: 9000,
    //   path: '/'
    // });

    // console.log(presentationPeer)

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
      

      // peers.forEach((remotePeer) => {
      //   const remoteId = remotePeer.peerId;
      //   const call = peer.call(remoteId, stream);
      //   call.on('stream', (remoteStream) => {
      //     addRemoteVideo(remoteId, remoteStream);
      //   });
      // });

      xPeers.forEach((remotePeer) => {
        const remoteId = remotePeer.peerId;
        const call = screenPeer.call(remoteId, stream);
        call.on('stream', (remoteStream) => {
          addPresentationVideo(remoteId, remoteStream);
        })
      })
      
      // wsRef.current.send()

      wsRef.current.send(JSON.stringify({ type: 'presentation-stream', peerId, roomId, stream }))

     
      if(presentationStream) {
        console.log('presstream', presentationStream)
      }
      // myPresentation.getVideoTracks()[0].addEventListener('ended', () => {
      //   console.log('Screen sharing stopped by user');
      //   wsRef.current.send(JSON.stringify({ type: 'presentation-stopped', peerId, roomId }))
      // });
    })


    // screenPeer.on('call', (call) => {
    //   navigator.mediaDevices.getDisplayMedia({ video: true , audio: true }).then((stream) => {
    //     myPresentation.current.srcObject = stream;
    //     myPresentation.current.play();
    //     call.answer(stream);
    //     call.on('stream', (remoteStream) => {
    //       // addRemoteVideo(call.peer, remoteStream);
    //       console.log('kakikukeko', remoteStream)
    //     });
    //   });
    // })

    
    
    // presentationPeer.on('open', (id) => {
    //   wsRef.current.send(JSON.stringify({ type: 'join', peerId: id, roomId, isPresentation: true }));
    // })

  }

  const handleRaiseHand = () => {
    console.log('raise hand');
    wsRef.current.send(JSON.stringify({ type: 'raise-hand', peerId, roomId }));
  }


  useEffect(() => {
    console.log(isPresenting);
  }, [isPresenting])

  useEffect(() => {
    if(presentationStream) {
      presentationStream.getVideoTracks()[0].addEventListener('ended', () => {
        console.log('Screen sharing stopped by user');
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

          {/* <button style={{backgroundColor: '#3C4043'}} className='rounded-full p-2'><img src='/assets/icons/closed_caption.svg' /></button> */}
          {/* <button style={{backgroundColor: '#3C4043'}} className='rounded-full p-2'><img src='/assets/icons/mood.svg' /></button> */}
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
          <button className='rounded-full' onClick={() => setShowInfoModal(prev => !prev)}>
            <img src='/assets/icons/info.svg' />
          </button>
          {/* <button>
            <img src='/assets/icons/category.svg' />
          </button> */}
          {/* <button>
            <img src='/assets/icons/lock_person.svg' />
          </button> */}
        </div>
      </div>

      {/* info modal */}
      { showInfoModal && (
        <div className='absolute top-4 right-4 h-4/5 w-1/4 bg-white rounded-lg'>
          <div className='flex justify-between px-6 py-4 '>
            <h3 className='text-md'>Detail Rapat</h3>
            <img src='/assets/icons/close.svg' className='hover:cursor-pointer' onClick={() => setShowInfoModal(false)} />
          </div>
          <div className='mt-6 text-sm px-6 pb-4 border-b border-gray-400'>
            <p className='font-medium text-gray-700'>Info akses</p>
            <p className='text-gray-500 mt-2'>{ window.location.href }</p>
            <p className='flex items-center font-medium text-sky-900 mt-2'><img src="/assets/icons/content_copy.svg" />  Salin info akses</p>
          </div>
          <div className='px-6 py-4'>
          <p className='text-gray-500 mt-2 text-center text-sm'>Lampiran Google Kalender ditampilkan di sini</p>
          </div>
        </div>
      ) }

      { showPeopleModal && (
        <div className='absolute top-4 right-4 h-4/5 w-1/4 bg-white rounded-lg'>
          <div className='flex justify-between px-6 py-4 '>
            <h3 className='text-md'>Orang</h3>
            <img src='/assets/icons/close.svg' className='hover:cursor-pointer' onClick={() => setShowPeopleModal(false)} />
          </div>
          <div className='mt-4 px-2 py-4'>
            <input className='px-4 py-3  border border-gray-300 rounded-md w-full' placeholder='Telusuri orang' />
          </div>
          <div className=''>
            <p className='text-xs text-gray-500 px-6 py-2'>DALAM RAPAT</p>
            <div className='px-2 py-2'>
              <div className='rounded-md w-full border border-gray-300 '>
                <div className='flex justify-between px-4 py-2 border-b border-gray-300'>
                  <p className='text-sm'>Kontributor</p>
                  <div className='flex space-x-4'>
                    <p className='text-sm'>1</p>
                    <img src='/assets/icons/keyboard_arrow_up_black.svg' />
                  </div>
                </div>
                <div className='px-4 py-2'>
                  Users
                </div>
              </div>
            </div>
          </div>
        </div>
        ) }
    </div>
  );
};

export default MultiUserCall;
