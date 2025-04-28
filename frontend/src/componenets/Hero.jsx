import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  const DonorLogin = () => {
    navigate("/donorlogin");
  };

  return (
    <div className="slider-detail">
      <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel" data-bs-interval="2000">
        
        {/* Carousel Indicators */}
        <div className="carousel-indicators">
          <button
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to="0"
            className="active"
            aria-current="true"
            aria-label="Slide 1"
          ></button>
          <button
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to="1"
            aria-label="Slide 2"
          ></button>
        </div>

        {/* Carousel Inner */}
        <div className="carousel-inner">
          {/* First Slide */}
          <div className="carousel-item active">
            <img className="d-block w-100" src="/slide-02.jpg" alt="First slide" />
            <div className="carousel-caption d-none d-md-block">
              <h5 className="bounceInDown">Donate Blood & Save a Life</h5>
              <p className="bounceInLeft">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam justo neque, <br />
                aliquet sit amet elementum vel, vehicula eget eros. Vivamus arcu metus, <br />
                mattis sed sagittis at, sagittis quis neque. Praesent.
              </p>
              <div className="vbh">
                <button className="btn btn-success bounceInUp me-2" onClick={DonorLogin}>
                  Donate Now
                </button>
              </div>
            </div>
          </div>

          {/* Second Slide */}
          <div className="carousel-item">
            <img className="d-block w-100" src="/slide-03.jpg" alt="Second slide" />
            <div className="carousel-caption d-none d-md-block">
              <h5 className="bounceInDown">Donate Blood & Save a Life</h5>
              <p className="bounceInLeft">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam justo neque, <br />
                aliquet sit amet elementum vel, vehicula eget eros. Vivamus arcu metus, <br />
                mattis sed sagittis at, sagittis quis neque. Praesent.
              </p>
              <div className="vbh">
                <button onClick={DonorLogin} className="btn btn-danger bounceInUp me-2">
                  Donate Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  );
};

export default Hero;
