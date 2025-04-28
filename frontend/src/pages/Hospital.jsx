import React, { useEffect, useState } from 'react'
import {useLocation} from 'react-router-dom'
import { publicRequest } from '../requestMethods';

const Hospital = () => {

  const [hospital, setHospital] = useState({});
  const location = useLocation();
  const hospitalId = location.pathname.split("/")[3];

  const [inputs, setInputs] = useState({})

  const handleChange = (e) => {
    setInputs((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  useEffect(() => {
    const getHospital = async() => {
      try {
        const res = await publicRequest.get(`/hospitals/find/${hospitalId}`)
        setHospital(res.data)
      } catch (error) {
        console.log(error)
      }
    }
    getHospital()
  }, [])

   const handleUpdate = async() => {
      try {
        console.log("Sending update:", inputs);
        await publicRequest.put(`/hospitals/${donorId}`, inputs);
        window.location.reload()
      } catch (error) {
        console.log(error)
      }
    } 

  return (
    <div className='flex flex-center justify-center min-h-screen'>

      <div className='m-[20px] p-[20px] h-[80vh] w-[450px]'> 
        <h2 className='font-semibold'>Hospital</h2>
        <div className='flex flex-col my-[12px]'>

          <label>Name</label>
          <input type="text" placeholder={hospital.name} name='name' value={inputs.name || ""} onChange={handleChange} className='border-b-2 border-b-[#555] border-solid outline-none p-[10px] w-[300px]' />

          <label>Address</label>
          <input type="text" placeholder={hospital.address} name='address' value={inputs.address || ""} onChange={handleChange} className='border-b-2 border-b-[#555] border-solid outline-none p-[10px] w-[300px]' />

          <label>Email</label>
          <input type="email" placeholder={hospital.email} name='email' value={inputs.email || ""} onChange={handleChange} className='border-b-2 border-b-[#555] border-solid outline-none p-[10px] w-[300px]' />

        </div>
      </div>  

      <div className='m-[20px] p-[20px] h-[80vh] w-[450px]'>
        <div className='flex flex-col'>
          <label>Date</label>
          <input type="date" placeholder={hospital.date} name='date' value={inputs.date || ""} onChange={handleChange} className='border-b-2 border-b-[#555] border-solid outline-none p-[10px] w-[300px]' />

          <label>Telephone Number</label>
          <input type="text" placeholder={hospital.tel} name='tel' value={inputs.tel || ""} onChange={handleChange} className='border-b-2 border-b-[#555] border-solid outline-none p-[10px] w-[300px]' />

          <button className='bg-[#444] cursor-pointer text-white p-[10px] w-[300px] my-[10px]'  onClick={handleUpdate}>Update</button>

        </div>
      </div>   
                                                                                                     
    </div>
  )
}

export default Hospital