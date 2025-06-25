import React, { useState, useEffect } from 'react';
import '../App.css';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/adminRedux';
import {
  BsPersonCircle,
  BsJustify,
  BsCart3,
  BsGrid1X2Fill,
  BsFillGrid3X3GapFill,
  BsPeopleFill,
  BsListCheck,
  BsMoonFill,
  BsSunFill
} from 'react-icons/bs';

const Header = ({ OpenSidebar, isDark, toggleDarkMode }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className='header'>
      <div className='menu-icon' title="Toggle Sidebar">
        <BsJustify className='icon' onClick={OpenSidebar} />
      </div>

      <div className='header-right'>
        <span
          style={{ marginTop: "-1px" }}
          className='icon theme-toggle'
          onClick={toggleDarkMode}
          title="Toggle Theme"
        >
          {isDark ? <BsSunFill /> : <BsMoonFill />}
        </span>

        <div className="profile-menu" tabIndex={0} aria-label="User Profile Menu">
          <BsPersonCircle className='icon profile-icon' title="User" />
          <div className="profile-dropdown">
            <span>👤 Profile</span>
            <span onClick={handleLogout}>🔒 Logout</span>
          </div>
        </div>
      </div>
    </header>
  );
};

const Sidebar = ({ openSidebarToggle, OpenSidebar, pathname }) => {
  const menuItems = [
    { icon: <BsGrid1X2Fill />, label: 'Dashboard', path: '/admin' },
    { icon: <BsPeopleFill />, label: 'Donors', path: '/admin/donors' },
    { icon: <BsFillGrid3X3GapFill />, label: 'Hospitals', path: '/admin/hospitals' },
    { icon: <BsListCheck />, label: 'Requests', path: '/admin/requests' },
  ];

  return (
    <aside id="sidebar" className={`${openSidebarToggle ? 'sidebar-responsive' : ''} sidebar`}>
      <div className='sidebar-title'>
        <div className='sidebar-brand'>
          <BsCart3 className='icon_header' />
          <span className='brand-text'>Admin</span>
        </div>
        <span className='icon close_icon' onClick={OpenSidebar}>×</span>
      </div>

      <ul className='sidebar-list'>
        {menuItems.map((item, i) => (
          <li
            key={i}
            className={`sidebar-list-item ${pathname === item.path ? 'active-menu' : ''}`}
          >
            <a href={item.path} className="menu-item" title={item.label}>
              {item.icon}
              <span className="menu-label">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
};

const Menu = () => {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(window.innerWidth >= 768);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  const OpenSidebar = () => setOpenSidebarToggle(prev => !prev);
  const toggleDarkMode = () => {
    document.body.classList.toggle('dark');
    setIsDark(prev => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setOpenSidebarToggle(false);
      else setOpenSidebarToggle(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <div className='grid-container'>
      <Header OpenSidebar={OpenSidebar} isDark={isDark} toggleDarkMode={toggleDarkMode} />
      <Sidebar
        openSidebarToggle={openSidebarToggle}
        OpenSidebar={OpenSidebar}
        pathname={location.pathname}
      />
      <main className='main-container'>
        <Outlet />
      </main>
    </div>
  );
};

export default Menu;
