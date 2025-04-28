import React, { useState } from 'react'
import { publicRequest } from '../requestMethods'
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { Link } from 'react-router-dom';

const HospitalRegister = () => {

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
    <div className='flex items-center justify-center my-[50px]'>
      <div className='flex flex-col bg-gray-100 w-[500px] h-auto p-[50px]'>
        <div className='text-[20px] my-1'>
          <h2>Do you want to get blood? First create account.</h2>
        </div>

        <label className='text=[18px] mt-[10px] font-semibold'>Hospital Name</label>
        <input className='w-full p-3 mt-1' type="text" placeholder='John Doe' name='name' value={inputs.name || ""} onChange={handleChange} />

        <label className='text=[18px] mt-[10px] font-semibold'>Hospital Email</label>
        <input className='w-full p-3 mt-1' type="email" placeholder='Johndoe@gmail.com' name='email' value={inputs.email || ""} onChange={handleChange} required />

        <label className='text=[18px] mt-[10px] font-semibold'>Hospital Address</label>
        <input className='w-full p-3 mt-1' type="text" placeholder='123 Town Street' name='address' value={inputs.address || ""} onChange={handleChange} />

        <label className='text=[18px] mt-[10px] font-semibold'>Hospital Telephone Number</label>
        <input className='w-full p-3 mt-1' type="text" placeholder='12345678' name='tel' value={inputs.tel || ""} onChange={handleChange} />

        <button className='bg-red-500 p-3 mt-3 w-full cursor-pointer text-white font-bold transition-transform duration-700 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transform hover:scale-105' onClick={handleProspects}>Submit</button>
     
        <a href="#" className="hover:text-gray-600 font-semibold text-lg w-full mt-3 ml-[25%]">
          <Link to="/login">
            Already have an Account
          </Link>
        </a>
  

      </div>
    </div>
  )
}

export default HospitalRegister