import React from 'react';

const Process = () => {
  return (
    <section id="process" className="donation-care py-5 mb-5" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="container">

        {/* Section Title */}
        <div className="row session-title text-center mb-5">
          <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#222" }}>
            Donation Process
          </h2>
          <p style={{ fontSize: "1.1rem", color: "#666", maxWidth: "700px", margin: "10px auto" }}>
            The donation process from the time you arrive at the center until the time you leave
          </p>
        </div>

        {/* Process Steps */}
        <div className="row g-4">
          
          {/* Step 1 */}
          <div className="col-md-3 col-sm-6">
            <div className="card h-100 text-center shadow-sm p-3 border-0 hover-up">
              <img src="/g1.jpg" alt="Registration" className="img-fluid rounded mb-3" />
              <h4 style={{ fontSize: "1.5rem", color: "#d9534f" }}>
                <b>1 - </b>Registration
              </h4>
              <p style={{ fontSize: "1rem", color: "#555" }}>
                Quickly register yourself and prepare for the donation process with minimal wait time.
              </p>
              <button className="btn btn-danger btn-sm mt-2">
                Read More <i className="fas fa-arrow-right ms-1"></i>
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="col-md-3 col-sm-6">
            <div className="card h-100 text-center shadow-sm p-3 border-0 hover-up">
              <img src="/g2.jpg" alt="Seeing" className="img-fluid rounded mb-3" />
              <h4 style={{ fontSize: "1.5rem", color: "#d9534f" }}>
                <b>2 - </b>Seeing
              </h4>
              <p style={{ fontSize: "1rem", color: "#555" }}>
                Meet with a medical expert to ensure you are ready and eligible for donation.
              </p>
              <button className="btn btn-danger btn-sm mt-2">
                Read More <i className="fas fa-arrow-right ms-1"></i>
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="col-md-3 col-sm-6">
            <div className="card h-100 text-center shadow-sm p-3 border-0 hover-up">
              <img src="/g3.jpg" alt="Donation" className="img-fluid rounded mb-3" />
              <h4 style={{ fontSize: "1.5rem", color: "#d9534f" }}>
                <b>3 - </b>Donation
              </h4>
              <p style={{ fontSize: "1rem", color: "#555" }}>
                The safe and simple donation process typically takes less than an hour.
              </p>
              <button className="btn btn-danger btn-sm mt-2">
                Read More <i className="fas fa-arrow-right ms-1"></i>
              </button>
            </div>
          </div>

          {/* Step 4 */}
          <div className="col-md-3 col-sm-6">
            <div className="card h-100 text-center shadow-sm p-3 border-0 hover-up">
              <img src="/g4.jpg" alt="Save Life" className="img-fluid rounded mb-3" />
              <h4 style={{ fontSize: "1.5rem", color: "#d9534f" }}>
                <b>4 - </b>Save Life
              </h4>
              <p style={{ fontSize: "1rem", color: "#555" }}>
                Your donation makes a real difference — helping save lives in your community.
              </p>
              <button className="btn btn-danger btn-sm mt-2">
                Read More <i className="fas fa-arrow-right ms-1"></i>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Process;
