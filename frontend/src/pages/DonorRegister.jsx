import React, { useState } from 'react';
import { publicRequest } from '../requestMethods';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const DonorRegister = () => {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleDonors = async (e) => {
    e.preventDefault();
    try {
      await publicRequest.post("/donors", inputs);
      toast.success("Donor registered successfully.");
      setInputs({});
      setTimeout(() => {
        navigate('/donorlogin');
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      toast.error("Registration failed: " + (error.response?.data?.message || error.message));
    }

  };

  return (
    <>
      <ToastContainer position="top-center" />

      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
        <div className="container">
          <a className="navbar-brand" href="/">
            <img
              src="/Logo.jpg"
              alt="Logo"
              height="50"
              width="220"
              className="d-inline-block align-text-top"
            />
          </a>
        </div>
      </nav>

      <main className="container d-flex justify-content-center align-items-center min-vh-100" style={{ paddingTop: '100px' }}>
        <div className="card shadow-sm p-4 w-100" style={{ maxWidth: '600px' }}>
          <h2 className="text-center mb-4">Donor Registration</h2>

          <form onSubmit={handleDonors} noValidate>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                placeholder="John Doe"
                value={inputs.name || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                placeholder="johndoe@example.com"
                value={inputs.email || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                placeholder="********"
                value={inputs.password || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="address" className="form-label">Address</label>
              <input
                type="text"
                className="form-control"
                id="address"
                name="address"
                placeholder="123 Town Street"
                value={inputs.address || ""}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="tel" className="form-label">Telephone</label>
              <input
                type="tel"
                className="form-control"
                id="tel"
                name="tel"
                placeholder="0123456789"
                value={inputs.tel || ""}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="bloodgroup" className="form-label">Blood Group</label>
              <select
                className="form-select"
                id="bloodgroup"
                name="bloodgroup"
                value={inputs.bloodgroup || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="weight" className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  className="form-control"
                  id="weight"
                  name="weight"
                  placeholder="e.g. 60"
                  value={inputs.weight || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="age" className="form-label">Age</label>
                <input
                  type="number"
                  className="form-control"
                  id="age"
                  name="age"
                  placeholder="e.g. 25"
                  value={inputs.age || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="disease" className="form-label">Do you have any diseases?</label>
              <textarea
                className="form-control"
                id="disease"
                name="disease"
                rows="3"
                placeholder="N/A"
                value={inputs.disease || ""}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-danger w-100 mb-3">
              Submit
            </button>

            <div className="text-center">
              <span>Already have an account? </span>
              <Link to="/donorlogin" className="fw-semibold text-decoration-none">
                Log In
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default DonorRegister;
