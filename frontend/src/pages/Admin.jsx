import React, { useEffect, useState } from 'react'
import { Gauge } from '@mui/x-charts/Gauge';
import { LineChart } from "@mui/x-charts/LineChart"
import { FaUser } from 'react-icons/fa';
import { PieChart } from '@mui/x-charts/PieChart';
import { publicRequest } from '../requestMethods';
import { logout } from '../redux/userRedux';
import { useNavigate } from "react-router-dom"
import { useDispatch } from 'react-redux'

const Admin = () => {

  const [bloodGroupData, setBloodGropuData] = useState([])
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const getBloodGroupStats = async() => {
      try {
        const res =await publicRequest.get("/donors/stats")
        const transformedData = res.data.map((item, index) => ({
          id: index,
          value: item.count,
          label: `Blood Group ${item._id}`
        }))

        setBloodGropuData(transformedData)

      } catch (error) {
        console.log(error)
      }
    }

    getBloodGroupStats()
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    navigate("/login")
  }

  return (
    <div className='flex justify-between h-[110vh]'>
      <div className='flex flex-col'>

        <div className='flex flex-wrap'>
          <div className='bg-gray-50 m-[30px] h-[300px] w-[320px] shadow-xl'>
            <div className='w-[200px] h-[200px]'>
              <Gauge
                value={75}
                startAngle={0}
                endAngle={360}
                innerRadius="80%"
                outerRadius="100%"
              // ...
              />
            </div>
            <h2 className='font-semibold text-[18px] m-[40px]'>Prospects</h2>
          </div>

          <div className='bg-gray-50 m-[30px] h-[300px] w-[320px] shadow-xl'>
            <div className='w-[200px] h-[200px] m-[30px] border-[20px] border-red-400 border-solid rounded-full'>
              <div className='flex items-center justify-center m-[30px]'>
                <h2 className='font-semibold text-[18px] m-[40px]'>100</h2>
              </div>

              <h2 className='font-semibold text-[18px] m-[40px]'>Donors</h2>
            </div>
          </div>
        </div>

        <div>
          <LineChart
            xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
            series={[
              {
                data: [2, 5.5, 2, 8.5, 1.5, 5],
              },
            ]}
            margin={{ left: 30, right: 30, top: 30, bottom: 30 }}
            height={300}
            grid={{ vertical: true, horizontal: true, }}
          />
        </div>
      </div>

      <div className='flex flex-col bg-gray-100 h-[110vh] w-[300px] shadow-xl'>
        <div className='flex item-center m-[20px] cursor-pointer'>
          <FaUser />
          <span className='ml-[10px] font-semibold' onClick={handleLogout}>Logout</span>
        </div>

        <div className='flex flex-col items-center justify-center m-[40px]'>
          <h2 className='font-bold'>Recent Donors</h2>
          <ul>
            <li>1. James Losly</li>
            <li>2. Samuel Setarige</li>
            <li>3. Samuel Setarige</li>
            <li>4. Samuel Setarige</li>
          </ul>
        </div>

        <PieChart
          series={[
            {
              data: bloodGroupData,
              innerRadius: 50,
              outerRadius: 70,
              paddingAngle: 5,
              cornerRadius: 5,
              startAngle: -45,
              endAngle: 225,
              cx: 150,
              cy: 110,
            }
          ]}
        />
      </div>
    </div>
  )
}

export default Admin