import React, { useState } from 'react'
import {Link} from 'react-router-dom'
import {
  FaBox,
  FaCalendarAlt,
  FaChartBar,
  FaClipboard,
  FaCog,
  FaElementor,
  FaHdd,
  FaHome,
  FaUser,
  FaUsers,
} from "react-icons/fa";

const Menu = () => {

  const [activeLink, setActiveLink] = useState("/admin")

  const handleActiveLink = (link) => {
    setActiveLink(link)
  }

  return (
    <div className='bg-gray-100 p-[20px] w-[280px] h-[110vh] shadow'>

      <ul className='flex flex-col items-start justify-start mt-[20px] pl-[20px]'>
        <Link to="/admin" onClick={() => handleActiveLink("/admin")}>
          <li className={`flex items-center text-[20px] cursor-pointer font-semibold mt-[20px] transition-colors duration-100
              ${activeLink === "/admin" ? "bg-red-300 p-[10px] w-[200px] text-white" : ""}
            `}>
            <FaHome className={`mr-[15px] text-red-500
              ${setActiveLink === "/admin" ? "text-white" : "text-red-500"}
            `} /> 
            Home
          </li>
        </Link>

        <li className='flex items-center text-[20px] cursor-pointer font-semibold mt-[20px] transition-colors duration-100'>
          <FaUser className='mr-[15px] text-red-500 ' /> 
          Profile
        </li>

        <hr className='w-full my-[20px] border-gray-300' />

        <Link to="/admin/donors" onClick={() => handleActiveLink("/admin/donors")}>
          <li className={`flex items-center text-[20px] cursor-pointer font-semibold mt-[20px] transition-colors duration-100
              ${activeLink === "/admin/donors" ? "bg-red-300 p-[10px] w-[200px] text-white" : ""}
            `}>
            <FaBox className={`mr-[15px] text-red-500
              ${setActiveLink === "/admin/donors" ? "text-white" : ""}
            `} /> 
            Donors
          </li>
        </Link>

        <Link to="/admin/prospects" onClick={() => handleActiveLink("/admin/prospects")}>
          <li className={`flex items-center text-[20px] cursor-pointer font-semibold mt-[20px] transition-colors duration-100
              ${activeLink === "/admin/prospects" ? "bg-red-300 p-[10px] w-[200px] text-white" : ""}
            `}>
            <FaUsers className={`mr-[15px] text-red-500
              ${setActiveLink === "/admin/prospects" ? "text-white" : ""}
            `} /> 
            Prospects
          </li>
        </Link>

        <Link to="/admin/hospitals" onClick={() => handleActiveLink("/admin/hospitals")}>
          <li className={`flex items-center text-[20px] cursor-pointer font-semibold mt-[20px] transition-colors duration-100
              ${activeLink === "/admin/hospitals" ? "bg-red-300 p-[10px] w-[200px] text-white" : ""}
            `}>
            <FaUsers className={`mr-[15px] text-red-500
              ${setActiveLink === "/admin/hospitals" ? "text-white" : ""}
            `} /> 
            Hospitals
          </li>
        </Link>

        <hr className='w-full my-[20px] border-gray-300' />

        <li className='flex items-center text-[20px] cursor-pointer font-semibold mt-[20px] transition-colors duration-100'>
          <FaElementor className='mr-[15px] text-red-500 ' /> 
          Elements
        </li>

        <li className='flex items-center text-[20px] cursor-pointer font-semibold mt-[20px] transition-colors duration-100'>
          <FaCog className='mr-[15px] text-red-500 ' /> 
          Settings
        </li>

        <li className='flex items-center text-[20px] cursor-pointer font-semibold mt-[20px] transition-colors duration-100'>
          <FaHdd className='mr-[15px] text-red-500 ' /> 
          Backups
        </li>

        <hr className='w-full my-[20px] border-gray-300' />

        <li className='flex items-center text-[20px] cursor-pointer font-semibold mt-[20px] transition-colors duration-100'>
          <FaChartBar className='mr-[15px] text-red-500 ' /> 
          Charts
        </li>

        <li className='flex items-center text-[20px] cursor-pointer font-semibold mt-[20px] transition-colors duration-100'>
          <FaClipboard className='mr-[15px] text-red-500 ' /> 
          All logs
        </li>

        <li className='flex items-center text-[20px] cursor-pointer font-semibold mt-[20px] transition-colors duration-100'>
          <FaCalendarAlt className='mr-[15px] text-red-500 ' /> 
          Calender
        </li>
      </ul>

    </div>
  )
}

export default Menu