import React, { useState } from 'react'
import { publicRequest } from '../requestMethods'
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const Contact = () => {

   const [inputs, setInputs] = useState({})
  
    const handleChange = (e) => {
      setInputs((prev) => {
        return { ...prev, [e.target.name]: e.target.value }
      })
    }
  
    const handleProspects = async () => {
      try {
        await publicRequest.post("/donors", inputs)
        toast.success("Donor has been seccesfully created to the data base")
        setInputs({})
      } catch (error) {
        toast.warning(error.message)
      }
    }

  return (
    <div className='flex items-center justify-center my-[100px]'> 
      <div className='flex flex-col bg-gray-100 w-[50%] h-auto p-[50px]'>

        <span className='text-[20px] my-[20px]'>Do you want to donate blood? Fill in the information.</span>
        <label className='text=[18px] mt-[10px] font-semibold'>Name</label>
        <input className='w-[350px] p-[15px]' type="text" placeholder='John Doe'  name='name' value={inputs.name || ""} onChange={handleChange} />

        <label className='text=[18px] mt-[10px] font-semibold'>Telephone</label>
        <input className='w-[350px] p-[15px]' type="text" placeholder='12345678' name='tel' value={inputs.tel || ""} onChange={handleChange} />

        <label className='text=[18px] mt-[10px] font-semibold'>Email</label>
        <input className='w-[350px] p-[15px]' type="email" placeholder='Johndoe@gmail.com' name='email' value={inputs.email || ""} onChange={handleChange} required />

        <label className='text=[18px] mt-[10px] font-semibold'>Address</label>
        <input className='w-[350px] p-[15px]' type="text" placeholder='123 Town Street' name='address' value={inputs.address || ""} onChange={handleChange} />

        <label className='text=[18px] mt-[10px] font-semibold'>Weight</label>
        <input className='w-[350px] p-[15px]' type="Number" placeholder='50kg' name='weight' value={inputs.weight || ""} onChange={handleChange} />

        <label className='text=[18px] mt-[10px] font-semibold'>Blood Group</label>
        <select className='w-[350px] p-[15px]' name='bloodgroup' value={inputs.bloodgroup || ""} onChange={handleChange}>
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
        <input className='w-[350px] p-[15px]' type="Number" placeholder='20' name='age' value={inputs.age || ""} onChange={handleChange} />

        <label className='text=[18px] mt-[10px] font-semibold'>Do you have any diseases?</label>
        <textarea className='w-[350px] p-[15px]' type="Number" placeholder='N/A' name='disease' value={inputs.disease || ""} onChange={handleChange} />

        <button className='bg-red-500 p-3 mt-3 w-[350px] cursor-pointer text-white' onClick={handleProspects}>Submit</button>
      </div>
    </div>
  )
}

export default Contact