import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-scroll';

const Navbar = () => {
  const navigate = useNavigate();

  const AdminLogin = () => {
    navigate("/adminlogin");
  };

  const HospitalLogin = () => {
    navigate("/hospitallogin");
  };

  return (
    <>
      {/* Fixed Top Header */}
      <div className="bg-red py-2 w-100" style={{ position: 'fixed', top: 0, zIndex: 1030, backgroundColor: "#de1f26", fontSize: "19px", color: "white"}}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 d-none d-lg-flex">
              <ul className="list-inline mb-0">
                <li className="list-inline-item me-3">
                  <i className="far fa-envelope me-1"></i>
                  sales@smarteyeapps.com
                  <span className="mx-2">|</span>
                </li>
                <li className="list-inline-item">
                  <i className="far fa-clock me-1"></i>
                  Service Time : 12:AM
                </li>
              </ul>
            </div>
            <div className="col-lg-6 text-end">
              <ul className="list-inline mb-0">
                <li className="list-inline-item me-3">
                  <i className="fas fa-cloud-upload-alt me-1"></i>
                  Upload Video
                  <span className="mx-2">|</span>
                </li>
                <li className="list-inline-item">
                  <i className="fas fa-user me-1"></i>
                  Login
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Navbar */}
      <nav  className="navbar navbar-expand-lg navbar-light bg-white py-3 shadow-sm w-100"  style={{ position: 'fixed', top: '40px', zIndex: 1020 }}>
        <div className="container">
          <a className="navbar-brand" href="/">
            <img
              src="/Logo.jpg"
              alt="Logo"
              height="50"
              width="220"
              className="d-inline-block align-text-top"
            />
          </a>

          <div id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item" style={{fontSize: "19px"}}>
                <Link
                  to="hero"
                  smooth={true}
                  duration={1000}
                  className="nav-link text-dark"
                  style={{ cursor: 'pointer', fontFamily: "montserrat", color: "#151616", fontStyle: "bold" }}
                >
                  Home
                </Link>
              </li>
              <li className="nav-item" style={{fontSize: "19px"}}>
                <Link
                  to="featured"
                  smooth={true}
                  duration={1000}
                  className="nav-link "
                  style={{ cursor: 'pointer', fontFamily: "montserrat" }}
                >
                  About Us
                </Link>
              </li>
              <li className="nav-item" style={{fontSize: "19px"}}>
                <Link
                  to="process"
                  smooth={true}
                  duration={1000}
                  className="nav-link"
                  style={{ cursor: 'pointer', fontFamily: "revert" }}
                >
                  Process
                </Link>
              </li>
              <li className="nav-item" style={{fontSize: "19px"}}>
                <Link
                  to="footer"
                  smooth={true}
                  duration={1000}
                  className="nav-link"
                  style={{ cursor: 'pointer', fontFamily: "revert" }}
                >
                  Footer
                </Link>
              </li>
              <li className="nav-item">
                <button onClick={AdminLogin} className="btn btn-danger btn-md ms-3">
                  Admin
                </button>
              </li>
              <li className="nav-item">
                <button onClick={HospitalLogin} className="btn btn-danger btn-md ms-3">
                  Hospital
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Spacer div to push content below fixed headers */}
      <div style={{ height: '100px' }}></div>
    </>
  );
};

export default Navbar;
