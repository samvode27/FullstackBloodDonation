import React, { useState } from 'react';
import { Link, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { Donorlogin } from "../redux/apiCalls";

const DonorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // Get the donor data from the Redux store
  const donor = useSelector((state) => state.donor);

  // Redirect to donor page if logged in
  if (donor?.currentUser) {
    return <Navigate to="/donorpage" />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();

    if (email && password) {
      try {
        setLoading(true);
        await Donorlogin(dispatch, { email, password });
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex items-center bg-white shadow-lg rounded-lg overflow-hidden">
      
       {/* Left Image Panel */}
        <div className="d-none d-md-block" style={{ width: '50%' }}>
          <img src="/hero1.jpg" alt="login" className="img-fluid h-100 w-100 object-fit-cover" />
        </div>

        <div className="p-10 w-[500px]">
          <h2 className="text-2xl font-bold text-gray-600 mb-5">Donor Login</h2>

          <form className="space-y-5">
            <div>
              <label htmlFor="" className="block text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="example@example.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="" className="block text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="********"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-red-500 text-white font-bold rounded-md transition-transform duration-700 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transform hover:scale-105"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Loading..." : "Login"}
            </button>

            <div>
              <Link to="/hospitalforgot" className="hover:text-gray-600 font-semibold w-6 h-6 ml-5 text-lg">
                Forgot your Password?
              </Link>
              <Link to="/donorregister" className="hover:text-gray-600 font-semibold w-6 h-6 ml-5 text-lg">
                Create an Account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonorLogin;
