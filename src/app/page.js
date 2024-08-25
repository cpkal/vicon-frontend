'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const handleCreateRoom = () => {
    //create random uuid for roomId
    const roomId = uuidv4();
    router.push(`/${roomId}`);
  }

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
            <img src="/assets/icons/settings.svg" />
          </div>
          <div className="pl-12 flex items-center space-x-4">
            <img src="/assets/icons/apps.svg" />
            <div className="h-8 w-8 bg-sky-900 rounded-full">

            </div>
          </div>
        </div>
      </nav>

      <div className="h-full w-full">
        <div className="w-1/2 transform translate-y-1/2">
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
                  <input type="text" className="rounded lg p-3 border border-gray-600 placeholder:text-gray-600 pl-10 focus:ring focus:border-sky-500" placeholder="Masukkan kode atau link"  />
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img src="/assets/icons/keyboard.svg" />
                  </div>
                </div>
                <button className="font-medium text-sky-600">Gabung</button>
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
