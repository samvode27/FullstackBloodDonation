import {Outlet, RouterProvider, createBrowserRouter} from 'react-router-dom'
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Donors from './pages/Donors';
import Prospects from './pages/Prospects';
import Menu from './componenets/Menu';
import Prospect from './pages/Prospect';
import Newdonor from './pages/Newdonor';
import Donor from './pages/Donor';

function App() {

    const Layout = () => {
      return(
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
      {
        path: '/',  element: <Home />
      },
      {
        path: '/login',  element: <Login />
      },
      {
        path: '/admin',  
        element: <Layout />, 
        children: [
          {
            path: '/admin',
            element: <Admin />
          },
          {
            path: '/admin/donors',
            element: <Donors />
          },
          {
            path: '/admin/prospects',
            element: <Prospects />
          },
          {
            path: '/admin/prospect/:id',
            element: <Prospect />
          },
          {
            path: '/admin/newdonor',
            element: <Newdonor />
          },
          {
            path: '/admin/donor/:id',
            element: <Donor />
          },
        ]
      },
    ])

    return (
       <RouterProvider router={router} />
    );
  };


export default App;
