export default function RoomDetailModal({ onToggleRoomDetailModal }) {
  return (
    <div className='absolute top-4 right-4 h-4/5 w-1/4 bg-white rounded-lg'>
      <div className='flex justify-between px-6 py-4 '>
        <h3 className='text-md'>Detail Rapat</h3>
        <img src='/assets/icons/close.svg' className='hover:cursor-pointer' onClick={onToggleRoomDetailModal} />
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
  )
}