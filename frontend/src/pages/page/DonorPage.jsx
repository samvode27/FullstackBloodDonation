import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, ProgressBar, Navbar, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/donorRedux';
import {
  FaWeight, FaBirthdayCake, FaClock, FaTint, FaUserCheck, FaUserCircle, FaStethoscope,
  FaSyringe, FaUtensils, FaChevronDown, FaHandHoldingHeart, FaSun, FaMoon, FaSignOutAlt, FaComments
} from 'react-icons/fa';

import ChartJsImage from 'chartjs-to-image';

import ScrollAnimation from 'react-animate-on-scroll';
import 'animate.css/animate.compat.css';

import annotationPlugin from 'chartjs-plugin-annotation';
ChartJS.register(annotationPlugin);

import ChartDataLabels from 'chartjs-plugin-datalabels';
ChartJS.register(ChartDataLabels);

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
  ChartDataLabels
);


import { QRCodeCanvas } from 'qrcode.react';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import { publicRequest } from "../../requestMethods";

import './DonorPage.css';

const MIN_WEIGHT = 50;
const MIN_AGE = 18;
const MAX_AGE = 65;
const DONATION_INTERVAL_DAYS = 60;

const compatibilityMap = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['Everyone'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
};


const DonorPage = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const steps = [
    {
      icon: <FaUserCheck size={28} className="text-danger" />,
      title: "1. Registration",
      description: "Complete donor registration and health history",
    },
    {
      icon: <FaStethoscope size={28} className="text-danger" />,
      title: "2. Health Check",
      description: "Quick physical including any disease check",
    },
    {
      icon: <FaSyringe size={28} className="text-danger" />,
      title: "3. Donation",
      description: "Actual blood donation takes 8–10 minutes",
    },
    {
      icon: <FaUtensils size={28} className="text-danger" />,
      title: "4. Refreshment",
      description: "Enjoy snacks and rest for 10–15 minutes",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [question, setQuestion] = useState('');

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Who can donate blood?",
      answer: (
        <>
          <p>Generally, you can donate blood if you:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Are between 18-65 years old</li>
            <li>Weigh at least 50 kg (110 lbs)</li>
            <li>Are in good health</li>
            <li>Have not donated blood in the last 3 months</li>
            <li>No recent tattoos or piercings (within 6 months)</li>
            <li>Are not pregnant or breastfeeding</li>
          </ul>
        </>
      ),
    },
    {
      question: "How often can I donate blood?",
      answer: (
        <p>
          Men can donate every 3 months (4x/year), women every 4 months (3x/year) — giving your body time to recover.
        </p>
      ),
    },
    {
      question: "Is blood donation safe?",
      answer: (
        <p>
          Yes. We use sterile, single-use equipment. Side effects are rare and mild, like dizziness or bruising.
        </p>
      ),
    },
    {
      question: "How long does the donation process take?",
      answer: (
        <p>
          The entire process takes 45-60 minutes, while the donation itself takes just 8–10 minutes.
        </p>
      ),
    },
    {
      question: "What happens to my donated blood?",
      answer: (
        <>
          <p>After donation, your blood is:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Tested for infectious diseases</li>
            <li>Processed into components</li>
            <li>Stored securely</li>
            <li>Distributed to hospitals</li>
            <li>Used within 42 days (or plasma up to 1 year)</li>
          </ul>
        </>
      ),
    },
  ];

  const [donor, setDonor] = useState(null);
  const [bloodGroup, setBloodGroup] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [topDonors, setTopDonors] = useState([]);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donationHistory, setDonationHistory] = useState([]);
  const [showProfileDetails, setShowProfileDetails] = useState(false);


  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const qrRef = useRef(null);

  const handleDownloadQR = () => {
    if (!donor || (!donor.name && !donor.email) || !qrRef.current) {
      toast.error("QR code or donor data is not ready.");
      return;
    }

    // Use donor.name if exists, else donor.email (replace special chars too)
    const donorId = (donor.name || donor.email).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) {
      toast.error("Failed to find QR code canvas.");
      return;
    }

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${donorId}_QR.png`;
    link.click();
  };

  const chartRef = useRef(null);

  const handleDownload = () => {
    if (chartRef.current) {
      const chart = chartRef.current;
      const base64Image = chart.toBase64Image();
      const link = document.createElement('a');
      link.href = base64Image;
      link.download = 'donation-chart.png';
      link.click();
    }
  };

  const [donationData, setDonationData] = useState({
    date: '',
    bloodgroup: '',
    amount: '',
    disease: '',
    age: '',
    weight: ''
  });

  const [editData, setEditData] = useState({
    name: '',
    email: '',
    address: '',
    tel: '',
    age: '',
    weight: '',
    bloodgroup: '',
    profileImage: ''
  });

  // Calculate profile completeness helper
  const calculateCompleteness = (data) => {
    let count = 0;
    const totalFields = 7; // name, email, address, tel, age, weight, bloodgroup
    if (data.name) count++;
    if (data.email) count++;
    if (data.address) count++;
    if (data.tel) count++;
    if (data.age) count++;
    if (data.weight) count++;
    if (data.bloodgroup) count++;
    return Math.round((count / totalFields) * 100);
  };

  // Fetch donor profile + donation history + top donors
  const fetchDonorProfile = useCallback(async () => {
    try {
      const { data } = await publicRequest.get('/donors/me', { withCredentials: true });

      const profileImageUrl = data.profileImage
        ? (data.profileImage.startsWith('http') ? data.profileImage : `http://localhost:8000${data.profileImage}`)
        : '';

      const latestDonation = data.donationHistory?.[data.donationHistory.length - 1];
      const extractedBloodGroup = latestDonation?.bloodgroup || '';

      setBloodGroup(extractedBloodGroup);
      setDonor({ ...data, profileImage: profileImageUrl });
      setEditData({
        name: data.name || '',
        email: data.email || '',
        address: data.address || '',
        tel: data.tel || '',
        age: data.age || '',
        weight: data.weight || '',
        bloodgroup: extractedBloodGroup,
        profileImage: profileImageUrl,
      });
      setDonationHistory(data.donationHistory || []);
      setProfileCompleteness(calculateCompleteness(data));
    } catch (err) {
      // handle errors
    }
  }, [dispatch, navigate]);


  const fetchTopDonors = useCallback(async () => {
    try {
      const res = await publicRequest.get('/donors/top');
      setTopDonors(res.data.topDonors);
    } catch (error) {
      console.error('Error fetching top donors:', error);
    }
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      await fetchDonorProfile(); // ensures donor + donationHistory set
      await fetchTopDonors();
    };
    fetchAll();
  }, [fetchDonorProfile, fetchTopDonors]);

  // Eligibility logic
  const donationCount = donor?.numberOfDonations ?? 0;
  const isFirstTimeDonor = donationCount === 0;

  const lastDonationDate = donor?.lastDonationDate ? new Date(donor.lastDonationDate) : null;

  const daysSinceLastDonation = lastDonationDate
    ? Math.floor((new Date() - lastDonationDate) / (1000 * 60 * 60 * 24))
    : Infinity;

  // Calculate next eligible date
  const nextEligibleDate = lastDonationDate
    ? new Date(lastDonationDate.getTime() + DONATION_INTERVAL_DAYS * 24 * 60 * 60 * 1000)
    : new Date();

  const isEligibleByWeight = donor?.weight >= MIN_WEIGHT;
  const isEligibleByAge = donor?.age >= MIN_AGE && donor?.age <= MAX_AGE;
  const isEligibleByInterval = daysSinceLastDonation >= DONATION_INTERVAL_DAYS;

  // Prepare data for bar chart - Donations per Year
  const donationCountsByYear = donationHistory.reduce((acc, donation) => {
    const year = new Date(donation.date).getFullYear();
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});

  const donationMonthsByYear = donationHistory.reduce((acc, donation) => {
    const date = new Date(donation.date);
    const year = date.getFullYear();
    const monthLabel = date.toLocaleString('default', { month: 'short' });

    if (!acc[year]) acc[year] = new Set();
    acc[year].add(monthLabel);

    return acc;
  }, {});
  const years = Object.keys(donationCountsByYear).sort();

  // Badges
  const badges = [
    {
      name: 'First Donation', earned: donationCount >= 1, color: donationCount >= 1 ? 'success' : 'secondary', // 🟢
    },
    {
      name: '5 Donations', earned: donationCount >= 5, color: donationCount >= 5 ? 'primary' : 'secondary', // 🔵
    },
    {
      name: '10 Donations', earned: donationCount >= 10, color: donationCount >= 10 ? 'warning' : 'secondary', // 🟡
    }
  ];

  const getQRBorderColor = () => {
    if (donationCount >= 10) return 'border-warning';
    if (donationCount >= 6) return 'border-primary';
    if (donationCount >= 1) return 'border-success';
    return 'border-secondary';
  };

  // Handlers
  const handleDonationChange = e => setDonationData({ ...donationData, [e.target.name]: e.target.value });

  // Handle text input change
  const handleProfileChange = e => setEditData({ ...editData, [e.target.name]: e.target.value });

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


  const handleFirstDonation = async e => {
    e.preventDefault();

    const { age, weight, disease } = donationData;

    const isAgeValid = Number(age) >= MIN_AGE && Number(age) <= MAX_AGE;
    const isWeightValid = Number(weight) >= MIN_WEIGHT;
    const isDiseaseFree = !disease || disease.toLowerCase() === 'none';
    const isIntervalValid = isFirstTimeDonor || daysSinceLastDonation >= 56;

    if (!isAgeValid || !isWeightValid || !isDiseaseFree || !isIntervalValid) {
      let reasons = [];
      if (!isAgeValid) reasons.push("Age must be between 18 and 65.");
      if (!isWeightValid) reasons.push("Weight must be at least 50kg.");
      if (!isDiseaseFree) reasons.push("You must be disease-free to donate.");
      if (!isIntervalValid && !isFirstTimeDonor) {
        const waitDays = 56 - daysSinceLastDonation;
        reasons.push(`You need to wait ${waitDays > 0 ? waitDays : 0} more days since your last donation.`);
      }

      toast.error("Not eligible to donate:\n" + reasons.join("\n"));
      return;
    }

    try {
      const res = await publicRequest.post('/donors/donation', {
        donorId: donor._id,
        ...donationData
      });

      toast.success(res.data.message);

      // Refresh donor profile and history
      await fetchDonorProfile();
      setDonationData({
        date: '',
        bloodgroup: '',
        amount: '',
        disease: '',
        age: '',
        weight: ''
      });
      setShowDonationForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Donation failed');
    }
  };

  // Save profile (upload or update)
  const handleProfileSave = async () => {
    setIsUpdating(true);
    try {
      if (editData.profileImage instanceof File) {
        // New image selected → use multipart/form-data
        const formData = new FormData();
        formData.append('image', editData.profileImage);

        // Upload only image
        const { data } = await publicRequest.post('/donors/uploadprofile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });

        toast.success("Profile image uploaded.");
      }

      // Always update the profile data separately (JSON)
      const updatePayload = {
        name: editData.name,
        email: editData.email,
        address: editData.address,
        tel: editData.tel,
        age: editData.age,
        weight: editData.weight,
        bloodgroup: editData.bloodgroup
      };

      const userId = donor._id; // Assuming donor data is already loaded
      const { data } = await publicRequest.put(`/donors/${userId}`, updatePayload, {
        withCredentials: true
      });

      toast.success("Profile updated successfully!");
      setDonor(data.donor);

      setShowEditModal(false);
      fetchDonorProfile();
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error("Failed to save profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('donorDarkMode');
    if (saved === 'true') setIsDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('donorDarkMode', isDarkMode);
  }, [isDarkMode]);


  const [showSupportModal, setShowSupportModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);


  // Scroll to latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Send message to backend
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = { sender: 'user', text: newMessage };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      const res = await publicRequest.post('/ai/ask', { question: newMessage });
      const aiMessage = { sender: 'ai', text: res.data.reply };
      setMessages(prev => [...prev, aiMessage]);
      speakText(aiMessage.text); // 🔊 speak AI reply
    } catch (err) {
      console.error('AI Error:', err);
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Sorry, something went wrong. Please try again later.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice output
  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  // Voice input
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Your browser does not support voice input.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNewMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  // Download transcript
  const downloadTranscript = () => {
    const text = messages.map(msg =>
      `${msg.sender === 'user' ? 'You' : 'AI'}: ${msg.text}`
    ).join('\n\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'chat-transcript.txt';
    link.click();
  };

  useEffect(() => {
    // Enable smooth scroll globally
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    const navbar = document.querySelector('.navbar'); // Bootstrap class
    const offset = navbar?.offsetHeight || 100;
    if (section) {
      const y = section.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (!donor) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status" />
        <div className="mt-2">Loading donor information...</div>
      </Container>
    );
  }

  return (
    <div className={isDarkMode ? 'donor-page dark-mode' : 'donor-page'}>

      <Navbar
        bg={isDarkMode ? 'dark' : 'light'}
        variant={isDarkMode ? 'dark' : 'light'}
        expand="lg"
        sticky="top"
        className="shadow-sm py-3 px-3 mb-5 z-3"
        style={{ position: 'sticky', top: 0, zIndex: 1000 }}
      >
        <Container fluid className="d-flex justify-content-between">
          <Navbar.Brand href="#" className="fw-bold text-danger">
            🩸 Donor Dashboard
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="donor-navbar-nav" />
          <Navbar.Collapse id="donor-navbar-nav" className="justify-content-end">
            <Nav className="d-flex align-items-center gap-2 flex-wrap">

              {/* Updated Nav Links with scrollToSection */}
              <Nav.Link onClick={() => scrollToSection('top-donors')} className="fw-semibold">
                Top Donors
              </Nav.Link>
              <Nav.Link onClick={() => scrollToSection('donation-process')} className="fw-semibold">
                Process
              </Nav.Link>
              <Nav.Link onClick={() => scrollToSection('faq')} className="fw-semibold">
                FAQ
              </Nav.Link>
              <Nav.Link onClick={() => scrollToSection('status')} className="fw-semibold">
                Donate it
              </Nav.Link>
              <Nav.Link onClick={() => scrollToSection('history')} className="fw-semibold">
                History
              </Nav.Link>

              {/* View Profile */}
              <button
                className="btn btn-outline-info d-flex align-items-center gap-2 px-3 py-2 fw-semibold shadow-sm"
                onClick={() => setShowProfileModal(true)}
                title="View Profile"
              >
                <FaUserCircle size={18} />
              </button>

              {/* Dark Mode Toggle */}
              <button
                className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'} d-flex align-items-center gap-2 px-3 py-2 fw-semibold shadow-sm`}
                onClick={() => setIsDarkMode(!isDarkMode)}
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
              </button>

              {/* Logout */}
              <button
                className="btn btn-danger d-flex align-items-center gap-2 px-3 py-2 fw-semibold shadow-sm"
                onClick={handleLogout}
                title="Logout"
              >
                <FaSignOutAlt size={18} />
              </button>

              {/* Live Chat */}
              <button
                className="btn btn-outline-primary d-flex align-items-center gap-1 px-3 py-2 fw-semibold shadow-sm"
                onClick={() => setShowSupportModal(true)}
                title="Live Chat Support"
              >
                💬
              </button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="p-4 donor-page-container">
        <ToastContainer />

        {/* Chat Modal */}
        <Modal
          show={showSupportModal}
          onHide={() => setShowSupportModal(false)}
          centered
          size="md"
        >
          <Modal.Header closeButton>
            <Modal.Title>💬 Live Support Chat</Modal.Title>
          </Modal.Header>

          <Modal.Body className="p-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <div className="d-flex flex-column chat-box mb-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-2 p-2 rounded shadow-sm ${msg.sender === 'ai'
                    ? 'bg-light text-secondary align-self-start'
                    : 'bg-primary text-white align-self-end'
                    }`}
                  style={{ maxWidth: '75%' }}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            {isLoading && <div className="text-center text-muted">AI is typing...</div>}
          </Modal.Body>

          <Modal.Footer className="d-flex flex-wrap gap-2">
            <Form.Control
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button variant="secondary" onClick={handleVoiceInput}>
              {isListening ? '🎙️ Listening...' : '🎤 Speak'}
            </Button>
            <Button variant="outline-secondary" onClick={downloadTranscript}>
              📄 Download
            </Button>
            <Button variant="primary" onClick={handleSendMessage}>
              Send
            </Button>
          </Modal.Footer>
        </Modal>

        {/* --- TOP DONORS SECTION --- */}
        <Row id="top-donors" className="mb-5 mt-5">
          <Col>
            <h3 className={`mb-4 text-center fw-bold ${isDarkMode ? 'text-light' : 'text-danger'}`}>
              🌟 Top Donors for Inspiration
            </h3>

            <div className="d-flex flex-wrap justify-content-center gap-4">
              {topDonors.length > 0 ? (
                topDonors.map((donor, index) => (
                  <Card
                    key={donor._id}
                    className="shadow donor-card text-center border-0"
                    style={{
                      width: '235px',
                      borderRadius: '15px',
                      background: isDarkMode ? '#2c2c2c' : '#fff',
                      color: isDarkMode ? '#f8f9fa' : '#212529',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
                    }}
                  >
                    <Card.Body>
                      <div className="position-relative mb-3">
                        <img
                          src={donor.profileImage ? `http://localhost:8000${donor.profileImage}` : '/images/default-avatar.png'}
                          alt="Profile"
                          className="rounded-circle border border-2 border-danger"
                          style={{ width: '90px', height: '90px', objectFit: 'cover' }}
                        />
                        <span
                          className="position-absolute badge badge-rank rounded-pill"
                          style={{
                            backgroundColor: isDarkMode ? '#dc3545' : '#ffc107',
                            color: isDarkMode ? '#fff' : '#212529',
                          }}
                        >
                          #{index + 1}
                        </span>
                      </div>

                      <h6 className={`fw-bold mb-1 ${isDarkMode ? 'text-light' : 'text-dark'}`}>{donor.name}</h6>
                      <p className={`${isDarkMode ? 'text-light' : 'text-secondary'} mb-2`}>
                        {donor.bloodgroup || 'Unknown Blood Group'}
                      </p>

                      <div className="mb-2 donation-badge" style={{ color: isDarkMode ? '#ffb3b3' : '#dc3545' }}>
                        🩸 {donor.numberOfDonations} Donation{donor.numberOfDonations !== 1 ? 's' : ''}
                      </div>

                      {donor.rating && (
                        <div className="mb-2 rating-container">
                          <div className="text-warning star-rating">
                            ⭐ {donor.rating.toFixed(1)} / 5
                          </div>
                          {donor.medal && (
                            <div
                              className={`medal medal-${donor.medal.toLowerCase()}`}
                              title={`${donor.medal} Medal`}
                              style={{ color: isDarkMode ? '#ffd700' : '#ffc107' }}
                            >
                              {donor.medal} Medal 🏅
                            </div>
                          )}
                        </div>
                      )}

                      {donor.verified && (
                        <div className="fw-semibold small verified-label" style={{ color: isDarkMode ? '#4ddb82' : '#28a745' }}>
                          ✅ Verified Donor
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <p className={`${isDarkMode ? 'text-light' : 'text-muted'} text-center`}>
                  No top donors to display yet.
                </p>
              )}
            </div>
          </Col>
        </Row>

        <section
          id="donation-process"
          className={`py-5 ${isDarkMode ? 'bg-dark text-white' : 'bg-light'}`}
          style={{ marginTop: "100px" }}
        >
          <Container>
            <h2
              className="text-center fw-bold mb-5 display-6"
              style={{ padding: "30px" }}
            >
              <span style={{ color: "red" }}>🩸</span> The Blood Donation Process
            </h2>

            <Row className="g-4 justify-content-center">
              {steps.map((step, idx) => (
                <Col key={idx} xs={12} md={6} lg={3} className="text-center">
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center mx-auto shadow mb-3 pulse-step ${isDarkMode ? 'bg-secondary' : 'bg-white'}`}
                    style={{ width: 80, height: 80 }}
                  >
                    {/* Force white icon in dark mode */}
                    <div style={{ color: isDarkMode ? '#fff' : '#212529', fontSize: 24 }}>
                      {step.icon}
                    </div>
                  </div>
                  <h5 className="fw-semibold">{step.title}</h5>
                  <p className={`small px-2 ${isDarkMode ? 'text-light' : 'text-muted'}`}>
                    {step.description}
                  </p>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        <section id="faq" className="py-5 bg-white border-top">
          <div className="container mx-auto px-4" style={{ marginTop: "50px" }}>
            <h2 className="text-3xl font-bold text-center mb-5 text-danger">🧐 Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative w-full flex items-center">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="faq-question w-full flex justify-center items-center px-4 pt-4 bg-gray-50 hover:bg-gray-100 transition text-base leading-tight font-semibold"
                      aria-expanded={openIndex === index}
                    >
                      <span className="text-center">{faq.question}</span>
                    </button>
                    <FaChevronDown
                      className={`absolute right-4 text-red-600 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
                        }`}
                    />
                  </div>

                  <div
                    className={`faq-answer px-4 pt-0 pb-4 text-gray-600 text-sm transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                      }`}
                  >
                    {faq.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROFILE MODAL */}
        <Modal
          show={showProfileModal}
          onHide={() => setShowProfileModal(false)}
          centered
          size="lg"
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold text-primary">Your Profile Details</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Row className="align-items-center">
              <Col md={4} className="text-center mb-3 mb-md-0">
                <img
                  src={donor.profileImage || '/images/default-avatar.png'}
                  alt="Profile"
                  className="rounded-circle border border-4 border-primary shadow-sm"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />


              </Col>
              <Col md={8}>
                <h4 className="fw-bold mb-3">{donor.name || 'N/A'}</h4>
                <Row>
                  <Col xs={6}><strong>Email:</strong> {donor.email || 'N/A'}</Col>
                  <Col xs={6}><strong>Phone:</strong> {donor.tel || 'N/A'}</Col>
                </Row>
                <Row className="mt-2">
                  <Col xs={6}><strong>Blood Group:</strong> {donor.bloodgroup || 'N/A'}</Col>
                  <Col xs={6}><strong>Age:</strong> {donor.age || 'N/A'}</Col>
                </Row>
                <Row className="mt-2">
                  <Col xs={6}><strong>Weight:</strong> {donor.weight ? `${donor.weight} kg` : 'N/A'}</Col>
                  <Col xs={6}><strong>Last Donation:</strong> {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'Never'}</Col>
                </Row>
                <Row className="mt-2">
                  <Col><strong>Address:</strong> {donor.address || 'N/A'}</Col>
                </Row>
                <Row className="mt-2">
                  <Col><strong>Compatible Recipients:</strong> {compatibilityMap[bloodGroup]?.join(', ') || 'N/A'}</Col>
                </Row>
              </Col>
            </Row>

            <ProgressBar
              now={profileCompleteness}
              label={`${profileCompleteness}% Complete`}
              className="mt-4"
              animated
              striped
              variant="primary"
              style={{ height: '20px', borderRadius: '10px' }}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowEditModal(true)}>Edit Profile</Button>
            <Button variant="secondary" onClick={() => setShowProfileModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>

        {/* --- COLLAPSIBLE PROFILE CARD --- */}
        {showProfileDetails && (
          <Row>
            <Col md={8}>
              <div className="profile-card mb-4 p-4 bg-white rounded shadow-sm animate-fade-in">
                <div className="d-flex flex-column flex-md-row align-items-center">
                  {donor.profileImage && (
                    <img
                      src={donor.profileImage || '/images/default-avatar.png'}
                      alt="Profile"
                      className="rounded-circle border border-4 border-primary shadow-sm"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />

                  )}
                  <div className="w-100">
                    <div><strong>Name:</strong> {donor.name || 'N/A'}</div>
                    <div><strong>Email:</strong> {donor.email || 'N/A'}</div>
                    <div><strong>Blood Group:</strong> {bloodGroup || 'N/A'}</div>
                    <div><strong>Phone:</strong> {donor.tel || 'N/A'}</div>
                    <div><strong>Address:</strong> {donor.address || 'N/A'}</div>
                    <div><strong>Age:</strong> {donor.age}</div>
                    <div><strong>Weight:</strong> {donor.weight} kg</div>
                    <div><strong>Last Donation:</strong> {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'Never'}</div>
                    <div><strong>Compatible Recipients:</strong> {compatibilityMap[bloodGroup]?.join(', ') || 'N/A'}</div>
                  </div>
                </div>

                <ProgressBar now={profileCompleteness} label={`${profileCompleteness}% Profile Complete`} className="mt-3" />

                <div className="d-flex justify-content-end mt-3">
                  <Button variant="outline-secondary" onClick={() => setShowEditModal(true)}>
                    Edit Profile
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        )}

        {/* --- DONATION STATUS CARD --- */}
        <Row id="status" style={{ marginTop: "120px", marginBottom: "60px" }}>
          <Col md={6}>
            <div className="donor-status-panel glass-effect shadow-lg p-4 rounded">
              <h5 className="title text-primary mb-3 d-inline-flex align-items-center"><FaTint className="me-2 text-danger" />Donation Status</h5>

              <div className="info-line">
                <strong>Donations:</strong> {donor.numberOfDonations}
              </div>
              <div className="info-line">
                <strong>Last Donation:</strong>{' '}
                {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'Never'}
              </div>
              <div className="info-line">
                <strong>Next Eligible:</strong>{' '}
                <span className="text-muted">{nextEligibleDate.toLocaleDateString()}</span>
              </div>

              {/* Eligibility */}
              <div className="mt-4">
                <h6 className="text-secondary">Eligibility Check</h6>
                <div className="d-flex">
                  {/* Left Side (50%) */}
                  <div style={{ flex: 1 }}>
                    <ul className="list-unstyled">
                      <li className="d-flex align-items-center mb-2">
                        <FaWeight style={{ marginRight: '10px' }} className="text-secondary" />
                        <span style={{ marginRight: '20px' }}>
                          Weight: <strong>{donor.weight} kg</strong>
                        </span>
                        <span className={`badge bg-${isEligibleByWeight ? 'success' : 'danger'}`}>
                          {isEligibleByWeight ? 'Eligible' : 'Too Low'}
                        </span>
                      </li>

                      <li className="d-flex align-items-center mb-2">
                        <FaBirthdayCake style={{ marginRight: '10px' }} className="text-secondary" />
                        <span style={{ marginRight: '20px' }}>
                          Age: <strong>{donor.age}</strong>
                        </span>
                        <span className={`badge bg-${isEligibleByAge ? 'success' : 'danger'}`}>
                          {isEligibleByAge ? 'Eligible' : 'Out of Range'}
                        </span>
                      </li>

                      <li className="d-flex align-items-center mb-2">
                        <FaClock style={{ marginRight: '10px' }} className="text-secondary" />
                        <span style={{ marginRight: '20px' }}>
                          Interval: <strong>{daysSinceLastDonation} days</strong>
                        </span>
                        <span className={`badge bg-${isEligibleByInterval ? 'success' : 'warning'}`}>
                          {isEligibleByInterval
                            ? 'Eligible'
                            : `Wait ${DONATION_INTERVAL_DAYS - daysSinceLastDonation} days`}
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Right Side (empty for now, or place other content here) */}
                  <div style={{ flex: 1 }}>

                  </div>
                </div>

              </div>

              <div className="mt-4">
                <Button
                  variant="success"
                  className="w-100 d-flex justify-content-center align-items-center gap-2 py-2 shadow-sm animate-donate-btn"
                  onClick={() => setShowDonationForm(true)}
                  title="Click to log a new donation"
                >
                  <FaHandHoldingHeart className="mb-1" />
                  Donate Now
                </Button>
              </div>
            </div>
          </Col>

          {/* --- BADGES AND QR CODE --- */}
          <Col md={6}>
            {/* 🏆 Header */}
            <h4 className="text-primary mb-4 text-center fw-bold">Achievements & QR Code</h4>

            {/* 🎖 Badges Section */}
            <section className="mb-4">
              <div className="d-flex flex-wrap justify-content-center gap-2">
                {badges.map(({ name, color }) => (
                  <span
                    key={name}
                    className={`badge bg-${color} px-3 py-2 text-uppercase`}
                    title={`Badge: ${name}`}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </section>

            <Row className='mb-5 mt-5'>
              <Col md={6}>
                <section className="text-center mb-3">
                  <div
                    ref={qrRef}
                    className={`d-inline-block p-2 border border-3 rounded-3 ${getQRBorderColor()}`}
                    title={`Donation Level: ${donationCount} time(s)`}
                    style={{
                      transition: 'border-color 0.3s ease-in-out',
                      backgroundColor: 'white',
                    }}
                  >
                    <QRCodeCanvas
                      value={JSON.stringify({
                        type: 'donorQR',
                        version: 1,
                        id: donor._id,
                        name: donor.name,
                        age: donor.age,
                        weight: donor.weight,
                        bloodgroup: donor.bloodgroup,
                        donations: donationCount,
                        lastDonationDate: donor.lastDonationDate
                          ? new Date(donor.lastDonationDate).toLocaleDateString()
                          : null,
                        nextEligibleDate: nextEligibleDate.toLocaleDateString(),
                        donationIntervalDays: daysSinceLastDonation,
                      })}
                      size={160}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  <div className="mt-3">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={handleDownloadQR}
                      disabled={!donor || !qrRef.current}
                    >
                      Download QR Code
                    </button>
                    <div className="text-muted mt-1 small">Scan to verify donor info securely</div>
                  </div>
                </section>
              </Col>

              <Col md={6}>
                <section className="mt-4">
                  <p className="fw-bold text-secondary mb-2 small">QR Color Legend:</p>
                  <ul className="list-unstyled text-muted small">
                    <li>🟢 <strong>Green:</strong> {donationCount} Donations</li>
                    <li>🔵 <strong>Blue:</strong> {donationCount} Donations</li>
                    <li>🟡 <strong>Yellow:</strong> {donationCount} Donations</li>
                    <li>⚪️ <strong>White:</strong> No donations yet</li>
                  </ul>
                </section>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* --- DONATION HISTORY BAR CHART --- */}
        <div className="full-width-section">
          <Row id="history" className="m-0 w-100">
            <Col xs={12} className="p-0">
              <section className={`donation-history-container ${isDarkMode ? 'dark' : 'light'}`}>
                <header className="donation-history-header d-flex justify-content-between align-items-center py-3 px-4">
                  <span className="fw-bold fs-5">🩸 Donation History Overview</span>
                  <small className="text-muted">Yearly + Monthly Insights</small>
                </header>

                <div className="donation-history-body px-4 py-4">
                  {donationHistory.length > 0 ? (
                    <>
                      {/* 📊 Bar Chart */}
                      <div className="chart-container" style={{ width: '100%', height: '300px' }}>
                        <Bar
                          ref={chartRef}
                          data={{
                            labels: years,
                            datasets: [
                              {
                                label: 'Donations',
                                data: years.map((y) => donationCountsByYear[y]),
                                backgroundColor: years.map((year) => {
                                  const count = donationCountsByYear[year];
                                  if (count >= 10) return '#f9c74f'; // Yellow
                                  if (count >= 5) return '#577590'; // Blue
                                  return '#f94144'; // Red
                                }),
                                borderRadius: 12,
                                borderSkipped: false,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              title: {
                                display: true,
                                text: 'Annual Donation Summary',
                                font: { size: 20, weight: 'bold' },
                                color: isDarkMode ? '#ffffff' : '#212529',
                              },
                              tooltip: {
                                backgroundColor: isDarkMode ? '#333' : '#fff',
                                bodyColor: isDarkMode ? '#f0f0f0' : '#000',
                                titleColor: isDarkMode ? '#ffffff' : '#000',
                                callbacks: {
                                  label: function (ctx) {
                                    const year = ctx.label;
                                    const count = ctx.raw;
                                    const seasonColors = {
                                      Spring: { months: ['Mar', 'Apr', 'May'], emoji: '🌱' },
                                      Summer: { months: ['Jun', 'Jul', 'Aug'], emoji: '☀️' },
                                      Autumn: { months: ['Sep', 'Oct', 'Nov'], emoji: '🍂' },
                                      Winter: { months: ['Dec', 'Jan', 'Feb'], emoji: '❄️' },
                                    };
                                    const monthsSet = donationMonthsByYear[year];
                                    if (!monthsSet) return `Year: ${year} | Donations: ${count}`;

                                    const sortedMonths = Array.from(monthsSet).sort(
                                      (a, b) => new Date(`${a} 1, 2000`) - new Date(`${b} 1, 2000`)
                                    );

                                    const grouped = Object.entries(seasonColors)
                                      .map(([season, { months, emoji }]) => {
                                        const present = months.filter((m) => sortedMonths.includes(m));
                                        return present.length ? `${emoji} ${present.join(', ')}` : null;
                                      })
                                      .filter(Boolean);

                                    return [`Year: ${year} | Donations: ${count}`, ...grouped];
                                  },
                                },
                              },
                            },
                            scales: {
                              x: {
                                ticks: { color: isDarkMode ? '#f0f0f0' : '#495057', font: { weight: '600' } },
                                grid: { color: isDarkMode ? '#444' : '#f1f3f5' },
                              },
                              y: {
                                beginAtZero: true,
                                ticks: { stepSize: 1, precision: 0, color: isDarkMode ? '#f0f0f0' : '#495057' },
                                title: {
                                  display: true,
                                  text: 'Total Donations',
                                  color: isDarkMode ? '#cccccc' : '#6c757d',
                                  font: { weight: 'bold' },
                                },
                                grid: { color: isDarkMode ? '#444' : '#f1f3f5' },
                              },
                            },
                          }}
                        />
                      </div>

                      <div className="text-end mt-3">
                        <Button variant="outline-secondary" size="sm" onClick={handleDownload}>
                          ⬇️ Download Chart as PNG
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted text-center">No donation history available yet.</p>
                  )}
                </div>
              </section>
            </Col>
          </Row>
        </div>

        {/* --- DONATION FORM MODAL --- */}
        <Modal show={showDonationForm} onHide={() => setShowDonationForm(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{isFirstTimeDonor ? 'First Time Donation' : 'Record New Donation'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleFirstDonation}>
            <Modal.Body>
              <Form.Group className="mb-3" controlId="donationDate">
                <Form.Label>Donation Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  required
                  onChange={handleDonationChange}
                  value={donationData.date}
                  max={new Date().toISOString().split('T')[0]}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="donationBloodGroup">
                <Form.Label>Blood Group</Form.Label>
                <Form.Control
                  as="select"
                  name="bloodgroup"
                  value={donationData.bloodgroup || donor.bloodgroup}
                  onChange={handleDonationChange}
                  required
                >
                  <option value="">Select Blood Group</option>
                  <option value="Unknown">Unknown</option> {/* ← Add this line */}
                  {Object.keys(compatibilityMap).map(bg => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3" controlId="donationAmount">
                <Form.Label>Amount (ml)</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  min={100}
                  required
                  value={donationData.amount}
                  onChange={handleDonationChange}
                  placeholder="Amount of blood donated in ml"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="donationDisease">
                <Form.Label>Disease (if any)</Form.Label>
                <Form.Control
                  type="text"
                  name="disease"
                  value={donationData.disease}
                  onChange={handleDonationChange}
                  placeholder="Mention any disease or 'None'"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="donationAge">
                <Form.Label>Age at Donation</Form.Label>
                <Form.Control
                  type="number"
                  name="age"
                  min={MIN_AGE}
                  max={MAX_AGE}
                  required
                  value={donationData.age}
                  onChange={handleDonationChange}
                  placeholder="Your age at donation time"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="donationWeight">
                <Form.Label>Weight (kg)</Form.Label>
                <Form.Control
                  type="number"
                  name="weight"
                  min={MIN_WEIGHT}
                  required
                  value={donationData.weight}
                  onChange={handleDonationChange}
                  placeholder="Your weight at donation time"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDonationForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isUpdating}>
                {isUpdating ? <Spinner animation="border" size="sm" /> : 'Submit Donation'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* EDIT PROFILE MODAL */}
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          size="lg"
          centered
          backdrop="static"
          keyboard={false}
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
                      className="form-input-shadow rounded-3"
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
                      className="form-input-shadow rounded-3"
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
                  className="form-input-shadow rounded-3"
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
                      className="form-input-shadow rounded-3"
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group controlId="editAge" className="mb-3">
                    <Form.Label className="fw-semibold">Age</Form.Label>
                    <Form.Control
                      type="number"
                      name="age"
                      value={editData.age}
                      onChange={handleProfileChange}
                      min={MIN_AGE}
                      max={MAX_AGE}
                      placeholder="Age"
                      className="form-input-shadow rounded-3"
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group controlId="editWeight" className="mb-3">
                    <Form.Label className="fw-semibold">Weight (kg)</Form.Label>
                    <Form.Control
                      type="number"
                      name="weight"
                      value={editData.weight}
                      onChange={handleProfileChange}
                      min={MIN_WEIGHT}
                      placeholder="Weight"
                      className="form-input-shadow rounded-3"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group controlId="editBloodGroup" className="mb-4">
                <Form.Label className="fw-semibold">Blood Group</Form.Label>
                <Form.Control
                  as="select"
                  name="bloodgroup"
                  value={editData.bloodgroup}
                  onChange={handleProfileChange}
                  className="form-input-shadow rounded-3"
                >
                  <option value="">Select Blood Group</option>
                  {Object.keys(compatibilityMap).map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="editProfileImage" className="mb-4">
                <Form.Label className="fw-semibold">Profile Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="form-input-shadow rounded-3"
                />

                {/* ✅ Place the image preview here */}
                <div className="mt-3 d-flex justify-content-center">
                  <img
                    src={
                      editData.profileImage instanceof File
                        ? URL.createObjectURL(editData.profileImage)
                        : editData.profileImage
                          ? (editData.profileImage.startsWith('http') ? editData.profileImage : `http://localhost:8000${editData.profileImage}`)
                          : '/images/default-avatar.png'
                    }
                    alt="Profile Preview"
                    className="profile-preview-img shadow-sm"
                    style={{ maxWidth: '150px', borderRadius: '50%' }}
                  />

                </div>
              </Form.Group>

            </Form>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0">
            <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleProfileSave} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : 'Save'}
            </Button>
          </Modal.Footer>
        </Modal>

      </Container >
    </div>
  );
};

export default DonorPage;