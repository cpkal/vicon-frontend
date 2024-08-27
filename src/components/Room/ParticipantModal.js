export default function ParticipantModal({ onToggleParticipantModal }) {
  return (
    <div className='absolute top-4 right-4 h-4/5 w-1/4 bg-white rounded-lg'>
      <div className='flex justify-between px-6 py-4 '>
        <h3 className='text-md'>Orang</h3>
        <img src='/assets/icons/close.svg' className='hover:cursor-pointer' onClick={onToggleParticipantModal} />
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
  )
}