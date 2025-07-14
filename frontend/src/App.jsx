import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from './pages/page/Home';
import Admin from './pages/Admin';
import Donors from './pages/Donors';
import Menu from './componenets/Menu';
import AdminLogin from './pages/AdminLogin';
import DonorAuth from './pages/DonorAuth ';
import HospitalAuth from './pages/HospitalAuth';
import Hospitals from './pages/Hospitals';
import HospitalPage from './pages/page/HospitalPage';
import DonorForgot from './pages/DonorForgot';
import HospitalForgot from './pages/HospitalForgot';
import BloodRequest from './pages/BloodRequest';
import DonorPage from './pages/page/DonorPage';
import DonorVerifyCode from './pages/DonorVerifyCode';
import HospitalVerifyCode from './pages/HospitalVerifyCode';
import { Toaster } from 'react-hot-toast';
import Newsletter from './pages/Newsletter';
import Campaigns from './pages/Campaigns';


function App() {
  const admin = useSelector((state) => state.admin);  // Get the entire admin state

  <Toaster position="top-right" />

  // Create a Layout component for admin
  const Layout = () => <Menu />;

  // Define the router with conditional routes based on user state
  const router = createBrowserRouter([
    { path: '/', element: <Home /> },
    { path: '/adminlogin', element: <AdminLogin /> },

    { path: '/donorlogin', element: <DonorAuth isLogin={true} /> },
    { path: '/donorregister', element: <DonorAuth isLogin={false} /> },

    { path: '/donorforgot', element: <DonorForgot /> },
    { path: '/donorverifycode', element: <DonorVerifyCode /> },

    { path: '/hospitallogin', element: <HospitalAuth isLogin={true} /> },
    { path: '/hospitalregister', element: <HospitalAuth isLogin={false} /> },

    { path: '/hospitalforgot', element: <HospitalForgot /> },
    { path: '/hospitalverifycode', element: <HospitalVerifyCode /> },

    { path: '/donorpage', element: <DonorPage /> },
    { path: '/hospitalpage', element: <HospitalPage /> },
    { path: '/hospitalforgot', element: <HospitalForgot /> },

    {
      path: '/admin',
      element: admin.currentUser ? <Layout /> : <Navigate to="/adminlogin" />, // Safe check for currentUser
      children: [
        { path: '/admin', element: <Admin /> },
        { path: '/admin/donors', element: <Donors /> },
        { path: '/admin/hospitals', element: <Hospitals /> },
        { path: '/admin/requests', element: <BloodRequest /> },
        { path: '/admin/newsletter', element: <Newsletter /> },
        { path: '/admin/campaigns', element: <Campaigns /> },

      ]
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;
