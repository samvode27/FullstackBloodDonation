// DonorForgot.jsx - Enhanced with Bootstrap & external CSS
import React, { useState } from 'react';
import { donorSendForgotPasswordCode, donorVerifyForgotPasswordCode } from '../redux/apiCalls';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import './DonorForgot.css';

const DonorForgot = () => {
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    try {
      await donorSendForgotPasswordCode(email);
      setCodeSent(true);
      toast.success('Reset code sent to your email.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset code.');
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      await donorVerifyForgotPasswordCode({ 
        email: email,
        providedCode: code,
        newPassword: newPassword
      });
      toast.success('Password updated successfully.');
      setTimeout(() => {
        navigate('/donorlogin');
      }, 2000); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="forgot-wrapper d-flex justify-content-center align-items-center">
      <ToastContainer position="top-center" />
      <div className="forgot-card card p-4 shadow">
        <h3 className="text-center text-danger mb-4">Donor Forgot Password</h3>
        <form onSubmit={codeSent ? handleVerifyCode : handleSendCode}>
          <div className="form-group mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {codeSent && (
            <>
              <div className="form-group mb-3">
                <label htmlFor="code" className="form-label">Verification Code</label>
                <input
                  type="text"
                  className="form-control"
                  id="code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="newPassword" className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="newPassword"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-danger w-100">
            {codeSent ? 'Reset Password' : 'Send Reset Code'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonorForgot;
