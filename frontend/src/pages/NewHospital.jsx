import React, { useState } from 'react'
import { publicRequest } from '../requestMethods'
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from 'react-redux'

const NewHospital = () => {
  const [inputs, setInputs] = useState({});

  // Correctly get admin user from Redux
  const admin = useSelector((state) => state.admin);

  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleHospitals = async () => {
    try {
      await publicRequest.post("/hospitals", inputs, {
        headers: {
          Authorization: `Bearer ${admin.currentUser.accessToken}`
        }
      });
      toast.success("Hospital has been successfully added to the database");
      setInputs({});
    } catch (error) {
      toast.warning(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className='flex flex-center justify-center min-h-screen'>
      <div className='m-[20px] p-[20px] h-[80vh] w-[450px]'>
        <h2 className='font-semibold'>New Hospital</h2>
        <div className='flex flex-col my-[12px]'>

          <label>Name</label>
          <input type="text" placeholder='James Doe' name='name' value={inputs.name || ""} onChange={handleChange} className='border-[#555] border-2 border-solid p-[10px] w-[300px]' />

          <label>Address</label>
          <input type="text" placeholder='Downtown' name='address' value={inputs.address || ""} onChange={handleChange} className='border-[#555] border-2 border-solid p-[10px] w-[300px]' />

          <label>Email</label>
          <input type="email" placeholder='james@gmail.com' name='email' value={inputs.email || ""} onChange={handleChange} className='border-[#555] border-2 border-solid p-[10px] w-[300px]' />

        </div>
      </div>

      <div className='m-[20px] p-[20px] h-[80vh] w-[450px]'>
        <div className='flex flex-col'>
          <label>Date</label>
          <input type="date" name='date' value={inputs.date || ""} onChange={handleChange} className='border-[#555] border-2 border-solid p-[10px] w-[300px]' />

          <label>Telephone Number</label>
          <input type="number" placeholder='1234567' name='tel' value={inputs.tel || ""} onChange={handleChange} className='border-[#555] border-2 border-solid p-[10px] w-[300px]' />

          <button className='bg-[#444] cursor-pointer text-white p-[10px] w-[300px] my-[10px]' onClick={handleHospitals}>Create</button>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default NewHospital;
