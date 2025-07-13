import React, { useState } from 'react';
import { publicRequest } from '../requestMethods';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Hospitallogin } from '../redux/apiCalls';
import { FaCheckCircle, FaTimesCircle, FaEye, FaEyeSlash } from 'react-icons/fa';

const HospitalAuth = ({ isLogin }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const hospital = useSelector((state) => state.hospital);

  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    tel: '',
    licenseNumber: '',
    officialDocumentFile: null
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
    minLength: false
  });

  const validatePassword = (password) => {
    setPasswordCriteria({
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      minLength: password.length >= 8
    });
  };

  const validateRegistrationForm = () => {
    const errors = [];

    if (!inputs.name.trim()) errors.push('Name is required.');
    if (!inputs.address.trim()) errors.push('Address is required.');

    if (!inputs.tel.trim()) {
      errors.push('Telephone number is required.');
    } else if (!/^\+?\d{7,15}$/.test(inputs.tel.trim())) {
      errors.push('Telephone number format is invalid.');
    }

    if (!inputs.licenseNumber.trim()) errors.push('License Number is required.');

    if (!inputs.email.trim()) {
      errors.push('Email is required.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email.trim())) {
      errors.push('Email format is invalid.');
    }

    if (!inputs.password.trim()) {
      errors.push('Password is required.');
    }

    if (!inputs.officialDocumentFile) {
      errors.push('Official document upload is required.');
    } else if (!['application/pdf', 'image/jpeg', 'image/png'].includes(inputs.officialDocumentFile.type)) {
      errors.push('Official document must be PDF, JPG, or PNG.');
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'password') {
      validatePassword(value);
    }

    if (name === 'officialDocumentFile') {
      setInputs((prev) => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setInputs((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      try {
        const hositalData = await Hospitallogin(dispatch, {
          email: inputs.email,
          password: inputs.password,
        });

        if (hositalData?.verified) {
          toast.success('Login successful!');
          navigate('/hospitalpage');
        } else {
          toast.error('The account is not verified.');
          navigate('/hospitalverifycode', { state: { email: inputs.email } });
        }
      } catch (err) {
        const errorMessage = err?.response?.data?.message || 'Login failed';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      const formErrors = validateRegistrationForm();

      const { uppercase, lowercase, number, specialChar, minLength } = passwordCriteria;
      if (!uppercase || !lowercase || !number || !specialChar || !minLength) {
        formErrors.push('Password does not meet all criteria.');
      }

      if (formErrors.length > 0) {
        formErrors.forEach((err) => toast.error(err));
        setLoading(false);
        return;
      }

      try {
        const formData = new FormData();
        formData.append('name', inputs.name.trim());
        formData.append('email', inputs.email.trim());
        formData.append('password', inputs.password.trim());
        formData.append('address', inputs.address.trim());
        formData.append('tel', inputs.tel.trim());
        formData.append('licenseNumber', inputs.licenseNumber.trim());
        formData.append('document', inputs.officialDocumentFile);

        await publicRequest.post('/hospitals/signup', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        toast.success('Registered successfully! Check your email.');
        setTimeout(() => {
          navigate('/hospitalverifycode', {
            state: { email: inputs.email }
          });
        }, 2000);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    }
  };

  if (isLogin && hospital?.currentUser) {
    return <Navigate to="/hospitalpage" />;
  }

  return (
    <>
      <ToastContainer position="top-center" />
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-white px-4">
        <div className="bg-white shadow-xl rounded-xl w-full max-w-lg p-8 border border-gray-200">
          <h2 className="text-center text-3xl font-extrabold text-red-600 mb-6">
            {isLogin ? 'Hospital Login' : 'Hospital Registration'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                {['name', 'address', 'tel', 'licenseNumber'].map((field) => (
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
                      placeholder={
                        field === 'name' ? 'Enter hospital name' :
                        field === 'address' ? 'Enter address' :
                        field === 'tel' ? 'e.g. +251912345678' :
                        field === 'licenseNumber' ? 'Hospital license number' :
                        ''
                      }
                      className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                      required
                    />
                  </div>
                ))}

                <div>
                  <label htmlFor="officialDocumentFile" className="block text-gray-700 font-medium mb-1">
                    Upload Official Document (PDF, JPG, PNG)
                  </label>
                  <input
                    type="file"
                    id="officialDocumentFile"
                    name="officialDocumentFile"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleChange}
                    required
                  />
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
                placeholder="example@hospital.com"
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
                  placeholder="Enter password"
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
                  <li className={passwordCriteria.specialChar ? 'text-green-600' : 'text-red-500'}>
                    {passwordCriteria.specialChar ? <FaCheckCircle className="inline" /> : <FaTimesCircle className="inline" />} One Special Character (e.g. ! @ # $ %)
                  </li>
                  <li className={passwordCriteria.minLength ? 'text-green-600' : 'text-red-500'}>
                    {passwordCriteria.minLength ? <FaCheckCircle className="inline" /> : <FaTimesCircle className="inline" />} Minimum 8 Characters
                  </li>
                </ul>
              </div>
            )}

            {isLogin && (
              <p className="text-sm text-gray-500">Only verified hospitals can log in. Please check your email.</p>
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
                  <Link to="/hospitalforgot" className="text-blue-600 hover:underline me-4">
                    Forgot Password?
                  </Link>
                  <Link to="/hospitalregister" className="text-blue-600 hover:underline">
                    Create an Account
                  </Link>
                </>
              ) : (
                <Link to="/hospitallogin" className="text-blue-600 hover:underline">
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

export default HospitalAuth;
