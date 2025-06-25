// src/pages/DonorVerifyCode.jsx
import React, { useState,  useEffect} from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { publicRequest } from '../requestMethods';
import { useNavigate, useLocation } from 'react-router-dom';
import './HospitalVerifyCode.css'; // optional CSS file

const HospitalVerifyCode = () => {

  const [code, setCode] = useState('');
  const [resending, setResending] = useState(false);
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const navigate = useNavigate();

  useEffect(() => {
    if (email) {
      publicRequest.post("/hospitals/sendverificationcode", { email })
        .then(() => toast.success("Verification code sent!"))
        .catch(() => toast.error("Failed to send code"));
    }
  }, [email]);

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await publicRequest.patch('/hospital/verifyverificationcode', { email, providedCode: code });
      toast.success('Account verified! Please log in.');
      setTimeout(() => navigate('/hospitallogin'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await publicRequest.post('/hospitals/sendverificationcode', { email });
      toast.success("Verification code resent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Resend failed");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-wrapper d-flex justify-content-center align-items-center min-vh-100">
      <ToastContainer />
      <div className="verify-card card shadow p-4 rounded" style={{ width: '100%', maxWidth: 450 }}>
        <h3 className="text-center mb-4 text-primary">Verify Your Email</h3>
        <form onSubmit={handleVerify}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={email} required onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Verification Code</label>
            <input className="form-control" type="text" value={code} required onChange={(e) => setCode(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary w-100">Verify</button>
        </form>
        <button onClick={handleResend} className="btn btn-link mt-3 w-100" disabled={resending}>
          {resending ? 'Resending...' : 'Resend Code'}
        </button>
      </div>
    </div>
  );
};

export default HospitalVerifyCode;
