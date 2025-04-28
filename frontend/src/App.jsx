import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import Home from './pages/Home';
import Admin from './pages/Admin';
import Donors from './pages/Donors';
import Prospects from './pages/Prospects';
import Menu from './componenets/Menu';
import Prospect from './pages/Prospect';
import Newdonor from './pages/Newdonor';
import Donor from './pages/Donor';
import { useSelector } from 'react-redux'
import AdminLogin from './pages/AdminLogin';
import DonorLogin from './pages/DonorLogin';
import HospitalLogin from './pages/HospitalLogin';
import DonorRegister from './pages/DonorRegister';
import HospitalRegister from './pages/HospitalRegister';
import Hospital from './pages/Hospital';
import Hospitals from './pages/Hospitals';
import NewHospital from './pages/NewHospital';

function App() {
  const user = useSelector((state) => state.user)

  const Layout = () => {
    return (
      <div className='flex'>
        <div>
          <Menu />
        </div>
        <div>
          <Outlet />
        </div>
      </div>
    )
  }

  const router = createBrowserRouter([

    {  path: '/', element: <Home />  },
    {  path: '/adminlogin', element: <AdminLogin />  },
    {  path: '/donorlogin', element: <DonorLogin />  }, 
    {  path: '/donorregister', element: <DonorRegister />  }, 
    {  path: '/hospitallogin', element: <HospitalLogin />  },
    {  path: '/hospitalregister', element: <HospitalRegister />  }, 
    {
      path: '/admin',
      element: user.currentUser ? <Layout /> : <Navigate to="/login" />,
      children: [

        {  path: '/admin',  element: <Admin />  },
        {  path: '/admin/donors',  element: <Donors />  },
        {  path: '/admin/newdonor',  element: <Newdonor />  },
        {  path: '/admin/donor/:id',  element: <Donor />  },
        {  path: '/admin/hospitals',  element: <Hospitals />  },
        {  path: '/admin/newhospital',  element: <NewHospital />  },
        {  path: '/admin/hospital/:id',  element: <Hospital />  },
        {  path: '/admin/prospects',  element: <Prospects />  },
        {  path: '/admin/prospect/:id',  element: <Prospect />  },
       
      ]
    },
  ])

  return (
    <RouterProvider router={router} />
  );
};


export default App;
