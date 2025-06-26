import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Gauge, Droplet, Users, Settings,
  Moon, Sun, Menu as MenuIcon, LogOut, UserCircle,
  ChevronDown, BarChart
} from 'lucide-react';
import './Sidebar.css';

const AdminSidebar = () => {
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored ? stored === 'true' : systemPrefersDark;
  });
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [submenuOpen, setSubmenuOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', next);
  };

  useEffect(() => {
    const resizeHandler = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };
    resizeHandler();
    window.addEventListener('resize', resizeHandler);
    return () => window.removeEventListener('resize', resizeHandler);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <Gauge size={18} />, to: '/admin' },
    { key: 'requests', label: 'Blood Requests', icon: <Droplet size={18} />, to: '/requests', badge: 4 },
    { key: 'donors', label: 'Donors', icon: <Users size={18} />, to: '/donors' },
    {
      key: 'reports',
      label: 'Reports',
      icon: <BarChart size={18} />,
      submenu: [
        { label: 'Daily', to: '/reports/daily' },
        { label: 'Monthly', to: '/reports/monthly' }
      ]
    },
    { key: 'settings', label: 'Settings', icon: <Settings size={18} />, to: '/settings' },
    { key: 'newslatter', label: 'NewsLatter', icon: <Newslatter size={18} />, to: '/newsletter' },
  ];

  return (
    <div className={`sidebar-container ${darkMode ? 'dark' : ''}`}>
      <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="user-info">
            <UserCircle size={28} />
            {isOpen && (
              <div>
                <div className="user-name">Admin</div>
                <div className="user-role">Blood Bank</div>
              </div>
            )}
          </div>
          <MenuIcon className="toggle-icon" onClick={toggleSidebar} />
        </div>

        <div className="sidebar-scroll">
          <ul className="sidebar-menu">
            {menuItems.map(item =>
              item.submenu ? (
                <li key={item.key} className={`submenu-parent ${submenuOpen ? 'open' : ''}`} onClick={() => setSubmenuOpen(!submenuOpen)} title={item.label}>
                  <div className="menu-item">
                    {item.icon}
                    <span className="menu-label">{isOpen && item.label}</span>
                    <ChevronDown className={`chevron ${submenuOpen ? 'rotate' : ''}`} size={16} />
                  </div>
                  {submenuOpen && isOpen && (
                    <ul className="submenu">
                      {item.submenu.map(sub => (
                        <li key={sub.label}><NavLink to={sub.to}>{sub.label}</NavLink></li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={item.key} title={item.label}>
                  <NavLink to={item.to} className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
                    {item.icon}
                    {isOpen && <span className="menu-label">{item.label}</span>}
                    {item.badge && isOpen && <span className="badge">{item.badge}</span>}
                  </NavLink>
                </li>
              )
            )}

            <li onClick={toggleTheme} className="menu-item theme-toggle" title="Toggle Theme">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              {isOpen && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
            </li>

            <li className="menu-item logout" title="Logout">
              <LogOut size={18} />
              {isOpen && <span>Logout</span>}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
