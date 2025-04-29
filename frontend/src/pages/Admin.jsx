import React, { useEffect, useState } from 'react'
import { FaUser } from 'react-icons/fa';
import { publicRequest } from '../requestMethods';
import { logout } from '../redux/userRedux';
import { useNavigate } from "react-router-dom"
import { useDispatch } from 'react-redux'

const Admin = () => {
  const [bloodGroupData, setBloodGroupData] = useState([])
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const getBloodGroupStats = async () => {
      try {
        const res = await publicRequest.get("/donors/stats")
        const transformedData = res.data.map((item, index) => ({
          id: index,
          value: item.count,
          label: `Blood Group ${item._id}`
        }))
        setBloodGroupData(transformedData)
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
    <div className="d-flex flex-column bg-light shadow" style={{ width: '100vw', height: '100vh' }}>
      
      <div className="d-flex align-items-center p-3 border-bottom">
        <FaUser />
        <span className="ms-2 fw-semibold cursor-pointer" onClick={handleLogout}>Logout</span>
      </div>

      <div className="px-3 flex-grow-1 overflow-auto">
        <h5 className="fw-bold text-center mb-3">Blood Group Stats</h5>
        <div className="row">
          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type, index) => {
            const found = bloodGroupData.find((b) => b.label.includes(type));
            const value = found ? found.value : 0;

            return (
              <div key={index} className="col-6 col-md-3 mb-4">
                <div className="bg-white border rounded shadow-sm p-3 text-center h-100">
                  <div className="fw-semibold">Blood Group {type}</div>
                  <div className="text-danger fw-bold fs-5">{value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}

export default Admin
