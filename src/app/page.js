'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();
  const [isShowSettingPopup, setShowSettingPopup] = useState(false);
  const [isCameraEnabled, setCameraEnabled] = useState(false);
  const [isMicEnabled, setMicEnabled] = useState(false);

  const handleCreateRoom = () => {
    //create random uuid for roomId
    const roomId = uuidv4();
    router.push(`/${roomId}`);
  }

  const handleJoinRoom = () => {
    router.push(`/${roomId}`);
  }

  useEffect(() => {
    localStorage.setItem('isCameraEnabled', isCameraEnabled);
    localStorage.setItem('isMicEnabled', isMicEnabled);
  }, [isCameraEnabled, isMicEnabled]);

  return (
    <main className="">
      <nav className="sticky top-0 py-4 px-6 flex justify-between bg-white z-10">
        <div className="flex items-center space-x-2">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTayrTZwfe00-1p6u8ZrDWN7EY4Rsn3BwAOhw&s" alt="Google Meet" className="w-8 h-7" />
          <h1 className="text-xl text-gray-800 font-medium">Google Meet</h1>
        </div>
        <div className="flex items-center ">
          <div className="flex space-x-6">
            <p className="text-gray-600">16.19  •  Min, 25 Agu</p>
            <img src="/assets/icons/help.svg" />
            <img src="/assets/icons/feedback.svg" />
            <button onClick={() => setShowSettingPopup(prev => !prev)}>
              <img src="/assets/icons/settings.svg" />
            </button>
          </div>
          <div className="pl-12 flex items-center space-x-4">
            <img src="/assets/icons/apps.svg" />
            <div className="h-8 w-8 bg-sky-900 rounded-full">

            </div>
          </div>
        </div>
      </nav>

      <div className="h-full w-full">
        <div className="w-1/2 transform translate-y-1/3">
          <div className="ml-14">
            <h1 className="text-5xl text-gray-800 leading-normal">Rapat dan panggilan video untuk semua orang</h1>
            <h2 className="text-2xl text-gray-600">Terhubung, berkolaborasi, dan merayakan dari mana saja dengan Google Meet</h2>
            <div className="flex py-6 space-x-6">
              <button className="bg-sky-600  rounded-md p-3 flex space-x-2" onClick={handleCreateRoom}>
                <img src="/assets/icons/video_call.svg" />  
                <p className="text-white font-medium">Rapat baru</p>
              </button>
              <div className="flex space-x-4">
                <div className="relative">
                  <input type="text" className="rounded lg p-3 border border-gray-600 placeholder:text-gray-600 pl-10 focus:ring focus:border-sky-500" placeholder="Masukkan kode atau link" onChange={(e) => setRoomId(e.target.value)}  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img src="/assets/icons/keyboard.svg" />
                  </div>
                </div>
                <button className="font-medium text-sky-600" onClick={handleJoinRoom}>Gabung</button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-500 mx-16 py-4 text-xs flex">
            <a href="/pelajari" className="text-sky-500">Pelajari lebih lanjut&nbsp;</a>
            <p className="text-xs text-gray-500">Google Meet</p>
          </div>
        </div>
        <div className="w-1/2 h-full">

        </div>
      </div>

      <div className={`fixed inset-0 bg-black z-50 bg-opacity-50 flex items-center justify-center ${isShowSettingPopup ? '' : 'hidden'}`} id="lunrsearchresultsparent">
        <div  className="w-full md:w-3/5 overflow-x-auto bg-white border border-gray-300 mx-auto absolute left-1/2 transform -translate-x-1/2 z-50 p-8 rounded-lg " >
            <br />
            <button className="absolute top-0 right-0 mx-2 font-bold p-2 text-lg" onClick={() => setShowSettingPopup(prev => !prev)}>x</button>
            <div className="flex">
              <div className="w-1/5 border-r border-gray-800">
                Camera & Mic
              </div>
              <div className="w-4/5 px-4">
                <h3 className="text-xl">Camera</h3>
                <input type="checkbox" onChange={(e) => setCameraEnabled(prev => !prev)} />
                <h3 className="text-xl">Mic</h3>
                <input type="checkbox" onChange={() => setMicEnabled(prev => !prev)} />
              </div>
            </div>
        </div>
      </div>

      {/* <button onClick={handleCreateRoom}>Create room</button>
      <input
        type="text"
        value={roomId}
        className="border border-gray-900 rounded-md p-2"
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={() => router.push(`/${roomId}`)}>Join room</button> */}
    </main>
  );
}
