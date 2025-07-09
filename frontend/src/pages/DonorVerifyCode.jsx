// src/pages/DonorVerifyCode.jsx
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { publicRequest } from '../requestMethods';
import { useNavigate, useLocation } from 'react-router-dom';
import './DonorVerifyCode.css';

const DonorVerifyCode = () => {
  const [code, setCode] = useState('');
  const [resending, setResending] = useState(false);
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const navigate = useNavigate();

  useEffect(() => {
    if (email) {
      publicRequest.post("/donors/sendverificationcode", { email })
        .then(() => toast.success("Verification code sent!"))
        .catch(() => toast.error("Failed to send code"));
    }
  }, [email]);

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await publicRequest.patch('/donors/verifyverificationcode', { email, providedCode: code });
      toast.success('Account verified! Please log in.');
      setTimeout(() => navigate('/donorlogin'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await publicRequest.post('/donors/sendverificationcode', { email });
      toast.success("Verification code resent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Resend failed");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-container d-flex justify-content-center align-items-center min-vh-100 p-3">
      <ToastContainer />
      <div>
        <form onSubmit={handleVerify} className="p-4 border rounded shadow-sm" style={{ width: '350px' }}>
          <h4 className="mb-4 text-center">Verify Your Email</h4>

          <div className="mb-3">
            <label htmlFor="emailInput" className="form-label fw-medium">Email Address</label>
            <input
              id="emailInput"
              type="email"
              className="form-control py-2"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="code" className="form-label fw-medium">Verification Code</label>
            <input id="codeInput"
              type="text"
              className="form-control py-2"
              value={code}
              required
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code here" />
          </div>

          <button type="submit" className="btn btn-primary w-100 fw-semibold py-1 fs-5">Verify</button>
        </form>

        <button
          onClick={handleResend}
          disabled={resending}
          className="resendbtn mt-3 w-100 fw-semibold py-2"
        >
          {resending ? 'Resending...' : 'Resend Code'}
        </button>
      </div>
    </div>
  );
};

export default DonorVerifyCode;
