// import React, { useState } from 'react';
// import { Container, Row, Col, Card, Button, Modal, Form, Nav, Navbar } from 'react-bootstrap';
// import { useDispatch } from 'react-redux'
// import { useNavigate } from "react-router-dom"
// import { useSelector } from 'react-redux';
// import { logout } from '../../redux/donorRedux';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//   faHeartbeat,
//   faUser,
//   faHandHoldingHeart,
//   faSearch,
//   faVenusMars,
//   faVenus,
//   faMapMarkerAlt,
//   faEnvelope,
//   faClock,
//   faTimes,
//   faPhone,
//   faMapMarker,
//   faEnvelope as faEnvelopeSolid
// } from '@fortawesome/free-solid-svg-icons';
// import { faFacebookF, faTwitter, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
// import 'bootstrap/dist/css/bootstrap.min.css';


// const DonorPage = () => {


//   const getLoggedDonor = () => {
//     const donorState = localStorage.getItem("persist:donor");
//     if (donorState) {
//       try {
//         const parsedState = JSON.parse(donorState);
//         return JSON.parse(parsedState.currentDonor);
//       } catch (e) {
//         console.error("Failed to parse donor from localStorage:", e);
//       }
//     }
//     return null;
//   };

//   const reduxDonor = useSelector((state) => state.donor?.currentDonor);
//   const donor = reduxDonor || getLoggedDonor();

//   const [showAccount, setShowAccount] = useState(false);
//   const toggleAccount = () => setShowAccount(!showAccount);



//   const [showModal, setShowModal] = useState(false);
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     dob: '',
//     bloodType: '',
//     gender: '',
//     lastDonation: '',
//     address: '',
//     city: '',
//     state: '',
//     zipCode: '',
//     country: '',
//     agreeTerms: false
//   });

//   const handleClose = () => setShowModal(false);
//   const handleShow = () => setShowModal(true);

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === 'checkbox' ? checked : value
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     alert('Thank you for registering as a donor! We will contact you soon.');
//     setShowModal(false);
//     setFormData({
//       firstName: '',
//       lastName: '',
//       email: '',
//       phone: '',
//       dob: '',
//       bloodType: '',
//       gender: '',
//       lastDonation: '',
//       address: '',
//       city: '',
//       state: '',
//       zipCode: '',
//       country: '',
//       agreeTerms: false
//     });
//   };

//   const donors = [
//     {
//       id: 1,
//       name: "Michael Johnson",
//       bloodType: "A+",
//       status: "Available",
//       gender: "Male",
//       age: 28,
//       distance: "3.2 miles away",
//       lastDonation: "2 months ago",
//       image: "https://randomuser.me/api/portraits/men/32.jpg",
//       available: true
//     },
//     {
//       id: 2,
//       name: "Sarah Williams",
//       bloodType: "O-",
//       status: "Available",
//       gender: "Female",
//       age: 34,
//       distance: "1.5 miles away",
//       lastDonation: "3 weeks ago",
//       image: "https://randomuser.me/api/portraits/women/44.jpg",
//       available: true
//     },
//     {
//       id: 3,
//       name: "David Kim",
//       bloodType: "AB+",
//       status: "Recently Donated",
//       gender: "Male",
//       age: 42,
//       distance: "5.7 miles away",
//       lastDonation: "5 days ago",
//       image: "https://randomuser.me/api/portraits/men/67.jpg",
//       available: false
//     }
//   ];

//   const navigate = useNavigate()
//   const dispatch = useDispatch()
//   const handleLogout = () => {
//     dispatch(logout())
//     navigate("/")
//   }

//   return (

    
//     <div className="App">

// <Modal show={showAccount} onHide={toggleAccount} centered>
//   <Modal.Header closeButton>
//     <Modal.Title>Your Account</Modal.Title>
//   </Modal.Header>
//   <Modal.Body>
//     {donor ? (
//       <>
//         <p><strong>Name:</strong> {donor.firstName} {donor.lastName}</p>
//         <p><strong>Email:</strong> {donor.email}</p>
//         <p><strong>Phone:</strong> {donor.phone}</p>
//         <p><strong>Blood Type:</strong> {donor.bloodType}</p>
//         <p><strong>Gender:</strong> {donor.gender}</p>
//         <p><strong>Date of Birth:</strong> {donor.dob}</p>
//         <p><strong>Address:</strong> {donor.address}, {donor.city}, {donor.state}, {donor.zipCode}, {donor.country}</p>
//         <p><strong>Last Donation:</strong> {donor.lastDonation || "N/A"}</p>
//       </>
//     ) : (
//       <p>No account info available.</p>
//     )}
//   </Modal.Body>
// </Modal>


//       {/* Header */}
//       <Navbar bg="danger" variant="dark" expand="lg" className="shadow-lg">
//         <Container>
//           <Navbar.Brand href="#home" className="d-flex align-items-center">
//             <FontAwesomeIcon icon={faHeartbeat} className="me-2" size="lg" />
//             <span className="fw-bold">LifeBlood</span>
//           </Navbar.Brand>
//           <Navbar.Toggle aria-controls="basic-navbar-nav" />
//           <Navbar.Collapse id="basic-navbar-nav">
//             <Nav className="ms-auto me-3">
//               <Nav.Link href="#home" className="text-light">Home</Nav.Link>
//               <Nav.Link href="#donate" className="text-light">Donate</Nav.Link>
//               <Nav.Link href="#find-donors" className="text-light">Find Donors</Nav.Link>
//               <Nav.Link href="#about" className="text-light">About</Nav.Link>
//             </Nav>
//             <div className="d-flex align-items-center gap-3">
//               <Button variant="light" className="text-danger fw-bold" onClick={toggleAccount}>
//                 <FontAwesomeIcon icon={faUser} className="me-2" />
//                 Account
//               </Button>
//               <Button variant="outline-light" onClick={handleLogout}>
//                 Logout
//               </Button>
//             </div>

//           </Navbar.Collapse>
//         </Container>
//       </Navbar>

//       {/* Hero Section */}
//       <section className="bg-danger text-white py-5" style={{ background: 'linear-gradient(to right, #dc3545, #c82333)' }}>
//         <Container className="text-center py-4">
//           <h2 className="fw-bold mb-4">Become a Lifesaver Today</h2>
//           <p className="lead mb-4 mx-auto" style={{ maxWidth: '600px' }}>
//             Join our community of heroes who donate blood and save lives. Your single donation can help up to 3 people.
//           </p>
//           <div className="d-flex justify-content-center gap-3">
//             <Button
//               variant="light"
//               size="lg"
//               className="text-danger fw-bold pulse-animation"
//               onClick={handleShow}
//             >
//               <FontAwesomeIcon icon={faHandHoldingHeart} className="me-2" />
//               Register as Donor
//             </Button>
//             <Button variant="outline-light" size="lg" className="fw-bold">
//               <FontAwesomeIcon icon={faSearch} className="me-2" />
//               Find Donors
//             </Button>
//           </div>
//         </Container>
//       </section>

//       {/* Main Content */}
//       <main className="py-5">
//         <Container>
//           {/* Search Filters */}
//           <Card className="mb-5">
//             <Card.Body>
//               <h3 className="fw-bold mb-4">Find Blood Donors</h3>
//               <Row>
//                 <Col md={3}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Blood Type</Form.Label>
//                     <Form.Select>
//                       <option value="">All Types</option>
//                       <option value="A+">A+</option>
//                       <option value="A-">A-</option>
//                       <option value="B+">B+</option>
//                       <option value="B-">B-</option>
//                       <option value="AB+">AB+</option>
//                       <option value="AB-">AB-</option>
//                       <option value="O+">O+</option>
//                       <option value="O-">O-</option>
//                     </Form.Select>
//                   </Form.Group>
//                 </Col>
//                 <Col md={3}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Location</Form.Label>
//                     <Form.Control type="text" placeholder="City or Zip" />
//                   </Form.Group>
//                 </Col>
//                 <Col md={3}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Distance</Form.Label>
//                     <Form.Select>
//                       <option value="5">5 miles</option>
//                       <option value="10">10 miles</option>
//                       <option value="25">25 miles</option>
//                       <option value="50">50 miles</option>
//                       <option value="100">100 miles</option>
//                     </Form.Select>
//                   </Form.Group>
//                 </Col>
//                 <Col md={3} className="d-flex align-items-end">
//                   <Button variant="danger" className="w-100">
//                     <FontAwesomeIcon icon={faSearch} className="me-2" />
//                     Search
//                   </Button>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>

//           {/* Donor Registration Modal */}
//           <Modal show={showModal} onHide={handleClose} centered>
//             <Modal.Header closeButton>
//               <Modal.Title>Donor Registration</Modal.Title>
//             </Modal.Header>
//             <Modal.Body>
//               <Form onSubmit={handleSubmit}>
//                 <Row className="mb-3">
//                   <Col md={6}>
//                     <Form.Group className="mb-3">
//                       <Form.Label>First Name*</Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="firstName"
//                         value={formData.firstName}
//                         onChange={handleInputChange}
//                         required
//                       />
//                     </Form.Group>
//                   </Col>
//                   <Col md={6}>
//                     <Form.Group className="mb-3">
//                       <Form.Label>Last Name*</Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="lastName"
//                         value={formData.lastName}
//                         onChange={handleInputChange}
//                         required
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>
//                 <Row className="mb-3">
//                   <Col md={6}>
//                     <Form.Group className="mb-3">
//                       <Form.Label>Email*</Form.Label>
//                       <Form.Control
//                         type="email"
//                         name="email"
//                         value={formData.email}
//                         onChange={handleInputChange}
//                         required
//                       />
//                     </Form.Group>
//                   </Col>
//                   <Col md={6}>
//                     <Form.Group className="mb-3">
//                       <Form.Label>Phone*</Form.Label>
//                       <Form.Control
//                         type="tel"
//                         name="phone"
//                         value={formData.phone}
//                         onChange={handleInputChange}
//                         required
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>
//                 <Row className="mb-3">
//                   <Col md={6}>
//                     <Form.Group className="mb-3">
//                       <Form.Label>Date of Birth*</Form.Label>
//                       <Form.Control
//                         type="date"
//                         name="dob"
//                         value={formData.dob}
//                         onChange={handleInputChange}
//                         required
//                       />
//                     </Form.Group>
//                   </Col>
//                   <Col md={6}>
//                     <Form.Group className="mb-3">
//                       <Form.Label>Blood Type*</Form.Label>
//                       <Form.Select
//                         name="bloodType"
//                         value={formData.bloodType}
//                         onChange={handleInputChange}
//                         required
//                       >
//                         <option value="">Select</option>
//                         <option value="A+">A+</option>
//                         <option value="A-">A-</option>
//                         <option value="B+">B+</option>
//                         <option value="B-">B-</option>
//                         <option value="AB+">AB+</option>
//                         <option value="AB-">AB-</option>
//                         <option value="O+">O+</option>
//                         <option value="O-">O-</option>
//                       </Form.Select>
//                     </Form.Group>
//                   </Col>
//                 </Row>
//                 <Row className="mb-3">
//                   <Col md={6}>
//                     <Form.Group className="mb-3">
//                       <Form.Label>Gender*</Form.Label>
//                       <Form.Select
//                         name="gender"
//                         value={formData.gender}
//                         onChange={handleInputChange}
//                         required
//                       >
//                         <option value="">Select</option>
//                         <option value="Male">Male</option>
//                         <option value="Female">Female</option>
//                         <option value="Other">Other</option>
//                         <option value="Prefer not to say">Prefer not to say</option>
//                       </Form.Select>
//                     </Form.Group>
//                   </Col>
//                   <Col md={6}>
//                     <Form.Group className="mb-3">
//                       <Form.Label>Last Donation Date</Form.Label>
//                       <Form.Control
//                         type="date"
//                         name="lastDonation"
//                         value={formData.lastDonation}
//                         onChange={handleInputChange}
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Address*</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="address"
//                     value={formData.address}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </Form.Group>
//                 <Row className="mb-3">
//                   <Col md={6}>
//                     <Form.Group className="mb-3">
//                       <Form.Label>City*</Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="city"
//                         value={formData.city}
//                         onChange={handleInputChange}
//                         required
//                       />
//                     </Form.Group>
//                   </Col>
//                   <Col md={6}>
//                     <Form.Group className="mb-3">
//                       <Form.Label>State*</Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="state"
//                         value={formData.state}
//                         onChange={handleInputChange}
//                         required
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>
//                 <Row className="mb-3">
//                   <Col md={6}>
//                     <Form.Group className="mb-3">
//                       <Form.Label>Zip Code*</Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="zipCode"
//                         value={formData.zipCode}
//                         onChange={handleInputChange}
//                         required
//                       />
//                     </Form.Group>
//                   </Col>
//                   <Col md={6}>
//                     <Form.Group className="mb-3">
//                       <Form.Label>Country*</Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="country"
//                         value={formData.country}
//                         onChange={handleInputChange}
//                         required
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>
//                 <Form.Group className="mb-4">
//                   <Form.Check
//                     type="checkbox"
//                     label="I agree to the terms and conditions and confirm that all information provided is accurate.*"
//                     name="agreeTerms"
//                     checked={formData.agreeTerms}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </Form.Group>
//                 <div className="d-flex justify-content-end gap-3">
//                   <Button variant="outline-secondary" onClick={handleClose}>
//                     Cancel
//                   </Button>
//                   <Button variant="danger" type="submit">
//                     Register
//                   </Button>
//                 </div>
//               </Form>
//             </Modal.Body>
//           </Modal>

//           {/* Donors List */}
//           <div className="d-flex justify-content-between align-items-center mb-4">
//             <h3 className="fw-bold m-0">Available Donors</h3>
//             <div className="text-muted">
//               <span className="fw-bold">124</span> donors available in your area
//             </div>
//           </div>

//           <Row xs={1} md={2} lg={3} className="g-4">
//             {donors.map(donor => (
//               <Col key={donor.id}>
//                 <Card className="h-100 donor-card">
//                   <div className="position-relative">
//                     <Card.Img variant="top" src={donor.image} style={{ height: '200px', objectFit: 'cover' }} />
//                     <div className="position-absolute top-0 end-0 bg-danger text-white rounded-circle d-flex align-items-center justify-content-center fw-bold m-3" style={{ width: '50px', height: '50px' }}>
//                       {donor.bloodType}
//                     </div>
//                   </div>
//                   <Card.Body>
//                     <div className="d-flex justify-content-between align-items-start mb-2">
//                       <Card.Title className="mb-0">{donor.name}</Card.Title>
//                       <span className={`badge bg-${donor.available ? 'success' : 'warning'} text-${donor.available ? 'white' : 'dark'}`}>
//                         {donor.status}
//                       </span>
//                     </div>
//                     <div className="d-flex align-items-center text-muted mb-2">
//                       <FontAwesomeIcon icon={donor.gender === "Female" ? faVenus : faVenusMars} className="me-2" />
//                       <span>{donor.gender}, {donor.age} years</span>
//                     </div>
//                     <div className="d-flex align-items-center text-muted mb-3">
//                       <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
//                       <span>{donor.distance}</span>
//                     </div>
//                     <div className="d-flex justify-content-between align-items-center">
//                       <div className="text-muted">
//                         <div className="small">Last donation:</div>
//                         <div className="fw-bold">{donor.lastDonation}</div>
//                       </div>
//                       {donor.available ? (
//                         <Button variant="outline-danger" size="sm">
//                           <FontAwesomeIcon icon={faEnvelope} className="me-1" />
//                           Contact
//                         </Button>
//                       ) : (
//                         <Button variant="outline-secondary" size="sm" disabled>
//                           <FontAwesomeIcon icon={faClock} className="me-1" />
//                           Check back soon
//                         </Button>
//                       )}
//                     </div>
//                   </Card.Body>
//                 </Card>
//               </Col>
//             ))}
//           </Row>

//           {/* Pagination */}
//           <div className="d-flex justify-content-center mt-5">
//             <nav>
//               <ul className="pagination">
//                 <li className="page-item">
//                   <button className="page-link">
//                     <FontAwesomeIcon icon={faTimes} rotation={90} />
//                   </button>
//                 </li>
//                 <li className="page-item active">
//                   <button className="page-link">1</button>
//                 </li>
//                 <li className="page-item">
//                   <button className="page-link">2</button>
//                 </li>
//                 <li className="page-item">
//                   <button className="page-link">3</button>
//                 </li>
//                 <li className="page-item disabled">
//                   <span className="page-link">...</span>
//                 </li>
//                 <li className="page-item">
//                   <button className="page-link">8</button>
//                 </li>
//                 <li className="page-item">
//                   <button className="page-link">
//                     <FontAwesomeIcon icon={faTimes} rotation={270} />
//                   </button>
//                 </li>
//               </ul>
//             </nav>
//           </div>
//         </Container>
//       </main>

//       {/* Stats Section */}
//       <section className="bg-light py-5">
//         <Container>
//           <h3 className="text-center fw-bold mb-5">Our Impact</h3>
//           <Row>
//             <Col xs={6} md={3} className="mb-4">
//               <Card className="text-center h-100">
//                 <Card.Body>
//                   <div className="text-danger fw-bold display-6 mb-2">5,327</div>
//                   <div className="text-muted">Lives Saved</div>
//                 </Card.Body>
//               </Card>
//             </Col>
//             <Col xs={6} md={3} className="mb-4">
//               <Card className="text-center h-100">
//                 <Card.Body>
//                   <div className="text-danger fw-bold display-6 mb-2">2,145</div>
//                   <div className="text-muted">Active Donors</div>
//                 </Card.Body>
//               </Card>
//             </Col>
//             <Col xs={6} md={3} className="mb-4">
//               <Card className="text-center h-100">
//                 <Card.Body>
//                   <div className="text-danger fw-bold display-6 mb-2">78</div>
//                   <div className="text-muted">Partner Hospitals</div>
//                 </Card.Body>
//               </Card>
//             </Col>
//             <Col xs={6} md={3} className="mb-4">
//               <Card className="text-center h-100">
//                 <Card.Body>
//                   <div className="text-danger fw-bold display-6 mb-2">24/7</div>
//                   <div className="text-muted">Emergency Support</div>
//                 </Card.Body>
//               </Card>
//             </Col>
//           </Row>
//         </Container>
//       </section>

//       {/* Footer */}
//       <footer className="bg-dark text-white py-5">
//         <Container>
//           <Row>
//             <Col lg={3} md={6} className="mb-4">
//               <h4 className="fw-bold mb-3 d-flex align-items-center">
//                 <FontAwesomeIcon icon={faHeartbeat} className="me-2 text-danger" />
//                 LifeBlood
//               </h4>
//               <p className="text-muted">
//                 Connecting donors with those in need since 2010. Every drop counts in saving lives.
//               </p>
//             </Col>
//             <Col lg={3} md={6} className="mb-4">
//               <h5 className="fw-bold mb-3">Quick Links</h5>
//               <ul className="list-unstyled">
//                 <li className="mb-2">
//                   <a href="#home" className="text-muted hover:text-white">Home</a>
//                 </li>
//                 <li className="mb-2">
//                   <a href="#donate" className="text-muted hover:text-white">Become a Donor</a>
//                 </li>
//                 <li className="mb-2">
//                   <a href="#find-donors" className="text-muted hover:text-white">Find Donors</a>
//                 </li>
//                 <li>
//                   <a href="#camps" className="text-muted hover:text-white">Blood Donation Camps</a>
//                 </li>
//               </ul>
//             </Col>
//             <Col lg={3} md={6} className="mb-4">
//               <h5 className="fw-bold mb-3">Information</h5>
//               <ul className="list-unstyled">
//                 <li className="mb-2">
//                   <a href="#about" className="text-muted hover:text-white">About Us</a>
//                 </li>
//                 <li className="mb-2">
//                   <a href="#privacy" className="text-muted hover:text-white">Privacy Policy</a>
//                 </li>
//                 <li className="mb-2">
//                   <a href="#terms" className="text-muted hover:text-white">Terms of Service</a>
//                 </li>
//                 <li>
//                   <a href="#faq" className="text-muted hover:text-white">FAQ</a>
//                 </li>
//               </ul>
//             </Col>
//             <Col lg={3} md={6} className="mb-4">
//               <h5 className="fw-bold mb-3">Contact Us</h5>
//               <ul className="list-unstyled text-muted">
//                 <li className="mb-2 d-flex align-items-center">
//                   <FontAwesomeIcon icon={faMapMarker} className="me-2" />
//                   123 Health St, Medical City
//                 </li>
//                 <li className="mb-2 d-flex align-items-center">
//                   <FontAwesomeIcon icon={faPhone} className="me-2" />
//                   (555) 123-4567
//                 </li>
//                 <li className="mb-3 d-flex align-items-center">
//                   <FontAwesomeIcon icon={faEnvelopeSolid} className="me-2" />
//                   info@lifeblood.org
//                 </li>
//               </ul>
//               <div className="d-flex gap-3">
//                 <a href="#facebook" className="text-muted hover:text-white">
//                   <FontAwesomeIcon icon={faFacebookF} />
//                 </a>
//                 <a href="#twitter" className="text-muted hover:text-white">
//                   <FontAwesomeIcon icon={faTwitter} />
//                 </a>
//                 <a href="#instagram" className="text-muted hover:text-white">
//                   <FontAwesomeIcon icon={faInstagram} />
//                 </a>
//                 <a href="#linkedin" className="text-muted hover:text-white">
//                   <FontAwesomeIcon icon={faLinkedinIn} />
//                 </a>
//               </div>
//             </Col>
//           </Row>
//           <div className="border-top border-secondary pt-4 mt-4 text-center text-muted">
//             <p>&copy; 2023 LifeBlood. All rights reserved.</p>
//           </div>
//         </Container>
//       </footer>
//     </div>
//   )
// }

// export default DonorPage