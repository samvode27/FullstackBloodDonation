import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Donors from './pages/Donors';
import Prospects from './pages/Prospects';
import Menu from './componenets/Menu';
import Prospect from './pages/Prospect';
import Newdonor from './pages/Newdonor';
import Donor from './pages/Donor';
import { useSelector } from 'react-redux';
import AdminLogin from './pages/AdminLogin';
import DonorLogin from './pages/DonorLogin';
import HospitalLogin from './pages/HospitalLogin';
import DonorRegister from './pages/DonorRegister';
import HospitalRegister from './pages/HospitalRegister';
import Hospital from './pages/Hospital';
import Hospitals from './pages/Hospitals';
import NewHospital from './pages/NewHospital';
import DonorPage from './pages/page/DonorPage';
import HospitalPage from './pages/page/HospitalPage';
import AdminRegister from './pages/AdminRegister';
import DonorForgot from './pages/DonorForgot';
import HospitalForgot from './pages/HospitalForgot';

function App() {
  const admin = useSelector((state) => state.admin);  // Get the entire admin state


  // Create a Layout component for admin
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
    );
  };

  // Define the router with conditional routes based on user state
  const router = createBrowserRouter([
    { path: '/', element: <Home /> },
    { path: '/adminlogin', element: <AdminLogin /> },
    { path: '/adminregister', element: <AdminRegister /> },

    { path: '/donorlogin', element: <DonorLogin /> },
    { path: '/donorregister', element: <DonorRegister /> },
    { path: '/donorforgot', element: <DonorForgot /> },

    { path: '/hospitallogin', element: <HospitalLogin /> },
    { path: '/hospitalregister', element: <HospitalRegister /> },

    { path: '/donorpage', element: <DonorPage /> },
    { path: '/hospitalpage', element: <HospitalPage /> },
    { path: '/hospitalforgot', element: <HospitalForgot /> },

    {
      path: '/admin',
      element: admin.currentUser ? <Layout /> : <Navigate to="/adminlogin" />, // Safe check for currentUser
      children: [
        { path: '/admin', element: <Admin /> },
        { path: '/admin/donors', element: <Donors /> },
        { path: '/admin/newdonor', element: <Newdonor /> },
        { path: '/admin/donor/:id', element: <Donor /> },
        { path: '/admin/hospitals', element: <Hospitals /> },
        { path: '/admin/newhospital', element: <NewHospital /> },
        { path: '/admin/hospital/:id', element: <Hospital /> },
        { path: '/admin/prospects', element: <Prospects /> },
        { path: '/admin/prospect/:id', element: <Prospect /> },
      ]
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;
