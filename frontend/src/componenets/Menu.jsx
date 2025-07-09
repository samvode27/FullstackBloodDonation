import React, { useState, useEffect } from 'react';
import '../App.css';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './Menu.css';
import { logout } from '../redux/adminRedux';
import { adminRequest } from '../requestMethods';
import {
  Modal,
  Button,
  Form,
  Alert,
  Spinner,
} from 'react-bootstrap';
import {
  BsPersonCircle,
  BsJustify,
  BsCart3,
  BsGridFill,
  BsPeopleFill,
  BsBuilding,
  BsClipboardCheck,
  BsMoonFill,
  BsSunFill,
} from 'react-icons/bs';
import { MdOutlineEmail } from 'react-icons/md';

const Header = ({
  OpenSidebar,
  isDark,
  toggleDarkMode,
  isMobile,
  openProfileModal,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className='header navbar navbar-expand-lg navbar-dark bg-primary px-3'>
      {isMobile && (
        <button
          className='btn btn-outline-light me-3 d-flex align-items-center justify-content-center'
          onClick={OpenSidebar}
          title="Toggle Sidebar"
        >
          <BsJustify size={20} />
        </button>
      )}

      <span className='navbar-brand mb-0 h1'>Admin Panel</span>

      <div className='ms-auto d-flex align-items-center'>
        <button
          className='btn btn-light me-3 theme-toggle-btn'
          onClick={toggleDarkMode}
          title="Toggle Theme"
        >
          {isDark ? <BsSunFill /> : <BsMoonFill />}
        </button>

        <div className="dropdown">
          <button
            className="btn btn-light dropdown-toggle d-flex align-items-center profile-btn"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <BsPersonCircle className='me-2' size={20} />
            <span className="d-none d-md-inline">Admin</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <span
                className="dropdown-item"
                style={{ cursor: "pointer" }}
                onClick={openProfileModal}
              >
                👤 Profile
              </span>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <span
                className="dropdown-item"
                style={{ cursor: "pointer" }}
                onClick={handleLogout}
              >
                🔒 Logout
              </span>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

const Sidebar = ({ openSidebarToggle, OpenSidebar, pathname, isMobile }) => {
  const menuItems = [
    { icon: <BsGridFill />, label: 'Dashboard', path: '/admin' },
    { icon: <BsPeopleFill />, label: 'Donors', path: '/admin/donors' },
    { icon: <BsBuilding />, label: 'Hospitals', path: '/admin/hospitals' },
    { icon: <BsClipboardCheck />, label: 'Requests', path: '/admin/requests' },
    { icon: <MdOutlineEmail />, label: 'NewsLetter', path: '/admin/newsletter' },
    { icon: <MdOutlineEmail />, label: 'Compain', path: '/admin/campaigns' },
  ];

  return (
    <aside
      id="sidebar"
      className={`${openSidebarToggle ? 'sidebar-responsive' : ''} sidebar`}
    >
      <div className='sidebar-title'>
        <div className='sidebar-brand'>
          <BsCart3 className='icon_header' />
          <span className='brand-text'>Admin</span>
        </div>
        {isMobile && (
          <span className='icon close_icon' onClick={OpenSidebar}>×</span>
        )}
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileModal, setProfileModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const OpenSidebar = () => setOpenSidebarToggle(prev => !prev);
  const toggleDarkMode = () => {
    document.body.classList.toggle('dark');
    setIsDark(prev => !prev);
  };

  const openProfileModal = () => {
    setProfileModal(true);
    setMessage('');
    setError('');
  };
  const closeProfileModal = () => {
    setProfileModal(false);
    setPasswords({ currentPassword: '', newPassword: '' });
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setOpenSidebarToggle(!mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await adminRequest.get('/profile');
        setProfile(res.data);
        setFormData({
          name: res.data.name,
          email: res.data.email
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load profile.');
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSave = async () => {
    try {
      setSaving(true);
      const res = await adminRequest.put('/profile', formData);
      setProfile(res.data.admin);
      setMessage('Profile updated!');
    } catch (err) {
      console.error(err);
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      setSaving(true);
      const res = await adminRequest.put('/change-password', passwords);
      setMessage(res.data.message);
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='grid-container'>
      <Header
        OpenSidebar={OpenSidebar}
        isDark={isDark}
        toggleDarkMode={toggleDarkMode}
        isMobile={isMobile}
        openProfileModal={openProfileModal}
      />
      <Sidebar
        openSidebarToggle={openSidebarToggle}
        OpenSidebar={OpenSidebar}
        pathname={location.pathname}
        isMobile={isMobile}
      />
      <main className='main-container'>
        <Outlet />
      </main>

      <Modal show={profileModal} onHide={closeProfileModal}>
        <Modal.Header closeButton>
          <Modal.Title>Admin Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingProfile ? (
            <Spinner animation="border" />
          ) : (
            <>
              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  onClick={handleProfileSave}
                  disabled={saving}
                >
                  Save Profile
                </Button>
              </Form>

              <hr />

              <h5>Change Password</h5>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, currentPassword: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, newPassword: e.target.value })
                    }
                  />
                </Form.Group>
                <Button
                  variant="warning"
                  onClick={handlePasswordChange}
                  disabled={saving}
                >
                  Change Password
                </Button>
              </Form>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Menu;
