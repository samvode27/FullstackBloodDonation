import React, { useState } from 'react';
import { publicRequest } from '../requestMethods';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const HospitalRegister = () => {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleHopsitals = async (e) => {
    e.preventDefault();
    try {
      await publicRequest.post("/hospitals", inputs);
      toast.success("Hospital registered successfully.");
      setInputs({});
      setTimeout(() => {
        navigate('/hospitallogin');
      }, 2000);
    } catch (error) {
      toast.error("Failed to register: " + error.message);
      console.error(error);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" />

      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
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
        </div>
      </nav>

      <main className="container d-flex justify-content-center align-items-center min-vh-100" style={{ paddingTop: '100px' }}>
        <div className="card shadow p-4 w-100" style={{ maxWidth: '500px' }}>
          <h2 className="text-center mb-4">Hospital Registration</h2>

          <form onSubmit={handleHopsitals} noValidate>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Hospital Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                placeholder="Example Hospital"
                value={inputs.name || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Hospital Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                placeholder="hospital@example.com"
                value={inputs.email || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Hospital Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                placeholder="********"
                value={inputs.password || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="address" className="form-label">Address</label>
              <input
                type="text"
                className="form-control"
                id="address"
                name="address"
                placeholder="123 Main St"
                value={inputs.address || ""}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="tel" className="form-label">Telephone Number</label>
              <input
                type="tel"
                className="form-control"
                id="tel"
                name="tel"
                placeholder="0123456789"
                value={inputs.tel || ""}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-danger w-100 mb-3">
              Register
            </button>

            <div className="text-center">
              <span>Already have an account? </span>
              <Link to="/hospitallogin" className="fw-semibold text-decoration-none">
                Log In
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default HospitalRegister;
