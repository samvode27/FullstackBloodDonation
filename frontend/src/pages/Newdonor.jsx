import React, { useState } from 'react'
import { publicRequest } from '../requestMethods'
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from 'react-redux'

const Newdonor = () => {

  const [inputs, setInputs] = useState({});
  
  // Get admin from Redux state (not 'user')
  const admin = useSelector((state) => state.admin);

  const handleChange = (e) => {
    setInputs((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    });
  };

  const handleDonors = async () => {
    try {
      await publicRequest.post("/donors", inputs, {
        headers: {
          Authorization: `Bearer ${admin.currentUser.accessToken}`
        }
      });
      toast.success("Donor has been successfully created in the database");
      setInputs({});
    } catch (error) {
      toast.warning(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className='flex flex-center justify-center min-h-screen'>

      <div className='m-[20px] p-[20px] h-[80vh] w-[450px]'>
        <h2 className='font-semibold'>New Donor</h2>
        <div className='flex flex-col my-[12px]'>

          <label>Name</label>
          <input type="text" placeholder='James Doe' name='name' value={inputs.name || ""} onChange={handleChange} className='border-[#555] border-2 border-solid p-[10px] w-[300px]' />

          <label>Address</label>
          <input type="text" placeholder='Down town' name='address' value={inputs.address || ""} onChange={handleChange} className='border-[#555] border-2 border-solid p-[10px] w-[300px]' />

          <label className='text-[18px] mt-[10px] font-semibold'>Blood Group</label>
          <select className='border-[#555] border-2 border-solid p-[10px] w-[300px]' name='bloodgroup' value={inputs.bloodgroup || ""} onChange={handleChange}>
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
          <input type="email" placeholder='James@gmail.com' name='email' value={inputs.email || ""} onChange={handleChange} className='border-[#555] border-2 border-solid p-[10px] w-[300px]' />

        </div>
      </div>

      <div className='m-[20px] p-[20px] h-[80vh] w-[450px]'>
        <div className='flex flex-col'>
          <label>Weight</label>
          <input type="Number" placeholder='50kg' name='weight' value={inputs.weight || ""} onChange={handleChange} className='border-[#555] border-2 border-solid p-[10px] w-[300px]' />

          <label>Date</label>
          <input type="date" placeholder='2017/08/13' name='date' value={inputs.date || ""} onChange={handleChange} className='border-[#555] border-2 border-solid p-[10px] w-[300px]' />

          <label>tel</label>
          <input type="Number" placeholder='1234567' name='tel' value={inputs.tel || ""} onChange={handleChange} className='border-[#555] border-2 border-solid p-[10px] w-[300px]' />

          <label className='text=[18px] mt-[10px] font-semibold'>Do you have any diseases?</label>
          <textarea className='border-[#555] border-2 border-solid p-[10px] w-[300px]' name='disease' value={inputs.disease || ""} onChange={handleChange} placeholder='N/A' />

          <button className='bg-[#444] cursor-pointer text-white p-[10px] w-[300px] my-[10px]' onClick={handleDonors}>Create</button>
          <ToastContainer />
        </div>
      </div>

    </div>
  );
};

export default Newdonor;
