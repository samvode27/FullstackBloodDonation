import React, { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import {Link} from 'react-router-dom'
import {FaTrash} from 'react-icons/fa'
import { publicRequest } from '../requestMethods';

const Hospitals = () => {

  const [hospitals, setHospitals] = useState([]);

  const columns = [
    { field: "_id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "email", headerName: "Email", width: 100 },
    { field: "address", headerName: "Address", width: 100 },
    { field: "tel", headerName: "Telephone", width: 100 },
    {
      field: "edit",
      headerName: "Edit",
      width: 150,
      renderCell: (params) => {
        return (
          <>
            <Link to={`/admin/hospital/${params.row._id}`}>
              <button className="bg-gray-400 text-white cursor-pointer w-[70px]">
                Edit
              </button>
            </Link>
          </>
        );
      },
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 150,
      renderCell: (params) => {
        return (
          <>
            <FaTrash
              className="text-red-500 cursor-pointer m-2"
              onClick={() => handleDelete(params.row._id)}
            />
          </>
        );
      },
    },
  ];

  useEffect(() => {
    const getHospitals = async () => {
      try {
        const res = await publicRequest.get("/hospitals")
        setHospitals(res.data)
      } catch (error) {
        console.log(error)
      }
    }
    getHospitals()
  }, [])

  const handleDelete = async (id) => {
    try {
      await publicRequest.delete(`/hospitals/${id}`)
      window.location.reload()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='w-[70vw]'> 
      <div className='flex items-center justify-between m-[30px]'>
        <h1 className='m-[20px] text-[20px] font-semibold'>All Donors</h1>
        <Link to="/admin/newhospital">
          <button className='bg-[#1e1e1e] text-white p-[10px] cursor-pointer font-semibold'>New Hospital</button>
        </Link>
      </div>

      <div  style={{ height: 600, width: '100%' }} className='m-[30px]'>
        <DataGrid rows={hospitals} getRowId={(row) => row._id} checkboxSelection columns={columns} />
      </div>
    </div>
  )
}

export default Hospitals