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
    <div className="verify-container d-flex justify-content-center align-items-center min-vh-100 p-3">
      <ToastContainer/>
      <div>
        <form onSubmit={codeSent ? handleVerifyCode : handleSendCode} className="p-4 border rounded shadow-sm" style={{ width: '350px' }}>
          <h4 className="mb-4 text-center">Donor Forgot Password</h4>
          
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-medium">Email address</label>
            <input
              type="email"
              className="form-control py-2"
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
