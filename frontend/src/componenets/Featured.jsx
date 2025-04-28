import React from 'react';
import './CompCss.css';

const Featured = () => {
  return (
    <section id="about" className="container-fluid about-us py-5">
      <div className="container">
        
        {/* Section Title */}
        <div className="row session-title text-center mb-5">
          <h2 style={{ color: "black", fontSize: "2.5rem", fontWeight: "bold" }}>About Us</h2>
          <p style={{ fontSize: "1.1rem", color: "#555" }}>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
          </p>
        </div>

        {/* Content Row */}
        <div className="row align-items-center">
          
          {/* Text Content */}
          <div className="col-md-6 mb-4 mb-md-0">
            <h2 className="font-bold mb-4" style={{ color: "black", fontSize: "2rem", fontWeight: "bold" }}>
              About Blood Donors
            </h2>

            <h6 style={{ fontSize: "1.05rem", color: "#444", lineHeight: "1.8" }}>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting.
            </h6>

            <h6 style={{ fontSize: "1.05rem", color: "#444", lineHeight: "1.8" }}>
              It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker.
            </h6>

            <h6 style={{ fontSize: "1.05rem", color: "#444", lineHeight: "1.8" }}>
              There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, humour, or randomised words which don't look even slightly believable.
            </h6>

            <h6 style={{ fontSize: "1.05rem", color: "#444", lineHeight: "1.8" }}>
              The industry's standard dummy text has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
            </h6>
          </div>

          {/* Image Content */}
          <div className="col-md-6">
            <img src="/about.jpg" alt="About Blood Donation" className="img-fluid rounded" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default Featured;
