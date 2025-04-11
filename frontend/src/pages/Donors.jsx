import React from 'react'
import { DataGrid } from '@mui/x-data-grid';
import {Link} from 'react-router-dom'
import {FaTrash} from 'react-icons/fa'

const Donors = () => {

  const columns = [
    { field: "_id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "address", headerName: "Address", width: 150 },
    { field: "bloodgroup", headerName: "BloodType", width: 130 },
    { field: "diseases", headerName: "Disease", width: 150 },
    {
      field: "edit",
      headerName: "Edit",
      width: 150,
      renderCell: () => {
        return (
          <>
            <Link to={`/donor/123`}>
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

  const rows = [
    {
      id: '1',
      name: "John Doe",
      address: "123 Town Street",
      bloodType: "A+",
      disease: "None"
    },
    {
      id: 2,
      name: "Abebe",
      address: "1234 Town Street",
      bloodType: "A-",
      disease: "Diabets"
    },
    {
      id: 3,
      name: "John Doe",
      address: "123 Town Street",
      bloodType: "B+",
      disease: "Diabets"
    },
    {
      id: 4,
      name: "John Doe",
      address: "123 Town Street",
      bloodType: "A+",
      disease: "Diabets"
    },
    {
      id: 5,
      name: "John Doe",
      address: "123 Town Street",
      bloodType: "A+",
      disease: "Diabets"
    },
    {
      id: 6,
      name: "John Doe",
      address: "123 Town Street",
      bloodType: "A+",
      disease: "Diabets"
    },
    {
      id: 7,
      name: "John Doe",
      address: "123 Town Street",
      bloodType: "A+",
      disease: "Diabets"
    },
    {
      id: 1,
      name: "John Doe",
      address: "123 Town Street",
      bloodType: "A+",
      disease: "Diabets"
    },
    {
      id: 8,
      name: "John Doe",
      address: "123 Town Street",
      bloodType: "A+",
      disease: "Diabets"
    },
    {
      id: 9,
      name: "John Doe",
      address: "123 Town Street",
      bloodType: "A+",
      disease: "Diabets"
    },
    {
      id: 10,
      name: "John Doe",
      address: "123 Town Street",
      bloodType: "A+",
      disease: "Diabets"
    },
  ]

  return (
    <div className='w-[70vw]'> 
      <div className='flex items-center justify-between m-[30px]'>
        <h1 className='m-[20px] text-[20px] font-semibold'>All Donors</h1>
        <button className='bg-[#1e1e1e] text-white p-[10px] cursor-pointer font-semibold'>New Donor</button>
      </div>

      <div className='m-[30px]'>
        <DataGrid rows={rows} checkboxSelection columns={columns} />
      </div>
    </div>
  )
}

export default Donors