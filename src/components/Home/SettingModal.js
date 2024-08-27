export default function SettingModal({isOpen, onClose, onToggleDevice, isCameraEnabled, isMicEnabled}) {
  return (
    <div className={`fixed inset-0 bg-black z-50 bg-opacity-50 flex items-center justify-center ${isOpen ? '' : 'hidden'}`} id="lunrsearchresultsparent">
      <div  className="w-full md:w-3/5 overflow-x-auto bg-white border border-gray-300 mx-auto absolute left-1/2 transform -translate-x-1/2 z-50 p-8 rounded-lg " >
          <br />
          <button className="absolute top-0 right-0 mx-2 font-bold p-2 text-lg" onClick={onClose}>x</button>
          <div className="flex">
            <div className="w-1/5 border-r border-gray-800">
              Camera & Mic
            </div>
            <div className="w-4/5 px-4">
              <h3 className="text-xl">Camera</h3>
              <input type="checkbox" onChange={onToggleDevice('camera')} />
              <h3 className="text-xl">Mic</h3>
              <input type="checkbox" onChange={onToggleDevice('mic')} />
            </div>
          </div>
      </div>
    </div>
  )
}