import React, { useState } from 'react';
import { Link, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { Adminlogin } from "../redux/apiCalls";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminLogin.css';

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

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      await Adminlogin(dispatch, { email, password });
      setLoading(false);
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" />

      <main className="admin-login-container">
        <div className="admin-login-card">
          <div className="text-center mb-4">
            <img
              src="/Logo.jpg"
              alt="Blood Bank Logo"
              className="admin-login-logo mb-3"
            />
            <h2 className="admin-login-title">Admin Login</h2>
            <p className="admin-login-subtitle">Access the blood bank management dashboard</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control admin-login-input"
                id="email"
                placeholder="admin@bloodbank.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="email">Email address</label>
            </div>

            <div className="form-floating mb-4">
              <input
                type="password"
                className="form-control admin-login-input"
                id="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="password">Password</label>
            </div>

            <button
              type="submit"
              className="btn admin-login-btn w-100 fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <small className="admin-login-footer">
              © 2025 Blood Bank Management System
            </small>
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminLogin;
