import React from 'react';
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer id="contact" className="container-fluid text-light pt-5" style={{ backgroundColor: '#dc3545', color: 'white', paddingTop: '50px' }}>
      <div className="container">

        {/* Top Content */}
        <div className="row content-ro pb-4">

          {/* Contact Information */}
          <div className="col-lg-4 col-md-12 mb-4">
            <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>Contact Information</h2>
            <div className="address-row d-flex align-items-start my-3">
              <div className="icon me-3">
                <i className="fas fa-map-marker-alt fa-lg"></i>
              </div>
              <div className="detail">
                <p className="mb-1">46-29 Indra Street, Southernbank, Tigaione, Toronto, 3006 Canada</p>
              </div>
            </div>
            <div className="address-row d-flex align-items-start my-3">
              <div className="icon me-3">
                <i className="far fa-envelope fa-lg"></i>
              </div>
              <div className="detail">
                <p className="mb-1">sales@smarteyeapps.com</p>
                <p>support@smarteyeapps.com</p>
              </div>
            </div>
            <div className="address-row d-flex align-items-start my-3">
              <div className="icon me-3">
                <i className="fas fa-phone fa-lg"></i>
              </div>
              <div className="detail">
                <p className="mb-1">+91 9751791203</p>
                <p>+91 9159669599</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-4 col-md-6 mb-4">
            <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>Quick Links</h2>
            <ul className="list-unstyled mt-3">
              <li><Link to="hero" className="text-light text-decoration-none hover-link">Home</Link></li>
              <li><Link to="featured" className="text-light text-decoration-none hover-link">About Us</Link></li>
              <li><Link to="footer" className="text-light text-decoration-none hover-link">Contact</Link></li>
              <li><Link to="process" className="text-light text-decoration-none hover-link">Process</Link></li>
              <li><Link to="/gallery" className="text-light text-decoration-none hover-link">Gallery</Link></li>
              <li><Link to="/features" className="text-light text-decoration-none hover-link">Features</Link></li>
            </ul>

            <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", marginTop: "30px" }}>More Products</h2>
            <ul className="list-unstyled mt-3">
              <li><a href="#" className="text-light text-decoration-none hover-link">Forum PHP Script</a></li>
              <li><a href="#" className="text-light text-decoration-none hover-link">Edu Smart</a></li>
              <li><a href="#" className="text-light text-decoration-none hover-link">Smart Event</a></li>
              <li><a href="#" className="text-light text-decoration-none hover-link">Smart School</a></li>
            </ul>
          </div>

          {/* Quick Message Form */}
          <div className="col-lg-4 col-md-6">
            <div className="form-card bg-light p-4 rounded shadow">
              <div className="form-title mb-3">
                <h4 style={{ color: "#333", fontWeight: "bold" }}>Quick Message</h4>
              </div>
              <div className="form-body">
                <input type="text" placeholder="Enter Name" className="form-control mb-3" />
                <input type="text" placeholder="Enter Mobile No." className="form-control mb-3" />
                <input type="email" placeholder="Enter Email Address" className="form-control mb-3" />
                <textarea placeholder="Your Message" rows="3" className="form-control mb-3"></textarea>
                <button className="btn btn-primary w-100">Send Request</button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="footer-copy border-top pt-3">
          <div className="row align-items-center">
            <div className="col-lg-8 col-md-6">
              <p className="mb-0">
                &copy; {new Date().getFullYear()} <a href="https://www.smarteyeapps.com" className="text-primary text-decoration-none">Smarteyeapps.com</a> | All rights reserved.
              </p>
            </div>
            <div className="col-lg-4 col-md-6 text-end">
              <ul className="list-inline mb-0">
                <li className="list-inline-item me-2">
                  <a href="#" className="text-light fs-5 hover-icon"><i className="fab fa-github"></i></a>
                </li>
                <li className="list-inline-item me-2">
                  <a href="#" className="text-light fs-5 hover-icon"><i className="fab fa-google-plus-g"></i></a>
                </li>
                <li className="list-inline-item me-2">
                  <a href="#" className="text-light fs-5 hover-icon"><i className="fab fa-pinterest-p"></i></a>
                </li>
                <li className="list-inline-item me-2">
                  <a href="#" className="text-light fs-5 hover-icon"><i className="fab fa-twitter"></i></a>
                </li>
                <li className="list-inline-item">
                  <a href="#" className="text-light fs-5 hover-icon"><i className="fab fa-facebook-f"></i></a>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
