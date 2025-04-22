import React, { useEffect, useState } from 'react'
import {useLocation} from 'react-router-dom'
import { publicRequest } from '../requestMethods';

const Donor = () => {

  const [donor, setDonor] = useState({});
  const location = useLocation();
  const donorId = location.pathname.split("/")[3];

  useEffect(() => {
    const getDonor = async() => {
      try {
        const res = await publicRequest.get(`/donors/find/${donorId}`)
        setDonor(res.data)
      } catch (error) {
        console.log(error)
      }
    }
    getDonor()
  }, [])

  return (
    <div className='flex flex-center justify-center min-h-screen'>

      <div className='m-[20px] p-[20px] h-[80vh] w-[450px]'> 
        <h2 className='font-semibold'>Donor</h2>
        <div className='flex flex-col my-[12px]'>

          <label>Name</label>
          <input type="text" placeholder={donor.name} className='border-b-2 border-b-[#555] border-solid outline-none p-[10px] w-[300px]' />

          <label>Address</label>
          <input type="text" placeholder={donor.address} className='border-b-2 border-b-[#555] border-solid outline-none p-[10px] w-[300px]' />

          <label className='text-[18px] mt-[10px] font-semibold'>Blood Group</label>
          <select className='border-b-2 border-b-[#555] border-solid outline-none p-[10px] w-[300px]'>
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
          <input type="email" placeholder={donor.email} className='border-b-2 border-b-[#555] border-solid outline-none p-[10px] w-[300px]' />

        </div>
      </div>  

      <div className='m-[20px] p-[20px] h-[80vh] w-[450px]'>
        <div className='flex flex-col'>
          <label>Weight</label>
          <input type="Number" placeholder={donor.weight} className='border-b-2 border-b-[#555] border-solid outline-none p-[10px] w-[300px]' />

          <label>Date</label>
          <input type="date" placeholder={donor.date} className='border-b-2 border-b-[#555] border-solid outline-none p-[10px] w-[300px]' />

          <label>tel</label>
          <input type="text" placeholder={donor.tel} className='border-b-2 border-b-[#555] border-solid outline-none p-[10px] w-[300px]' />

          <label className='text=[18px] font-semibold'>Do you have any diseases?</label>
          <textarea className='border-b-2 border-b-[#555] border-solid outline-none p-[10px] w-[300px]' type="text" placeholder={donor.diseases} />

          <button className='bg-[#444] cursor-pointer text-white p-[10px] w-[300px] my-[10px]'>Create</button>

        </div>
      </div>   
                                                                                                     
    </div>
  )
}

export default Donor