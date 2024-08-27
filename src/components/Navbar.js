export default function Navbar({ onOpenSettingModal }){
  return(
    <nav className="sticky top-0 py-4 px-6 flex justify-between bg-white z-10">
      <div className="flex items-center space-x-2">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTayrTZwfe00-1p6u8ZrDWN7EY4Rsn3BwAOhw&s" alt="Google Meet" className="w-8 h-7" />
        <h1 className="text-xl text-gray-800 font-medium">Google Meet</h1>
      </div>
      <div className="flex items-center ">
        <div className="flex space-x-6">
          <p className="text-gray-600">16.19  •  Min, 25 Agu</p>
          {/* <img src="/assets/icons/help.svg" /> */}
          {/* <img src="/assets/icons/feedback.svg" /> */}
          <button onClick={onOpenSettingModal}>
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
  )
}