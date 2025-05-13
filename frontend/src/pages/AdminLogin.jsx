import React, { useState } from 'react';
import { Link, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { Adminlogin } from "../redux/apiCalls";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const admin = useSelector((state) => state.admin);

  if (admin?.currentUser) {
    return <Navigate to="/admin" />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (email && password) {
      try {
        setLoading(true);
        await Adminlogin(dispatch, { email, password });
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-lg border-0 rounded-4 d-flex flex-row overflow-hidden" style={{ maxWidth: '900px' }}>
        
        {/* Left Image Panel */}
        <div className="d-none d-md-block" style={{ width: '50%' }}>
          <img src="/hero1.jpg" alt="login" className="img-fluid h-100 w-100 object-fit-cover" />
        </div>

        {/* Right Login Form Panel */}
        <div className="p-5" style={{ width: '100%', maxWidth: '450px' }}>
          <div className="mb-4 text-center">
            <h2 className="fw-bold text-danger">Blood Bank Admin Login</h2>
            <p className="text-muted">Manage blood donations, inventories, and requests efficiently</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input type="email" className="form-control" id="email" placeholder="admin@bloodbank.com"
                onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label">Password</label>
              <input type="password" className="form-control" id="password" placeholder="********"
                onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button type="submit" className="btn btn-danger w-100 fw-bold mb-3">
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="d-flex justify-content-between">
              <a href="#" className="text-decoration-none text-muted">Forgot password?</a>
              <Link to="/adminregister" className="text-decoration-none text-muted">Create account</Link>
            </div>
          </form>

          <div className="mt-4 text-center">
            <small className="text-muted">© 2025 Blood Bank Management System</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
