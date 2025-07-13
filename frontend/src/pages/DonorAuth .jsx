import React, { useState } from 'react';
import { publicRequest } from '../requestMethods';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Donorlogin } from '../redux/apiCalls';
import { FaCheckCircle, FaTimesCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
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
    minLength: false,
    specialChar: false,
  });
  const [errors, setErrors] = useState({});

  const validatePassword = (password) => {
    setPasswordCriteria({
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      minLength: password.length >= 8,
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const strength =
    Number(passwordCriteria.uppercase) +
    Number(passwordCriteria.lowercase) +
    Number(passwordCriteria.number) +
    Number(passwordCriteria.specialChar) +
    Number(passwordCriteria.minLength);

  const validateForm = () => {
    const newErrors = {};

    if (!inputs.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[a-zA-Z\s]{2,50}$/.test(inputs.name)) {
      newErrors.name = 'Name should contain only letters and be at least 2 characters';
    }

    if (!inputs.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!inputs.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (inputs.address.length < 5) {
      newErrors.address = 'Address should be at least 5 characters';
    }

    if (!inputs.tel.trim()) {
      newErrors.tel = 'Phone number is required';
    } else if (!/^\d{10}$/.test(inputs.tel)) {
      newErrors.tel = 'Phone number must be 10 digits';
    }

    if (!inputs.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'password') validatePassword(value);
    setInputs((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      try {
        const donorData = await Donorlogin(dispatch, {
          email: inputs.email,
          password: inputs.password,
        });

        if (donorData?.verified) {
          toast.success('Login successful!');
          navigate('/donorpage');
        } else {
          toast.error('The account is not verified.');
          navigate('/donorverifycode', { state: { email: inputs.email } });
        }
      } catch (err) {
        const errorMessage = err?.response?.data?.message || 'Login failed';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      if (!validateForm()) {
        toast.error('Please correct the highlighted fields.');
        setLoading(false);
        return;
      }

      const { uppercase, lowercase, number, specialChar, minLength } = passwordCriteria;
      if (!uppercase || !lowercase || !number || !minLength || !specialChar) {
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
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        theme="colored"
      />
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-pink-50 to-white animate-gradient px-4">
        <div className="bg-white shadow-xl rounded-xl w-full max-w-lg p-8 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-center text-3xl font-extrabold text-red-600 mb-6">
            {isLogin ? 'Donor Login' : 'Donor Registration'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5 animate-fadeIn">
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
                    NAME
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={inputs.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition ${
                      errors.name ? 'border-red-500 shake' : ''
                    }`}
                    required
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="address" className="block text-gray-700 font-medium mb-1">
                    ADDRESS
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={inputs.address}
                    onChange={handleChange}
                    placeholder="e.g. 123 Main Street"
                    className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition ${
                      errors.address ? 'border-red-500 shake' : ''
                    }`}
                    required
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="tel" className="block text-gray-700 font-medium mb-1">
                    PHONE
                  </label>
                  <input
                    type="text"
                    id="tel"
                    name="tel"
                    value={inputs.tel}
                    onChange={handleChange}
                    placeholder="e.g. 0912345678"
                    className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition ${
                      errors.tel ? 'border-red-500 shake' : ''
                    }`}
                    required
                  />
                  {errors.tel && (
                    <p className="text-red-500 text-sm mt-1">{errors.tel}</p>
                  )}
                </div>
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
                placeholder="e.g. johndoe@example.com"
                className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition ${
                  errors.email ? 'border-red-500 shake' : ''
                }`}
                required
                autoFocus
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
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
                  placeholder="Enter your password"
                  className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition ${
                    errors.password ? 'border-red-500 shake' : ''
                  }`}
                  required
                />
                <span
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute top-2.5 right-3 text-gray-500 cursor-pointer"
                >
                  {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {!isLogin && (
              <>
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
                    <li className={passwordCriteria.specialChar ? 'text-green-600' : 'text-red-500'}>
                      {passwordCriteria.specialChar ? <FaCheckCircle className="inline" /> : <FaTimesCircle className="inline" />} One Special Character
                    </li>
                  </ul>
                  <div className="mt-3 w-full h-2 bg-gray-200 rounded">
                    <div
                      className={`h-2 rounded transition-all duration-300 ${
                        strength >= 4 ? 'bg-green-500 w-full' :
                        strength === 3 ? 'bg-yellow-400 w-3/4' :
                        strength === 2 ? 'bg-orange-400 w-1/2' :
                        'bg-red-500 w-1/4'
                      }`}
                    ></div>
                  </div>
                </div>
              </>
            )}

            {isLogin && (
              <p className="text-sm text-gray-500">Only verified donors can log in. Please check your email.</p>
            )}

            <button
              type="submit"
              className="w-full py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition duration-300 shadow-md hover:shadow-xl flex justify-center items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  {isLogin ? 'Logging in...' : 'Registering...'}
                </>
              ) : isLogin ? 'Login' : 'Register'}
            </button>

            <div className="text-center mt-4 text-sm">
              {isLogin ? (
                <>
                  <Link to="/donorforgot" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 me-4">
                    Forgot Password?
                  </Link>
                  <Link to="/donorregister" className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                    Create an Account
                  </Link>
                </>
              ) : (
                <Link to="/donorlogin" className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
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
