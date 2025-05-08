import React, { useState } from 'react';
import { publicRequest } from '../requestMethods';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

const AdminRegister = () => {
  const [inputs, setInputs] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdmin = async (e) => {
    e.preventDefault();
    try {
      await publicRequest.post("/admin", inputs);
      toast.success("Admin registered successfully.");
      setInputs({});
    } catch (error) {
      toast.error("Registration failed: " + error.message);
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
        <div className="card shadow-sm p-4 w-100" style={{ maxWidth: '600px' }}>
          <h2 className="text-center mb-4">Admin Registration</h2>

          <form onSubmit={handleAdmin} noValidate>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                placeholder="John Doe"
                value={inputs.name || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                placeholder="johndoe@example.com"
                value={inputs.email || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
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

            <button type="submit" className="btn btn-danger w-100 mb-3">
              Submit
            </button>

            <div className="text-center">
              <span>Already have an account? </span>
              <Link to="/adminlogin" className="fw-semibold text-decoration-none">
                Log In
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default AdminRegister;
