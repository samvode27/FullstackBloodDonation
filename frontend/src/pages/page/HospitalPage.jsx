import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Container, Button, Modal, Alert, Form, Table, Spinner, Pagination, Row, Col, Image, OverlayTrigger, Navbar, Nav
} from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { FaSun, FaMoon, FaEye, FaSignOutAlt, FaEdit, FaFileCsv, FaPlus, FaClock, FaCheck, FaCheckCircle, FaTimesCircle, FaTimes, FaFilePdf } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer, Legend } from 'recharts';
import { Tooltip as ReactTooltip } from "react-tooltip";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logout } from '../../redux/hospitalRedux';
import { publicRequest } from '../../requestMethods';
import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";
import 'jspdf-autotable';
import './HospitalPage.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = false;
  recognition.lang = 'en-US';
}

const synth = window.speechSynthesis;

const HospitalPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const [hospital, setHospital] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [editData, setEditData] = useState({
    name: '',
    email: '',
    address: '',
    tel: '',
    profileImage: ''
  });

  const [loading, setLoading] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(true);
  const [response, setResponse] = useState(null);
  const [bloodGroup, setBloodGroup] = useState();
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [formData, setFormData] = useState({
    bloodGroup: '',
    amount: '',
    caseDescription: '',
    urgency: 'Medium'
  });

  const [filters, setFilters] = useState({
    status: '',
    bloodGroup: '',
    urgency: ''
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const handleProfileChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // Handle file input change (image)
  const handleFileChange = e => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditData(prev => ({
        ...prev,
        profileImage: file
      }));
    }
  };

  useEffect(() => {
    return () => {
      if (editData.profileImage instanceof File) {
        URL.revokeObjectURL(editData.profileImage);
      }
    };
  }, [editData.profileImage]);


  const fetchHospitalProfile = useCallback(async () => {
    try {
      const { data } = await publicRequest.get('/hospitals/me');

      const profileImageUrl = data.profileImage
        ? (data.profileImage.startsWith('http') ? data.profileImage : `http://localhost:8000${data.profileImage}`)
        : '/images/default-avatar.png';

      setHospital({ ...data, profileImage: profileImageUrl });
      setEditData({
        name: data.name || '',
        email: data.email || '',
        address: data.address || '',
        tel: data.tel || '',
        profileImage: profileImageUrl,
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      toast.error("Failed to fetch profile.");
    }
  }, [dispatch, navigate]);


  const handleProfileSave = async () => {
    setIsUpdating(true);
    try {
      // Upload image if it's a new file
      if (editData.profileImage instanceof File) {
        const imageFormData = new FormData();
        imageFormData.append('image', editData.profileImage);

        await publicRequest.post('/hospitals/uploadprofilepic', imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        toast.success("Profile image uploaded.");
      }

      // Update text info
      const updatePayload = {
        name: editData.name,
        email: editData.email,
        address: editData.address,
        tel: editData.tel,
      };

      const { data } = await publicRequest.put(`/hospitals/updateprofile/${hospital._id}`, updatePayload);

      toast.success("Profile updated successfully!");
      setHospital(data.hospital);
      setShowEditModal(false);
      fetchHospitalProfile();
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error("Failed to save profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRequestChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await publicRequest.post('/blood/request', {
        bloodGroup,
        amount: formData.amount,
        caseDescription: formData.caseDescription,
        urgency: formData.urgency,
      }, {
        withCredentials: true
      });

      setResponse(res.data.message || 'Request sent successfully.');
      toast.success(res.data.message || 'Request sent successfully.');
    } catch (err) {
      setResponse('Failed to send blood request.');
      toast.error('Failed to send blood request.');
      console.error('Failed to send blood request:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const res = await publicRequest.get('/blood/myrequests', {
        withCredentials: true,
      });
      setMyRequests(res.data);
    } catch (err) {
      toast.error('Failed to fetch requests.');
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const mode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(mode);
    document.body.classList.toggle('dark-mode', mode);
    fetchHospitalProfile();
    fetchMyRequests();
  }, [fetchHospitalProfile]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const totalApprovedUnits = myRequests
    .filter(req => req.status === 'Approved')
    .reduce((sum, req) => {
      let rawAmount = req.amount;

      // Handle both strings like "500ml" and numbers like 500
      if (typeof rawAmount === 'string') {
        rawAmount = rawAmount.replace(/[^\d]/g, '');
      }

      const amount = parseInt(rawAmount, 10);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

  const bloodInventory = myRequests
    .filter(req => req.status === 'Approved')
    .reduce((acc, req) => {
      const bg = req.bloodGroup;

      // Safely extract and parse the amount
      let amount = 0;
      if (typeof req.amount === 'string') {
        amount = parseInt(req.amount.replace(/[^\d]/g, ''), 10);
      } else if (typeof req.amount === 'number') {
        amount = req.amount;
      }

      if (!acc[bg]) acc[bg] = 0;
      acc[bg] += isNaN(amount) ? 0 : amount;

      return acc;
    }, {});


  const statusCounts = myRequests.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const monthlyTrend = Object.entries(
    myRequests
      .filter(r => r.status === 'Approved')
      .reduce((acc, r) => {
        const dt = new Date(r.createdAt);
        const key = `${dt.getFullYear()}-${dt.getMonth() + 1}`;

        let rawAmount = r.amount;
        let numericAmount = 0;

        if (typeof rawAmount === 'string') {
          numericAmount = parseInt(rawAmount.replace(/\D/g, ''), 10);
        } else if (typeof rawAmount === 'number') {
          numericAmount = rawAmount;
        }

        acc[key] = (acc[key] || 0) + (isNaN(numericAmount) ? 0 : numericAmount);
        return acc;
      }, {})
  )
    .sort()
    .map(([name, units]) => ({ name, units }));


  const topTypes = Object.entries(bloodInventory)
    .sort((a, b) => b[1] - a[1])
    .map(([bloodGroup, units]) => ({ bloodGroup, units }));

  const filteredRequests = myRequests.filter((req) =>
    (!filters.status || req.status === filters.status) &&
    (!filters.bloodGroup || req.bloodGroup === filters.bloodGroup) &&
    (!filters.urgency || req.urgency === filters.urgency)
  );

  const currentPageData = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const pageData = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderTooltip = (msg) => <Tooltip>{msg}</Tooltip>;

  // Monthly Trend CSV
  const handleExportMonthlyCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      ["Month,Units", ...monthlyTrend.map(item => `${item.name},${item.units}`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "monthly_trend.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Monthly Trend PDF
  const handleExportMonthlyPDF = () => {
    const doc = new jsPDF();
    doc.text("Monthly Approved Units", 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [["Month", "Units"]],
      body: monthlyTrend.map(item => [item.name, item.units]),
    });
    doc.save("monthly_trend.pdf");
  };

  // Top Blood Types CSV
  const handleExportTopTypesCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      ["Blood Group,Units", ...topTypes.map(item => `${item.bloodGroup},${item.units}`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "top_blood_types.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Top Blood Types PDF
  const handleExportTopTypesPDF = () => {
    const doc = new jsPDF();
    doc.text("Top Blood Types Requested", 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [["Blood Group", "Units"]],
      body: topTypes.map(item => [item.bloodGroup, item.units]),
    });
    doc.save("top_blood_types.pdf");
  };

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(prev => !prev);

  const [showSupportModal, setShowSupportModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const chatEndRef = useRef(null);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const userMsg = { sender: 'user', text: newMessage };
    setMessages((prev) => [...prev, userMsg]);
    setNewMessage('');
    setIsLoading(true);

    try {
      const res = await publicRequest.post('/ai/ask', { question: newMessage });
      const aiMsg = { sender: 'ai', text: res.data.reply };
      setMessages((prev) => [...prev, aiMsg]);

      // Voice Output
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(res.data.reply);
        synth.speak(utterance);
      }
    } catch (err) {
      console.error('AI Error:', err);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Sorry, something went wrong.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!recognition) return alert("Speech recognition not supported");

    if (!listening) {
      recognition.start();
      setListening(true);
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNewMessage(transcript);
      setListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setListening(false);
    };
  };

  const handleDownloadTranscript = () => {
    const content = messages.map(msg => `${msg.sender.toUpperCase()}: ${msg.text}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chat-transcript.txt';
    link.click();
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    const navbar = document.querySelector('.navbar'); // Assumes using Bootstrap .navbar class
    const offset = navbar?.offsetHeight || 100;
    if (section) {
      const y = section.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (!hospital) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status" />
        <div className="mt-2">Loading Hospital information...</div>
      </Container>
    );
  }

  return (
    <div className="p-4 hospital-page-container">
      <Navbar
        bg={darkMode ? 'dark' : 'light'}
        variant={darkMode ? 'dark' : 'light'}
        expand="lg"
        sticky="top"
        className="shadow-sm py-2 mb-5 px-3 z-3"
        style={{ position: 'sticky', top: 0, zIndex: 1000 }}
      >
        <Container fluid className="d-flex justify-content-between flex-wrap align-items-center">
          <Navbar.Brand className="fw-bold text-primary fs-4 d-flex align-items-center gap-2">
            🏥 Hospital Dashboard
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="hospital-navbar" />
          <Navbar.Collapse id="hospital-navbar" className="mt-2 mt-lg-0">
            <Nav className="me-auto d-flex flex-wrap gap-2">
              <Nav.Link
                onClick={() => {
                  const section = document.getElementById('overviewSection');
                  if (section) {
                    const yOffset = -150; // Adjust based on navbar height
                    const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
              >
                Overview
              </Nav.Link>
              <Nav.Link onClick={() => scrollToSection('inventorySection')}>
                Inventory
              </Nav.Link>
              <Nav.Link onClick={() => scrollToSection('requestSection')}>
                Trends
              </Nav.Link>
              <Nav.Link onClick={() => scrollToSection('historySection')}>
                History
              </Nav.Link>
            </Nav>

            {/* Actions: Responsive Button Group */}
            <div className="d-flex flex-wrap gap-2 mt-3 mt-lg-0 justify-content-lg-end">
              <Button
                variant="outline-primary"
                onClick={() => setShowEditModal(true)}
                className="d-flex align-items-center px-3 py-2"
              >
                <FaEye className="me-2" />
              </Button>

              <Button
                variant="outline-dark"
                className="d-flex align-items-center px-3 py-2"
                onClick={toggleTheme}
                title="Toggle dark mode"
              >
                <i className={`bi ${darkMode ? 'bi-sun-fill' : 'bi-moon-fill'} me-1`}></i>
              </Button>

              <Button
                variant="danger"
                onClick={handleLogout}
                className="d-flex align-items-center px-3 py-2"
              >
                <FaSignOutAlt className="me-2" />
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="mt-5 px-3" >
        {response && (
          <Alert
            variant="success"
            className="position-fixed top-0 start-50 translate-middle-x mt-3 shadow z-3"
            style={{ zIndex: 1056, width: 'auto', maxWidth: '90%' }}
            onClose={() => setResponse(null)}
            dismissible
          >
            ✅ {response}
          </Alert>
        )}

        <Modal
          show={showSupportModal}
          onHide={() => setShowSupportModal(false)}
          centered
          size="md"
        >
          <Modal.Header closeButton>
            <Modal.Title>💬 Hospital Support Chat</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <div className="chat-box d-flex flex-column gap-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded shadow-sm ${msg.sender === 'ai' ? 'bg-light text-secondary align-self-start' : 'bg-primary text-white align-self-end'}`}
                  style={{ maxWidth: '75%' }}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </Modal.Body>
          <Modal.Footer className="d-flex gap-2 flex-wrap">
            <Form.Control
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button variant="success" onClick={handleVoiceInput}>
              🎤 {listening ? 'Listening...' : 'Speak'}
            </Button>
            <Button variant="primary" onClick={handleSendMessage} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
            <Button variant="secondary" onClick={handleDownloadTranscript}>
              ⬇️ Download
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Profile Modal */}
        <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered size="lg" backdrop="static" keyboard={false}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold text-primary">Your Profile Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="align-items-center">
              <Col md={4} className="text-center mb-3 mb-md-0">
                <img
                  src={
                    hospital.profileImage instanceof File
                      ? URL.createObjectURL(hospital.profileImage)
                      : (typeof hospital.profileImage === 'string' && hospital.profileImage.startsWith('http'))
                        ? hospital.profileImage
                        : '/images/default-avatar.png'
                  }
                  alt="Profile"
                  className="rounded-circle border border-4 border-primary shadow-sm"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />

              </Col>
              <Col md={8}>
                <h4 className="fw-bold mb-3">{hospital.name || 'N/A'}</h4>
                <Row>
                  <Col xs={6}><strong>Email:</strong> {hospital.email || 'N/A'}</Col>
                  <Col xs={6}><strong>Phone:</strong> {hospital.tel || 'N/A'}</Col>
                </Row>
                <Row className="mt-2">
                  <Col><strong>Address:</strong> {hospital.address || 'N/A'}</Col>
                </Row>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowEditModal(true)}>
              <FaEdit className="me-2" /> Edit
            </Button>
            <Button variant="secondary" onClick={() => setShowProfileModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>

        {/* Collapsible Profile Card */}
        {showProfileDetails && (
          <Row>
            <Col md={8}>
              <div className="profile-card bg-white rounded shadow-sm p-4 mb-4 animate-fade-in">
                <div className="d-flex flex-column flex-md-row align-items-center gap-4">
                  <img
                    src={
                      hospital.profileImage instanceof File
                        ? URL.createObjectURL(hospital.profileImage)
                        : (typeof hospital.profileImage === 'string' && hospital.profileImage.startsWith('http'))
                          ? hospital.profileImage
                          : '/images/default-avatar.png'
                    }
                    alt="Profile"
                    className="rounded-circle border border-4 border-primary shadow-sm"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />


                  <div className="w-100">
                    <p><strong>Name:</strong> {hospital.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {hospital.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {hospital.tel || 'N/A'}</p>
                    <p><strong>Address:</strong> {hospital.address || 'N/A'}</p>
                  </div>
                </div>
                <div className="text-end mt-3">
                  <Button variant="outline-secondary" onClick={() => setShowEditModal(true)}>
                    Edit Profile
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        )}

        {/* EDIT PROFILE MODAL */}
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          size="lg"
          centered
          backdrop="static"
          keyboard={false}
          contentClassName="border-0"
        >
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold fs-3 text-primary">Edit Profile</Modal.Title>
          </Modal.Header>

          <Modal.Body className="pt-2">
            <Form>
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group controlId="editName" className="mb-3">
                    <Form.Label className="fw-semibold">Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleProfileChange}
                      required
                      placeholder="Enter your full name"
                      className="form-input-shadow rounded-3 shadow-sm"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="editEmail" className="mb-3">
                    <Form.Label className="fw-semibold">Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleProfileChange}
                      required
                      placeholder="your.email@example.com"
                      className="form-input-shadow rounded-3 shadow-sm"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group controlId="editAddress" className="mb-4">
                <Form.Label className="fw-semibold">Address</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={editData.address}
                  onChange={handleProfileChange}
                  placeholder="Your residential address"
                  className="form-input-shadow rounded-3 shadow-sm"
                />
              </Form.Group>

              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group controlId="editTel" className="mb-3">
                    <Form.Label className="fw-semibold">Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="tel"
                      value={editData.tel}
                      onChange={handleProfileChange}
                      placeholder="+1 234 567 8900"
                      className="form-input-shadow rounded-3 shadow-sm"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group controlId="editProfileImage" className="mb-4">
                <Form.Label className="fw-semibold">Profile Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="form-input-shadow rounded-3 shadow-sm"
                />

                {/* ✅ Image preview */}
                <div className="mt-4 d-flex justify-content-center">
                  <img
                    src={
                      hospital.profileImage instanceof File
                        ? URL.createObjectURL(hospital.profileImage)
                        : (typeof hospital.profileImage === 'string' && hospital.profileImage.startsWith('http'))
                          ? hospital.profileImage
                          : '/images/default-avatar.png'
                    }
                    alt="Profile"
                    className="rounded-circle border border-3 border-primary shadow"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                </div>
              </Form.Group>
            </Form>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0">
            <Button variant="outline-secondary" onClick={() => setShowEditModal(false)} className="px-4 py-2">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleProfileSave}
              disabled={isUpdating}
              className="px-4 py-2"
            >
              {isUpdating ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : 'Save'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* TOTAL INVENTORY + STATUS SUMMARY */}
        <Row id="overviewSection" className="mb-5" style={{ marginTop: "100px" }}>
          {/* Total Approved Units */}
          <Col md={3}>
            <div
              data-tooltip-id="approved-tooltip"
              data-tooltip-content="All approved blood units across types"
              className="bg-white shadow-sm rounded border-start border-4 border-success text-center hover-scale"
              style={{ padding: '0.25rem', minHeight: '120px' }}
            >
              <i className="bi bi-check2-circle text-success fs-3 mb-1"></i>
              <h6 className="mb-1">Total Approved Units</h6>
              <h4 className="fw-bold mb-1">{totalApprovedUnits}</h4>
              <small className="text-muted">Up-to-date stock</small>
            </div>
            <ReactTooltip id="approved-tooltip" place="top" />
          </Col>

          {/* Status Boxes */}
          {['Pending', 'Approved', 'Rejected'].map(status => {
            const iconMap = {
              Pending: 'bi-hourglass-split',
              Approved: 'bi-check-circle-fill',
              Rejected: 'bi-x-circle-fill',
            };
            const colorMap = {
              Pending: 'warning',
              Approved: 'success',
              Rejected: 'danger',
            };

            return (
              <Col key={status} md={3}>
                <div
                  data-tooltip-id={`status-tooltip-${status}`}
                  data-tooltip-content={`${status} requests overview`}
                  className={`bg-white shadow-sm rounded border-start border-4 border-${colorMap[status]} h-100 text-center hover-scale`}
                  style={{ padding: '0.75rem', minHeight: '120px' }}
                >
                  <div className="d-flex align-items-center justify-content-center mb-1">
                    <i className={`bi ${iconMap[status]} text-${colorMap[status]} fs-3 me-2`}></i>
                    <h6 className="mb-0">{status}</h6>
                  </div>
                  <h4 className="fw-bold mb-1">{statusCounts[status] || 0}</h4>
                  <small className="text-muted">Requests</small>
                </div>
                <ReactTooltip id={`status-tooltip-${status}`} place="top" />
              </Col>
            );
          })}
        </Row>

        {/* INVENTORY OVERVIEW */}
        <Row id="inventorySection" className="mb-4">
          <Col md={12}>
            <div className="p-4 bg-light shadow-sm rounded">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h5 className="mb-0 d-flex align-items-center">
                  <i className="bi bi-droplet-fill text-danger me-2 fs-4"></i>
                  <span className="fw-bold">Inventory by Blood Group</span>
                </h5>
                <Button
                  variant="danger"
                  onClick={() => setShowModal(true)}
                  className="d-flex align-items-center gap-2"
                >
                  <FaPlus className="mb-1" /> New Request
                </Button>

              </div>
              <Row className="g-4">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => {
                  const units = bloodInventory[bg] || 0;

                  let statusClass = "bg-success-subtle text-success";
                  if (units < 5) statusClass = "bg-danger-subtle text-danger";
                  else if (units < 10) statusClass = "bg-warning-subtle text-warning";

                  return (
                    <Col xs={12} sm={6} md={4} lg={3} key={bg}>
                      <div
                        className="p-3 bg-white shadow rounded text-center border custom-box position-relative h-100"
                        title={`Available stock for blood type ${bg}`}
                      >
                        <div className="icon-circle mx-auto mb-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <i className="bi bi-bag-heart-fill fs-4 text-danger pulse-icon"></i>
                        </div>

                        <h6 className="mb-1 fw-bold text-uppercase" style={{ fontSize: '1.1rem' }}>{bg}</h6>

                        <div className="mb-1">
                          <span className={`badge px-2 py-1 fs-7 fw-semibold ${statusClass}`} style={{ fontSize: '1rem' }}>
                            {units} units
                          </span>
                        </div>

                        <small className="text-muted" style={{ fontSize: '0.8rem' }}>Updated just now</small>
                      </div>
                    </Col>
                  );
                })}
              </Row>

            </div>
          </Col>
        </Row>

        {/* Modal for Blood Request Form */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton className="bg-danger text-white">
            <Modal.Title>Submit Blood Request</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form className="row g-3" onSubmit={handleSubmitRequest}>
              <div className="col-md-6">
                <select
                  value={bloodGroup}
                  name="bloodGroup"
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="form-control rounded-3"
                  required
                >
                  <option value="">Select Blood Type</option>
                  {["AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <input
                  type="number"
                  name="amount"
                  placeholder="Amount (in units)"
                  className="form-control rounded-3"
                  value={formData.amount}
                  onChange={handleRequestChange}
                  required
                  min={1}
                />
              </div>
              <div className="col-12">
                <textarea
                  name="caseDescription"
                  placeholder="Case Description"
                  className="form-control rounded-3"
                  value={formData.caseDescription}
                  onChange={handleRequestChange}
                  rows="3"
                />
              </div>
              <div className="col-md-6">
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleRequestChange}
                  className="form-control rounded-3"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="col-12 d-grid">
                <button type="submit" className="btn btn-danger btn-lg rounded-3" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : 'Submit Request'}
                </button>
              </div>
            </form>
            {response && <p className="mt-4 text-center text-success fw-semibold">{response}</p>}
          </Modal.Body>
        </Modal>

        {/* MONTHLY TREND SECTION */}
        <Row id="requestSection" className="mb-5 gy-4">
          {/* Monthly Approved Units Chart */}
          <Col md={6} className="p-3 bg-white rounded shadow-sm chart-card position-relative hover-shadow">
            <Row className="mb-3 justify-content-between align-items-center">
              <Col xs="auto">
                <h5 className="text-primary fw-bold mb-0 d-flex align-items-center">
                  📈 Monthly Approved Units
                </h5>
              </Col>
              <Col xs="auto">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="d-flex align-items-center shadow-sm"
                    onClick={handleExportMonthlyCSV}
                    data-tooltip-id="monthly-csv"
                    data-tooltip-content="Download as CSV"
                  >
                    <FaFileCsv className="me-1" /> CSV
                  </Button>
                  <ReactTooltip id="monthly-csv" place="top" />

                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="d-flex align-items-center shadow-sm"
                    onClick={handleExportMonthlyPDF}
                    data-tooltip-id="monthly-pdf"
                    data-tooltip-content="Download as PDF"
                  >
                    <FaFilePdf className="me-1" /> PDF
                  </Button>
                  <ReactTooltip id="monthly-pdf" place="top" />

                </div>
              </Col>
            </Row>

            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyTrend} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  label={{ value: "Month", position: "insideBottomRight", offset: -5 }}
                />
                <YAxis
                  label={{ value: "Units", angle: -90, position: "insideLeft" }}
                />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="units"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Col>

          {/* Top Blood Types Requested Chart */}
          <Col md={6} className="p-3 bg-white rounded shadow-sm chart-card position-relative hover-shadow">
            <Row className="mb-3 justify-content-between align-items-center">
              <Col xs="auto">
                <h5 className="text-primary fw-bold mb-0 d-flex align-items-center">
                  🩸 Top Blood Types Requested
                </h5>
              </Col>
              <Col xs="auto">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="d-flex align-items-center shadow-sm"
                    onClick={handleExportTopTypesCSV}
                    data-tooltip-id="toptypes-csv"
                    data-tooltip-content="Download as CSV"
                  >
                    <FaFileCsv className="me-1" /> CSV
                  </Button>
                  <ReactTooltip id="toptypes-csv" place="top" />

                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="d-flex align-items-center shadow-sm"
                    onClick={handleExportTopTypesPDF}
                    data-tooltip-id="toptypes-pdf"
                    data-tooltip-content="Download as PDF"
                  >
                    <FaFilePdf className="me-1" /> PDF
                  </Button>
                  <ReactTooltip id="toptypes-pdf" place="top" />

                </div>
              </Col>
            </Row>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topTypes} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="bloodGroup"
                  label={{ value: "Blood Type", position: "insideBottom", offset: -5 }}
                />
                <YAxis
                  label={{ value: "Units", angle: -90, position: "insideLeft" }}
                />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="units" fill="#82ca9d" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </Col>
        </Row>

        {/* LOW STOCK WARNINGS */}
        {Object.keys(bloodInventory).map(bg => (
          bloodInventory[bg] < 5 && (
            <Row key={bg}>
              <Alert variant="warning">
                <FaTimes /> Low stock: <strong>{bg}</strong> only {bloodInventory[bg]} units left.
              </Alert>
            </Row>
          )
        ))}

        {/* Toggle Request History Button */}
        <div className="mt-4 text-center">
          <Button
            variant="outline-info"
            className="px-4 py-2 shadow-sm rounded-pill fw-semibold"
            onClick={() => setShowRequests(!showRequests)}
          >
            {showRequests ? "Hide Request History" : "Show Request History"}
          </Button>
        </div>

        {/* Request History Section */}
        {showRequests && (
          <div id="historySection" className="request-history mt-4 animate-fade-in">

            {/* Filters */}
            <div className="bg-light p-3 rounded shadow-sm mb-4">
              <Row className="g-3">
                <Col xs={12} md={4}>
                  <Form.Select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">Filter by Status</option>
                    <option value="Approved">✅ Approved</option>
                    <option value="Rejected">❌ Rejected</option>
                    <option value="Pending">⏳ Pending</option>
                  </Form.Select>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Select
                    value={filters.bloodGroup}
                    onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
                  >
                    <option value="">Filter by Blood Group</option>
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((group) => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Select
                    value={filters.urgency}
                    onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
                  >
                    <option value="">Filter by Urgency</option>
                    <option value="High">🔥 High</option>
                    <option value="Medium">⚠️ Medium</option>
                    <option value="Low">🟢 Low</option>
                  </Form.Select>
                </Col>
              </Row>
            </div>

            {/* Table or No Data */}
            {currentPageData.length === 0 ? (
              <p className="text-muted text-center fst-italic">
                No matching requests found.
              </p>
            ) : (
              <div className="table-responsive">
                <Table bordered hover responsive>
                  <thead className="text-center">
                    <tr>
                      <th>Blood Group</th>
                      <th>Amount</th>
                      <th>Urgency</th>
                      <th>Status</th>
                      <th>Requested At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageData.map((req) => (
                      <tr key={req._id} className="text-center">
                        <td className="fw-bold blood-group">{req.bloodGroup}</td>
                        <td className="amount">{req.amount}</td>

                        {/* Urgency Badge */}
                        <td>
                          <span
                            className={`badge rounded-pill px-2`}
                            style={{
                              backgroundColor:
                                req.urgency === 'High'
                                  ? '#dc3545'
                                  : req.urgency === 'Medium'
                                    ? '#ffc107'
                                    : '#198754',
                              color:
                                req.urgency === 'Medium' ? '#212529' : '#fff',
                            }}
                          >
                            {req.urgency}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="text-center">
                          <span
                            className="badge rounded-pill d-flex align-items-center justify-content-center gap-2 px-2 py-1"
                            style={{
                              backgroundColor:
                                req.status === 'Approved'
                                  ? '#198754'
                                  : req.status === 'Rejected'
                                    ? '#dc3545'
                                    : '#ffc107',
                              color:
                                req.status === 'Pending' ? '#212529' : '#fff',
                              minWidth: '110px',
                            }}
                          >
                            {req.status === 'Approved' && <FaCheckCircle className="pulse-icon" />}
                            {req.status === 'Rejected' && <FaTimesCircle className="pulse-icon" />}
                            {req.status === 'Pending' && <FaClock className="pulse-icon" />}
                            <span className="fw-semibold">{req.status}</span>
                          </span>
                        </td>

                        <td className="requested-at">
                          {new Date(req.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </Table>
              </div>
            )}

            {/* Pagination */}
            {filteredRequests.length > itemsPerPage && (
              <Pagination className="justify-content-center mt-3">
                {[...Array(Math.ceil(filteredRequests.length / itemsPerPage))].map((_, index) => (
                  <Pagination.Item
                    key={index}
                    active={currentPage === index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className="fw-semibold"
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            )}
          </div>
        )}
      </Container>

      <div className="fixed bottom-6 right-6 z-50">
       <button
          className="btn btn-outline-primary d-flex align-items-center gap-1 px-3 py-2 fw-semibold shadow-sm"
          onClick={() => setShowSupportModal(true)}
          title="Live Chat Support"
        >
          💬
        </button>
      </div>

    </div>


  );
};

export default HospitalPage;
