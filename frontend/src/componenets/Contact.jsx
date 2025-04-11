import React from 'react'

const Contact = () => {
  return (
    <div className='flex items-center justify-center my-[100px]'> 
      <div className='flex flex-col bg-gray-100 w-[50%] h-auto p-[50px]'>

        <span className='text-[20px] my-[20px]'>Do you want to donate blood? Fill in the information.</span>
        <label className='text=[18px] mt-[10px] font-semibold'>Name</label>
        <input className='w-[350px] p-[15px]' type="text" placeholder='John Doe' />

        <label className='text=[18px] mt-[10px] font-semibold'>Telephone</label>
        <input className='w-[350px] p-[15px]' type="text" placeholder='12345678' />

        <label className='text=[18px] mt-[10px] font-semibold'>Email</label>
        <input className='w-[350px] p-[15px]' type="email" placeholder='Johndoe@gmail.com' required />

        <label className='text=[18px] mt-[10px] font-semibold'>Address</label>
        <input className='w-[350px] p-[15px]' type="text" placeholder='123 Town Street' />

        <label className='text=[18px] mt-[10px] font-semibold'>Weight</label>
        <input className='w-[350px] p-[15px]' type="Number" placeholder='50kg' />

        <label className='text=[18px] mt-[10px] font-semibold'>Blood Group</label>
        <select className='w-[350px] p-[15px]'>
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

        <label className='text=[18px] mt-[10px] font-semibold'>Age</label>
        <input className='w-[350px] p-[15px]' type="Number" placeholder='20' />

        <label className='text=[18px] mt-[10px] font-semibold'>Do you have any diseases?</label>
        <textarea className='w-[350px] p-[15px]' type="Number" placeholder='N/A' />

        <button className='bg-red-500 p-3 mt-3 w-[350px] cursor-pointer text-white'>Submit</button>
      </div>
    </div>
  )
}

export default Contact