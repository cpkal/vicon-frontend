'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Navbar from "@/components/Navbar";
import SettingModal from "@/components/Home/SettingModal";

export default function Home() {
  const router = useRouter();

  const [roomId, setRoomId] = useState("");
  const [isShowSettingPopup, setShowSettingPopup] = useState(false);
  const [isCameraEnabled, setCameraEnabled] = useState(false);
  const [isMicEnabled, setMicEnabled] = useState(false);

  const toggleSettingModal = () => setShowSettingPopup(prev => !prev);

  const toggleDevice = (device) => {
    if (device === "camera") {
      setCameraEnabled(prev => !prev);
    } else if (device === "mic") {
      setMicEnabled(prev => !prev);
    }
  }

  const handleCreateRoom = () => {
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
      <Navbar onOpenSettingModal={toggleSettingModal} />

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

      <SettingModal 
        isOpen={isShowSettingPopup}
        onClose={toggleSettingModal}
        onToggleDevice={toggleDevice}
        isCameraEnabled={isCameraEnabled}
        isMicEnabled={isMicEnabled}
      />
    </main>
  );
}
