import React from 'react'

const Newdonor = () => {
  return (
    <div className='flex flex-center justify-center min-h-screen'>

      <div className='m-[20px] p-[20px] h-[80vh] w-[450px]'> 
        <h2 className='font-semibold'>New Donor</h2>
        <div className='flex flex-col my-[12px]'>

          <label>Name</label>
          <input type="text" placeholder='James Doe' className='border-[#555] border-2 border-solid p-[10px] w-[300px]' />

          <label>Address</label>
          <input type="text" placeholder='Down town' className='border-[#555] border-2 border-solid p-[10px] w-[300px]' />

          <label className='text-[18px] mt-[10px] font-semibold'>Blood Group</label>
          <select className='border-[#555] border-2 border-solid p-[10px] w-[300px]'>
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>

          <label>Email</label>
          <input type="email" placeholder='James@gmail.com' className='border-[#555] border-2 border-solid p-[10px] w-[300px]' />

        </div>
      </div>  

      <div className='m-[20px] p-[20px] h-[80vh] w-[450px]'>
        <div className='flex flex-col'>
          <label>Weight</label>
          <input type="Number" placeholder='50kg' className='border-[#555] border-2 border-solid p-[10px] w-[300px]' />

          <label>Date</label>
          <input type="date" placeholder='' className='border-[#555] border-2 border-solid p-[10px] w-[300px]' />

          <label>tel</label>
          <input type="text" placeholder='1234567' className='border-[#555] border-2 border-solid p-[10px] w-[300px]' />

          <label className='text=[18px] mt-[10px] font-semibold'>Do you have any diseases?</label>
          <textarea className='border-[#555] border-2 border-solid p-[10px] w-[300px]' type="text" placeholder='N/A' />

          <button className='bg-[#444] cursor-pointer text-white p-[10px] w-[300px] my-[10px]'>Create</button>

        </div>
      </div>   
                                                                                                     
    </div>
  )
}

export default Newdonor