// Enhanced DonorAuth Component with Recent Styles
import React, { useState } from 'react';
import { publicRequest } from '../requestMethods';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Donorlogin } from '../redux/apiCalls';
import { FaCheckCircle, FaTimesCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import './DonorAuth.css';


const DonorAuth = ({ isLogin }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const donor = useSelector((state) => state.donor);

  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    tel: ''
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    uppercase: false,
    lowercase: false,
    number: false,
    minLength: false
  });

  const validatePassword = (password) => {
    setPasswordCriteria({
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      minLength: password.length >= 8
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'password') validatePassword(value);
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      try {
        await Donorlogin(dispatch, {
          email: inputs.email,
          password: inputs.password
        });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    } else {
      const { uppercase, lowercase, number, minLength } = passwordCriteria;
      if (!uppercase || !lowercase || !number || !minLength) {
        toast.error('Password does not meet all criteria');
        setLoading(false);
        return;
      }

      try {
        await publicRequest.post('/donors/signup', inputs);
        toast.success('Registered successfully! Check your email.');
        setTimeout(() => navigate('/donorverifycode', { state: { email: inputs.email } }), 2000);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    }
  };

  if (isLogin && donor?.currentUser) {
    return <Navigate to="/donorpage" />;
  }

  return (
    <>
      <ToastContainer position="top-center" />
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-white px-4">
        <div className="bg-white shadow-xl rounded-xl w-full max-w-lg p-8 border border-gray-200">
          <h2 className="text-center text-3xl font-extrabold text-red-600 mb-6">
            {isLogin ? 'Donor Login' : 'Donor Registration'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                {['name', 'address', 'tel'].map((field) => (
                  <div key={field}>
                    <label htmlFor={field} className="block text-gray-700 font-medium mb-1">
                      {field.toUpperCase()}
                    </label>
                    <input
                      type="text"
                      id={field}
                      name={field}
                      value={inputs[field]}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                      required
                    />
                  </div>
                ))}
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={inputs.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={inputs.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <span
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute top-2.5 right-3 text-gray-500 cursor-pointer"
                >
                  {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            {!isLogin && (
              <div className="bg-gray-50 border rounded-md p-3">
                <p className="text-sm text-gray-600 mb-1 font-semibold">Password Requirements:</p>
                <ul className="text-sm space-y-1">
                  <li className={passwordCriteria.uppercase ? 'text-green-600' : 'text-red-500'}>
                    {passwordCriteria.uppercase ? <FaCheckCircle className="inline" /> : <FaTimesCircle className="inline" />} One Uppercase Letter
                  </li>
                  <li className={passwordCriteria.lowercase ? 'text-green-600' : 'text-red-500'}>
                    {passwordCriteria.lowercase ? <FaCheckCircle className="inline" /> : <FaTimesCircle className="inline" />} One Lowercase Letter
                  </li>
                  <li className={passwordCriteria.number ? 'text-green-600' : 'text-red-500'}>
                    {passwordCriteria.number ? <FaCheckCircle className="inline" /> : <FaTimesCircle className="inline" />} One Number
                  </li>
                  <li className={passwordCriteria.minLength ? 'text-green-600' : 'text-red-500'}>
                    {passwordCriteria.minLength ? <FaCheckCircle className="inline" /> : <FaTimesCircle className="inline" />} Minimum 8 Characters
                  </li>
                </ul>
              </div>
            )}

            {isLogin && (
              <p className="text-sm text-gray-500">Only verified donors can log in. Please check your email.</p>
            )}

            <button
              type="submit"
              className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition duration-300"
              disabled={loading}
            >
              {loading ? (isLogin ? 'Logging in...' : 'Registering...') : isLogin ? 'Login' : 'Register'}
            </button>

            <div className="text-center mt-4 text-sm">
              {isLogin ? (
                <>
                  <Link to="/donorforgot" className="text-blue-600 hover:underline me-4">
                    Forgot Password?
                  </Link>
                  <Link to="/donorregister" className="text-blue-600 hover:underline">
                    Create an Account
                  </Link>
                </>
              ) : (
                <Link to="/donorlogin" className="text-blue-600 hover:underline">
                  Already have an account? Login
                </Link>
              )}
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default DonorAuth;
