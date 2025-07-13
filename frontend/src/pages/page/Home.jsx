// src/pages/Home.jsx
import React, { useEffect, useRef, useState } from 'react';
import BloodCompatibility from './BloodCompatibility';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaTint, FaArrowRight } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import './Home.css';
import Sidebar from '../componenets/Sidebar';
import { adminRequest, publicRequest } from "../requestMethods";
import AOS from 'aos';
import 'aos/dist/aos.css';
import bloodImage from '../assets/a.jpg';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

const Home = () => {
  const navigate = useNavigate();
  const [donorCount, setDonorCount] = useState(0);
  const [donationsThisYear, setDonationsThisYear] = useState(0);
  const [livesSaved, setLivesSaved] = useState(0);
  const [status, setStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Comments",
    message: "",
  });

  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [campaigns, setCampaigns] = useState([]);

  const [pulsePhase, setPulsePhase] = useState(0);
  const [ripples, setRipples] = useState([]);

  // Animate pulse continuously
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 0.02) % (2 * Math.PI));
    }, 20);
    return () => clearInterval(interval);
  }, []);

  // Calculate scale and glow
  const pulseScale = 1 + Math.sin(pulsePhase) * 0.05;
  const pulseGlow = Math.abs(Math.sin(pulsePhase) * 0.4);

  // Handle click ripple
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples((prev) => [
      ...prev,
      {
        id: Date.now(),
        x,
        y,
        size: 0,
        opacity: 1,
      },
    ]);
    navigate("/donorlogin");
  };

  // Animate ripple growth and fade
  useEffect(() => {
    if (ripples.length > 0) {
      const animationFrame = requestAnimationFrame(() => {
        setRipples((prev) =>
          prev
            .map((ripple) => ({
              ...ripple,
              size: ripple.size + 4,
              opacity: ripple.opacity - 0.03,
            }))
            .filter((ripple) => ripple.opacity > 0)
        );
      });
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [ripples]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await adminRequest.get('/campaign');
        setCampaigns(res.data);
      } catch (err) {
        console.error('Failed to load campaigns', err);
        toast.error('Failed to load campaigns');
      }
    };
    fetchCampaigns();
  }, []);

  // Duplicate campaigns array for seamless looping animation
  const duplicatedCampaigns = [...campaigns, ...campaigns];
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const containerRef = useRef(null);
  const contentRef = useRef(null);

  // JavaScript-based horizontal scrolling
  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    let animationFrameId;
    let speed = 1; // pixels per frame
    let position = 0;

    const animate = () => {
      position -= speed;
      if (position <= -content.scrollWidth / 2) {
        position = 0;
      }
      content.style.transform = `translateX(${position}px)`;
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    container.addEventListener('mouseenter', () => cancelAnimationFrame(animationFrameId));
    container.addEventListener('mouseleave', () => {
      animationFrameId = requestAnimationFrame(animate);
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mouseenter', () => { });
      container.removeEventListener('mouseleave', () => { });
    };
  }, []);

  // Double the cards for smooth loop
  const loopedCampaigns = [...duplicatedCampaigns, ...duplicatedCampaigns];


  const handleSubscribe = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');

    try {
      const res = await publicRequest.post('/newsletter/subscribe', { email });
      setMsg(res.data.message);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  useEffect(() => {
    const fetchDonorCount = async () => {
      try {
        const res = await publicRequest.get("/donors/count"); // Adjust path if needed
        setDonorCount(res.data.count || 0);
      } catch (err) {
        console.error("Failed to fetch donor count:", err);
      }
    };

    const fetchDonationsThisYear = async () => {
      try {
        const res = await publicRequest.get("/donors/donations/yearly");
        const currentYear = new Date().getFullYear();
        const currentYearData = res.data.find(item => item.year === currentYear);
        setDonationsThisYear(currentYearData?.totalDonations || 0);
      } catch (err) {
        console.error("Failed to fetch donations this year:", err);
      }
    };

    fetchDonorCount();
    fetchDonationsThisYear();
    setLivesSaved(donationsThisYear * 3);
  }, [donationsThisYear]);

  useEffect(() => {
    const menuBtn = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    menuBtn?.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Counter animation
    function animateCounter(id, target, duration = 2000) {
      const el = document.getElementById(id);
      if (!el) return;
      let start = 0;
      const increment = target / (duration / 16);
      let current = start;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          clearInterval(timer);
          current = target;
        }
        el.textContent = Math.floor(current).toLocaleString();
      }, 16);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter('donors-counter', 12543);
          animateCounter('donations-counter', 38765);
          animateCounter('lives-counter', 116295);
          animateCounter('centers-counter', 27);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    const stats = document.querySelector('.stats-counter');
    if (stats) observer.observe(stats);

    // Blood type interaction
    const info = {
      'a+': { donateTo: ['A+', 'AB+'], receiveFrom: ['A+', 'A-', 'O+', 'O-'] },
      'a-': { donateTo: ['A+', 'A-', 'AB+', 'AB-'], receiveFrom: ['A-', 'O-'] },
      'b+': { donateTo: ['B+', 'AB+'], receiveFrom: ['B+', 'B-', 'O+', 'O-'] },
      'b-': { donateTo: ['B+', 'B-', 'AB+', 'AB-'], receiveFrom: ['B-', 'O-'] },
      'ab+': { donateTo: ['AB+'], receiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
      'ab-': { donateTo: ['AB+', 'AB-'], receiveFrom: ['A-', 'B-', 'AB-', 'O-'] },
      'o+': { donateTo: ['A+', 'B+', 'AB+', 'O+'], receiveFrom: ['O+', 'O-'] },
      'o-': { donateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], receiveFrom: ['O-'] }
    };

    const updateBloodTypes = (type) => {
      const donateEl = document.getElementById('donate-to');
      const receiveEl = document.getElementById('receive-from');
      if (!donateEl || !receiveEl) return;

      if (type === 'all') {
        donateEl.innerHTML = `<div class="col-span-2 text-center py-8"><i class="fas fa-info-circle text-3xl text-red-600 mb-4"></i><p class="text-gray-700">Select a blood type to see compatibility information</p></div>`;
        receiveEl.innerHTML = '';
        return;
      }

      const { donateTo, receiveFrom } = info[type];
      donateEl.innerHTML = donateTo.map(t => `<div class="bg-white p-3 rounded-lg text-center shadow-sm"><div class="text-2xl font-bold text-red-600">${t}</div></div>`).join('');
      receiveEl.innerHTML = receiveFrom.map(t => `<div class="bg-white p-3 rounded-lg text-center shadow-sm"><div class="text-2xl font-bold text-red-600">${t}</div></div>`).join('');
    };

    document.querySelectorAll('.blood-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.blood-type-btn').forEach(b => b.classList.remove('active', 'bg-red-600', 'text-white'));
        btn.classList.add('active', 'bg-red-600', 'text-white');
        const type = btn.getAttribute('data-type');
        updateBloodTypes(type);
      });
    });

    document.querySelector('.blood-type-btn[data-type="all"]')?.click();

    // Simulated map
    const initMap = () => {
      const map = document.getElementById('map');
      if (map) {
        map.innerHTML = `
      <div class="bg-gray-200 h-full flex items-center justify-center rounded-xl shadow-lg">
        <div class="text-center p-8">
          <i class="fas fa-map-marked-alt text-5xl text-red-600 mb-4"></i>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Blood Center Locations</h3>
          <p class="text-gray-600 mb-4">Interactive map showing all our blood donation centers across Ethiopia</p>
          <a
            href="https://www.google.com/maps/search/blood+donation+center+full+map+in+ethiopia/@8.9961327,38.7140907,12.32z?entry=ttu&g_ep=EgoyMDI1MDYxMS4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300 no-underline"
            style="text-decoration: none;"
          >
            View Full Map <i class="fas fa-external-link-alt ml-2"></i>
          </a>
        </div>
      </div>
    `;
      }
    };

    const mapObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          initMap();
          mapObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const mapSection = document.getElementById('centers');
    if (mapSection) mapObs.observe(mapSection);

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const el = document.querySelector(a.getAttribute('href'));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        if (!mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
        }
      });
    });
  }, []);

  const animateCounter = (id, target) => {
    let start = 0;
    const duration = 2000;
    const increment = Math.ceil(target / (duration / 30));
    const el = document.getElementById(id);

    const interval = setInterval(() => {
      start += increment;
      if (start >= target) {
        start = target;
        clearInterval(interval);
      }
      if (el) el.textContent = `+${start.toLocaleString()}`;
    }, 30);
  };

  useEffect(() => {
    if (donorCount > 0) { animateCounter('donors-counter', donorCount); }
    if (donationsThisYear > 0) { animateCounter('thisyear-counter', donationsThisYear); }
    if (livesSaved > 0) animateCounter('lives-counter', livesSaved);

    animateCounter('centers-counter', 43);
  }, [donorCount, donationsThisYear, livesSaved]);

  const bloodNeeds = [
    { type: 'A+', status: 'Critical Shortage', urgency: 'URGENT', level: 'critical' },
    { type: 'O-', status: 'Critical Shortage', urgency: 'URGENT', level: 'critical' },
    { type: 'B+', status: 'Low Supply', urgency: 'NEEDED', level: 'low' },
    { type: 'AB-', status: 'Low Supply', urgency: 'NEEDED', level: 'low' },
  ];

  const getStyles = (level) => {
    if (level === 'critical') {
      return {
        card: 'bg-red-100 text-red-700',
        badge: 'bg-red-600',
        icon: <FaExclamationTriangle className="text-red-600 text-xl mb-1" />,
      };
    }
    return {
      card: 'bg-yellow-100 text-yellow-700',
      badge: 'bg-yellow-500',
      icon: <FaTint className="text-yellow-600 text-xl mb-1" />,
    };
  };

  const BloodNeedCard = ({ type, status, urgency, level, animation, animationDelay }) => {
    const { card, badge, icon } = getStyles(level);

    return (
      <div
        className={`p-8 rounded-2xl text-center shadow-lg transition-transform hover:-translate-y-1 ${card}`}
        data-aos={animation}
        data-aos-delay={animationDelay}
        data-aos-duration="800"
        data-aos-easing="ease-in-out"
      >
        {icon}
        <div className="text-4xl font-black mb-1 tracking-tight">{type}</div>
        <div className="text-sm font-medium mb-2">{status}</div>
        <div className="mt-1">
          <span
            className={`inline-block ${badge} text-white px-3 py-1 rounded-full text-xs font-bold animate-bounce`}
          >
            {urgency}
          </span>
        </div>
        <button
          className="mt-4 inline-flex items-center text-sm font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-full shadow-md transition-all"
          onClick={() => navigate("/donorlogin")}
        >
          Donate Now <FaArrowRight className="ml-2" />
        </button>
      </div>
    );
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      const res = await publicRequest.post("/contact", formData);
      setStatus({ type: "success", message: res.data.message });
      setFormData({ name: "", email: "", subject: "Comments", message: "" });
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.error || "Something went wrong. Try again later.",
      });
    }
  };

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <>
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex justify-between h-16">
              <div className="flex items-center gap-3 animate-fade-in">
                <div
                  onClick={() => navigate('/')}
                  className="cursor-pointer flex-shrink-0 flex items-center bg-red-100 p-2 rounded-full shadow-sm hover:scale-105 transition-transform duration-300"
                  title="Go to homepage"
                >
                  <i className="fas fa-tint text-red-600 text-3xl"></i>
                </div>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-2xl font-extrabold text-red-600 tracking-wide">EthioLife</span>
                <span className="text-xs text-gray-500 italic">Ethiopian Blood Bank System</span>
              </div>
            </div>

            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-2 lg:space-x-4 animate-fade-in">
              <a href="#home" className="text-gray-900 hover:text-red-600 px-2.5 py-2 text-sm font-medium tracking-tight rounded-lg hover:bg-red-100 transition-all duration-300 no-underline">Home</a>
              <a href="#about" className="text-gray-900 hover:text-red-600 px-2.5 py-2 text-sm font-medium tracking-tight rounded-lg hover:bg-red-100 transition-all duration-300 no-underline">About</a>
              <a href="#donate" className="text-gray-900 hover:text-red-600 px-2.5 py-2 text-sm font-medium tracking-tight rounded-lg hover:bg-red-100 transition-all duration-300 no-underline">Donate</a>
              <a href="#find" className="text-gray-900 hover:text-red-600 px-2.5 py-2 text-sm font-medium tracking-tight rounded-lg hover:bg-red-100 transition-all duration-300 no-underline">Find Blood</a>
              <a href="#centers" className="text-gray-900 hover:text-red-600 px-2.5 py-2 text-sm font-medium tracking-tight rounded-lg hover:bg-red-100 transition-all duration-300 no-underline">Centers</a>
              <a href="#contact" className="text-gray-900 hover:text-red-600 px-2.5 py-2 text-sm font-medium tracking-tight rounded-lg hover:bg-red-100 transition-all duration-300 no-underline">Contact</a>

              <button
                onClick={() => navigate('/adminlogin')}
                className="bg-white text-gray-800 flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium tracking-tight border border-gray-300 shadow-sm transition-all duration-300 hover:bg-red-800 hover:text-red-600 hover:shadow-lg hover:-translate-y-0.5"
              >
                <i className="fas fa-user-shield text-red-500"></i> Admin
              </button>

              <button
                onClick={() => navigate('/hospitallogin')}
                className="bg-white text-gray-800 flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium tracking-tight border border-gray-300 shadow-sm transition-all duration-300 hover:bg-red-800 hover:text-red-600 hover:shadow-lg hover:-translate-y-0.5"
              >
                <i className="fas fa-hospital-user text-red-500"></i> Hospital
              </button>
            </div>
            <div className="-mr-2 flex items-center md:hidden">
              <button type="button" id="mobile-menu-button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none">
                <i className="fas fa-bars"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="hidden md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            <a href="#home" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-red-600">Home</a>
            <a href="#about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-red-600">About</a>
            <a href="#donate" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-red-600">Donate</a>
            <a href="#find" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-red-600">Find Blood</a>
            <a href="#centers" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-red-600">Centers</a>
            <a href="#contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-red-600">Contact</a>
            <button className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700">
              Emergency <i className="fas fa-phone ml-1"></i>
            </button>
          </div>
        </div>
      </nav >

      {/* The remaining sections of the page */}
      <section
        id="home"
        className="relative text-white py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(139, 0, 0, 0.6), rgba(139, 0, 0, 0.6)),
            url('https://images.unsplash.com/photo-1496346651079-6ca5cb67f42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')
           `,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            {/* Left Text Content */}
            <div
              className="md:w-1/2 mb-10 md:mb-0"
              data-aos="fade-right"
              data-aos-duration="1000"
              data-aos-easing="ease-in-out"
            >
              <h1
                className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
                data-aos="zoom-in"
                data-aos-delay="300"
              >
                Every Drop Counts <span className="blood-drop">💉</span> Save a Life Today
              </h1>
              <p className="text-xl mb-8" data-aos="fade-up" data-aos-delay="400">
                EthioLife connects blood donors with recipients across Ethiopia. Join our
                network of lifesavers and help bridge the gap between blood supply and demand.
              </p>

              <div
                className="space-y-4 sm:space-y-0 sm:space-x-4 items-center justify-center mt-6"
                data-aos="fade-up"
                data-aos-delay="600"
              >
                <button
                  className="flex justify-center items-center gap-2 bg-red-600 text-white-600 px-6 py-3 rounded-full font-bold shadow-md hover:bg-gray-100 hover:text-red-600 hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
                  onClick={() => navigate('/donorlogin')}
                  data-aos="zoom-in"
                  data-aos-delay="700"
                >
                  <i className="fas fa-heart animate-pulse text-red-500"></i>
                  Become a Donor
                </button>
              </div>
            </div>

            {/* Right Image Content */}
            <div
              className="md:w-1/2 flex justify-center"
              data-aos="fade-left"
              data-aos-duration="1000"
              data-aos-easing="ease-in-out"
            >
              <div className="relative">
                <div
                  className="bg-white rounded-full p-4 shadow-xl"
                  data-aos="zoom-in"
                  data-aos-delay="1000"
                >
                  <img
                    src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80"
                    alt="Blood donation"
                    className="w-80 h-80 object-cover rounded-full border-4 border-red-200"
                  />
                </div>

                <div
                  className="absolute -bottom-5 -left-5 bg-red-500 text-white p-4 rounded-full shadow-lg"
                  data-aos="flip-left"
                  data-aos-delay="1100"
                >
                  <i className="fas fa-tint text-3xl"></i>
                </div>

                <div
                  className="absolute -top-5 -right-5 bg-yellow-400 text-white p-4 rounded-full shadow-lg"
                  data-aos="flip-right"
                  data-aos-delay="1200"
                >
                  <i className="fas fa-heartbeat text-3xl"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* data */}
      <section className="py-5 bg-light">
        <div className="container mt-5">
          <div className="row text-center g-4">

            {/* Registered Donors */}
            <div
              className="col-12 col-md-6 col-lg-3"
              data-aos="fade-right"
              data-aos-delay="100"
            >
              <div className="card shadow-sm border-0 h-100 rounded-lg hover:shadow-lg transition-shadow duration-300 hover:scale-[1.05] cursor-pointer relative overflow-hidden bg-white">
                <div className="absolute inset-0 rounded-lg bg-red-100 opacity-0 hover:opacity-30 transition-opacity duration-500 pointer-events-none"></div>
                <div className="card-body position-relative">
                  <div
                    className="text-danger fs-1 fw-bold"
                    id="donors-counter"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    +{donorCount}
                  </div>
                  <div className="text-muted d-flex justify-content-center align-items-center gap-2 mt-2 transition-colors duration-300 hover:text-red-600">
                    <i className="fas fa-users text-danger fs-4 transition-transform duration-300 hover:scale-110"></i>
                    <span className="font-semibold tracking-wide">Registered Donors</span>
                  </div>
                </div>
                <div className="position-absolute bottom-3 end-3 text-red-400 animate-pulse opacity-50">
                  <i className="fas fa-user-check fs-5"></i>
                </div>
              </div>
            </div>

            {/* Donations This Year */}
            <div
              className="col-12 col-md-6 col-lg-3"
              data-aos="fade-left"
              data-aos-delay="200"
            >
              <div className="card shadow-sm border-0 h-100 rounded-lg hover:shadow-lg transition-shadow duration-300 hover:scale-[1.05] cursor-pointer relative overflow-hidden bg-white">
                <div className="absolute inset-0 rounded-lg bg-red-100 opacity-0 hover:opacity-30 transition-opacity duration-500 pointer-events-none"></div>
                <div className="card-body position-relative">
                  <div
                    className="text-danger fs-1 fw-bold"
                    id="donations-counter"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    +{donationsThisYear}
                  </div>
                  <div className="text-muted d-flex justify-content-center align-items-center gap-2 mt-2 transition-colors duration-300 hover:text-red-600">
                    <i className="fas fa-tint text-danger fs-4 transition-transform duration-300 hover:scale-110"></i>
                    <span className="font-semibold tracking-wide">Donations This Year</span>
                  </div>
                </div>
                <div className="position-absolute bottom-3 end-3 text-red-400 animate-pulse opacity-50">
                  <i className="fas fa-hand-holding-water fs-5"></i>
                </div>
              </div>
            </div>

            {/* Lives Saved */}
            <div
              className="col-12 col-md-6 col-lg-3"
              data-aos="zoom-in"
              data-aos-delay="300"
            >
              <div className="card shadow-sm border-0 h-100 rounded-lg hover:shadow-lg transition-shadow duration-300 hover:scale-[1.05] cursor-pointer relative overflow-hidden bg-white">
                <div className="absolute inset-0 rounded-lg bg-red-100 opacity-0 hover:opacity-30 transition-opacity duration-500 pointer-events-none"></div>
                <div className="card-body position-relative">
                  <div
                    className="text-danger fs-1 fw-bold"
                    id="lives-counter"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    +0 {/* Will animate */}
                  </div>
                  <div className="text-muted d-flex justify-content-center align-items-center gap-2 mt-2 transition-colors duration-300 hover:text-red-600">
                    <i className="fas fa-heartbeat text-danger fs-4 transition-transform duration-300 hover:scale-110"></i>
                    <span className="font-semibold tracking-wide">Lives Saved</span>
                  </div>
                </div>
                <div className="position-absolute bottom-3 end-3 text-red-400 animate-pulse opacity-50">
                  <i className="fas fa-lungs fs-5"></i>
                </div>
              </div>
            </div>

            {/* Blood Centers */}
            <div
              className="col-12 col-md-6 col-lg-3"
              data-aos="flip-left"
              data-aos-delay="400"
            >
              <div className="card shadow-sm border-0 h-100 rounded-lg hover:shadow-lg transition-shadow duration-300 hover:scale-[1.05] cursor-pointer relative overflow-hidden bg-white">
                <div className="absolute inset-0 rounded-lg bg-red-100 opacity-0 hover:opacity-30 transition-opacity duration-500 pointer-events-none"></div>
                <div className="card-body position-relative">
                  <div
                    className="text-danger fs-1 fw-bold"
                    id="centers-counter"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    +0
                  </div>
                  <div className="text-muted d-flex justify-content-center align-items-center gap-2 mt-2 transition-colors duration-300 hover:text-red-600">
                    <i className="fas fa-clinic-medical text-danger fs-4 transition-transform duration-300 hover:scale-110"></i>
                    <span className="font-semibold tracking-wide">Blood Centers</span>
                  </div>
                </div>
                <div className="position-absolute bottom-3 end-3 text-red-400 animate-pulse opacity-50">
                  <i className="fas fa-clinic-medical fs-5"></i>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Why Blood Donation Matters in Ethiopia */}
      <section id="about" className="py-20 bg-gray-50" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Heading */}
          <div className="text-center mb-16" data-aos="fade-up" data-aos-delay="100">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Blood Donation Matters in Ethiopia
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto rounded-full"></div>
          </div>

          {/* Content Flex Container */}
          <div className="flex flex-col md:flex-row items-center">

            {/* Left Text Content */}
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10" data-aos="fade-right" data-aos-delay="200">
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <p className="text-gray-700 mb-6">
                  Ethiopia faces a chronic blood shortage with only 40% of the required blood supply available annually. Every day, patients in need of blood transfusions face life-threatening situations due to this shortage.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-red-100 p-2 rounded-full mr-4">
                      <i className="fas fa-heart text-red-600"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Maternal Health</h4>
                      <p className="text-gray-600">
                        25% of maternal deaths in Ethiopia are related to blood loss during childbirth.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-red-100 p-2 rounded-full mr-4">
                      <i className="fas fa-ambulance text-red-600"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Accidents & Trauma</h4>
                      <p className="text-gray-600">
                        Road accidents claim thousands of lives annually where blood could save many.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-red-100 p-2 rounded-full mr-4">
                      <i className="fas fa-child text-red-600"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Child Health</h4>
                      <p className="text-gray-600">
                        Children with severe anemia from malaria often require urgent blood transfusions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image Content */}
            <div className="md:w-1/2" data-aos="fade-left" data-aos-delay="300">
              <div className="relative group">
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                  alt="Blood donation in Ethiopia"
                  className="rounded-xl shadow-lg w-full h-auto transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute -bottom-5 -right-5 bg-white p-6 rounded-xl shadow-lg transition-transform duration-300 group-hover:translate-y-[-5px] group-hover:translate-x-[5px]"
                  data-aos="fade-up"
                  data-aos-delay="400"
                >
                  <div className="text-red-600 text-4xl mb-2">
                    <i className="fas fa-hands-helping"></i>
                  </div>
                  <h4 className="font-bold text-gray-900">Community Impact</h4>
                  <p className="text-gray-600">Your donation can save up to 3 lives</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* compatibility */}
      <section className="pt-20 pb-1 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden" data-aos="fade-up">
        <div className="absolute top-0 left-0 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-30 -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-red-200 rounded-full blur-2xl opacity-20 -z-10 animate-ping"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up" data-aos-delay="100">
            <h2 className="text-4xl font-extrabold text-gray-900">
              Blood Type <span className="text-red-600">Compatibility</span>
            </h2>
            <p className="text-lg text-gray-600 mt-2">
              Know who you can donate to and receive from — <span className="text-red-500 font-medium">save lives</span>.
            </p>
            <div className="w-24 h-1 bg-red-600 mx-auto mt-4 rounded-full animate-pulse"></div>
          </div>

          <div
            className="hover:scale-[1.01] transition-transform duration-300 pt-3"
            data-aos="zoom-in"
            data-aos-delay="200"
          >
            <BloodCompatibility />
          </div>
        </div>
      </section >

      {/* Ready to Donate */}
      <section section id="donate" className="py-20 bg-white" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up" data-aos-duration="1000">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Ready to <span className="text-red-600">Donate?</span>
            </h2>
            <p className="text-lg sm:text-md text-gray-600 max-w-3xl mx-auto">
              Join thousands of Ethiopians who donate blood regularly. The process is safe,
              simple, and <span className="text-red-500 font-semibold">saves lives</span>.
            </p>
            <div className="w-24 h-1 bg-red-600 mx-auto mt-4 rounded-full animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Step 1 */}
            <div
              className="group bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white"
              data-aos="fade-right"
              data-aos-delay="200"
              data-aos-duration="800"
            >
              <div className="text-red-600 text-4xl mb-4 transition-transform duration-300 group-hover:scale-110">
                <i className="fas fa-clipboard-check"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">1. Check Eligibility</h3>
              <p className="text-gray-600 leading-relaxed">
                You must be 18–65 years old, weigh at least 50kg, and be in good health.
                Avoid tattoos or piercings within the last 6 months.
              </p>
            </div>

            {/* Step 2 */}
            <div
              className="group bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white"
              data-aos="fade-up"
              data-aos-delay="400"
              data-aos-duration="800"
            >
              <div className="text-red-600 text-4xl mb-4 transition-transform duration-300 group-hover:scale-110">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">2. Find a Center</h3>
              <p className="text-gray-600 leading-relaxed">
                Locate the nearest blood donation center. We have <strong>43+ centers</strong> across Ethiopia with trained and welcoming staff.
              </p>
            </div>

            {/* Step 3 */}
            <div
              className="group bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white"
              data-aos="fade-left"
              data-aos-delay="600"
              data-aos-duration="800"
            >
              <div className="text-red-600 text-4xl mb-4 transition-transform duration-300 group-hover:scale-110">
                <i className="fas fa-heartbeat"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">3. Donate & Save Lives</h3>
              <p className="text-gray-600 leading-relaxed">
                The donation takes only 10 minutes. You’ll receive refreshments and can donate again every <strong>2 months</strong>.
              </p>
            </div>
          </div>
        </div>
      </section >

      <div className="relative overflow-hidden" style={{ paddingBottom: "40px" }}>
        <h2 className="text-3xl font-bold mb-6 text-center text-red-600">
          Current Blood Donation Campaigns
        </h2>
        <div className="w-20 h-1 bg-gray-600 mx-auto rounded-full"></div>

        <div ref={containerRef} className="relative h-[400px] w-full" style={{ marginTop: '100px' }}>
          <div
            ref={contentRef}
            className="absolute top-0 left-0 flex items-center h-full"
            style={{ willChange: 'transform' }}
          >
            {loopedCampaigns.map(({ _id, title, description, date, imageUrl }, index) => (
              <div
                key={`${_id}-${index}`}
                className="flex-shrink-0 mx-4 w-80 bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <div className="h-40 overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={`http://localhost:8000/uploads/${imageUrl}`}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 italic">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-red-700 mb-1">{title}</h3>
                  <p className="text-gray-600 text-sm">
                    {description.split(' ').length > 20
                      ? description.split(' ').slice(0, 30).join(' ') + '...'
                      : description
                    }
                  </p>
                  {description.split(' ').length > 30 && (
                    <button
                      onClick={() =>
                        setSelectedCampaign({ title, description, date, imageUrl })
                      }
                      className="text-red-600 text-xs mt-1 hover:underline"
                    >
                      Read more
                    </button>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(date).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => navigate('/donorlogin')}
                      className="animate-gradient animate-float animate-glow-ring bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white text-sm px-4 py-1 rounded-full shadow-md hover:scale-110 hover:shadow-xl transform transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 tracking-wide">
                      Donate Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal */}
        {selectedCampaign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto flex justify-center px-4 py-10">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative animate-fadeIn">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="absolute top-2 right-3 text-gray-600 hover:text-red-600 text-xl font-bold"
              >
                &times;
              </button>

              {selectedCampaign.imageUrl ? (
                <img
                  src={`http://localhost:8000/uploads/${selectedCampaign.imageUrl}`}
                  alt={selectedCampaign.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 italic mb-4">
                  No Image
                </div>
              )}

              <h3 className="text-xl font-bold text-red-700 mb-2">{selectedCampaign.title}</h3>
              <p className="text-gray-700 mb-3">{selectedCampaign.description}</p>
              <p className="text-sm text-gray-500 mb-4">
                Date: {new Date(selectedCampaign.date).toLocaleDateString()}
              </p>
              <button
                onClick={() => {
                  setSelectedCampaign(null);
                  navigate('/donorlogin');
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full w-full transition-all"
              >
                Donate Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Urgent Blood Needs */}
      <section id="find" className="py-20 bg-gradient-to-b from-white to-red-50 relative overflow-hidden">
        {/* Decorative Blobs */}
        < div className="absolute top-0 left-0 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-30 -z-10 animate-pulse" >
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-red-200 rounded-full blur-2xl opacity-20 -z-10 animate-ping"></div>

          <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-1">
            {/* Section Header */}
            <div
              className="text-center mb-16"
              data-aos="fade-down"
              data-aos-duration="1000"
              data-aos-easing="ease-in-out"
            >
              <h2
                className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4"
                data-aos="fade-right"
                data-aos-delay="200"
              >
                🩸 Urgent <span className="text-red-600">Blood Needs</span>
              </h2>
              <p
                className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto"
                data-aos="fade-left"
                data-aos-delay="400"
              >
                Some blood types are in{" "}
                <span className="text-red-500 font-semibold">critical demand</span> across Ethiopia.
              </p>
              <div
                className="w-24 h-1 bg-red-600 mx-auto mt-4 rounded-full animate-pulse"
                data-aos="zoom-in"
                data-aos-delay="600"
              ></div>
            </div>

            {/* Blood Cards Grid */}
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-easing="ease-in-out"
            >
              {bloodNeeds.map((blood) => (
                <BloodNeedCard key={blood.type} {...blood} />
              ))}
            </div>
          </div>
        </div>
      </section >

      {/* maps */}
      < section id="centers" className="py-20 bg-white" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header with Scroll Animation */}
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Find a Blood Center</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Locate our blood donation centers across Ethiopia.
            </p>
            <div className="w-20 h-1 bg-red-600 mx-auto mt-4"></div>
          </div>

          {/* Map Box with Scroll Animation */}
          <div className="mb-12" data-aos="fade-up">
            <div id="map" className="h-64 w-full bg-gray-100 rounded shadow-inner"></div>
          </div>

          {/* Cards Container */}
          <div className="container py-5">
            <div className="row g-4">

              {/* National Blood Bank Service */}
              <div className="col-md-6 col-lg-3" data-aos="zoom-in">
                <div className="card shadow-sm border-0 h-100 hover:shadow-lg transition-shadow duration-300 rounded-lg">
                  <div className="card-body">
                    <h5 className="card-title text-danger fw-bold">National Blood Bank</h5>
                    <p className="text-muted mb-2"><i className="fas fa-map-marker-alt me-2 text-danger"></i>Lideta, Addis Ababa</p>
                    <p className="text-muted mb-2"><i className="fas fa-clock me-2 text-secondary"></i>08:30–20:00 daily</p>
                    <p className="text-muted small">Main donation center under Ministry of Health</p>
                  </div>
                  <div className="card-footer bg-transparent border-0">
                    <a
                      href="https://mapcarta.com/W712340958"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-danger btn-sm w-100"
                    >
                      Get Directions <i className="fas fa-directions ms-1"></i>
                    </a>
                  </div>
                </div>
              </div>

              {/* Somali Regional State Blood Bank */}
              <div className="col-md-6 col-lg-3" data-aos="zoom-in" data-aos-delay="100">
                <div className="card shadow-sm border-0 h-100 hover:shadow-lg transition-shadow duration-300 rounded-lg">
                  <div className="card-body">
                    <h5 className="card-title text-danger fw-bold">Somali Region Blood Bank</h5>
                    <p className="text-muted mb-2"><i className="fas fa-map-marker-alt me-2 text-danger"></i>Jijiga, Somali Region</p>
                    <p className="text-muted mb-2"><i className="fas fa-hospital me-2 text-secondary"></i>Jigjiga Referral Hospital</p>
                    <p className="text-muted small">Primary blood bank for the region</p>
                  </div>
                  <div className="card-footer bg-transparent border-0">
                    <a
                      href="https://www.google.com/maps/search/Somali+Regional+State+Blood+Bank%2C+Jijiga"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-danger btn-sm w-100"
                    >
                      Get Directions <i className="fas fa-directions ms-1"></i>
                    </a>
                  </div>
                </div>
              </div>

              {/* Ethiopian Red Cross Society – Arba Minch */}
              <div className="col-md-6 col-lg-3" data-aos="zoom-in" data-aos-delay="200">
                <div className="card shadow-sm border-0 h-100 hover:shadow-lg transition-shadow duration-300 rounded-lg">
                  <div className="card-body">
                    <h5 className="card-title text-danger fw-bold">Red Cross – Arba Minch</h5>
                    <p className="text-muted mb-2"><i className="fas fa-map-marker-alt me-2 text-danger"></i>Arba Minch, SNNPR</p>
                    <p className="text-muted mb-2"><i className="fas fa-hand-holding-heart me-2 text-secondary"></i>Community-based collection</p>
                    <p className="text-muted small">Local branch for donor campaigns</p>
                  </div>
                  <div className="card-footer bg-transparent border-0">
                    <a
                      href="https://www.google.com/maps/search/Ethiopian+Red+Cross+Society%2C+Arba+Minch"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-danger btn-sm w-100"
                    >
                      Get Directions <i className="fas fa-directions ms-1"></i>
                    </a>
                  </div>
                </div>
              </div>

              {/* Additional Regional Branches */}
              <div className="col-md-6 col-lg-3" data-aos="zoom-in" data-aos-delay="300">
                <div className="card shadow-sm border-0 h-100 hover:shadow-lg transition-shadow duration-300 rounded-lg">
                  <div className="card-body">
                    <h5 className="card-title text-danger fw-bold">Other Regional Banks</h5>
                    <ul className="list-unstyled text-muted small">
                      <li><i className="fas fa-map-pin me-2 text-secondary"></i>Adama – Tel: 022 112 8441</li>
                      <li><i className="fas fa-map-pin me-2 text-secondary"></i>Bahirdar – Tel: 058 220 7515</li>
                      <li><i className="fas fa-map-pin me-2 text-secondary"></i>Mekele – Tel: 8040</li>
                      <li><i className="fas fa-map-pin me-2 text-secondary"></i>Also in Harar, Hawasa, Jimma…</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </ section>

      {/* message */}
      < section id="contact" className="py-5 bg-[#f7f7f9]" >
        <div className="container px-4">
          {/* Section Heading */}
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark display-6">Get In Touch</h2>
            <p className="text-muted text-lg text-gray-100">Have questions? Reach out to our team — we're always here to help.</p>
            <div className="mx-auto mt-3 rounded" style={{ width: '80px', height: '4px', background: 'linear-gradient(to right, #e53935, #e35d5b)' }}></div>
          </div>

          <div className="row align-items-center">
            {/* Thematic Image */}
            <div className="col-md-6 mb-4 mb-md-0" data-aos="fade-right">
              <img
                src={bloodImage}
                alt="Blood donation in Africa"
                className="img-fluid rounded shadow"
              />

              <p className="text-center mt-2 text-muted small">Blood donation saves lives — Be a hero in your community.</p>
            </div>

            {/* Contact Form */}
            <div className="col-md-6" data-aos="fade-left">
              <div className="bg-white p-4 rounded shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-center text-red-600">🩸 Contact Us</h2>

                {status && (
                  <div
                    className={`p-2 text-sm rounded mb-3 ${status.type === "success"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {status.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <select
                    name="subject"
                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                    value={formData.subject}
                    onChange={handleChange}
                  >
                    <option>Partnership</option>
                    <option>Volunteering</option>
                    <option>Comments</option>
                    <option>Others</option>
                  </select>
                  <textarea
                    name="message"
                    placeholder="Your Message"
                    rows="4"
                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                  <button
                    type="submit"
                    className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </ section>

      <footer className="bg-dark text-white" style={{ paddingTop: '50px', paddingBottom: "20px" }} data-aos="fade-up">
        <div className="container-fluid p-5">
          <div className="row g-4">

            {/* Brand */}
            <div className="col-12 col-md-6 col-lg-3" data-aos="fade-right">
              <div className="d-flex align-items-center mb-3">
                <i className="fas fa-tint text-danger fs-3 me-3 animate-pulse"></i>
                <span className="fs-4 fw-bold tracking-wide">EthioLife</span>
              </div>
              <p className="text-secondary">
                Connecting blood donors with recipients across Ethiopia to save lives and build healthier communities.
              </p>
            </div>

            {/* Blood Donation Facts */}
            <div className="col-12 col-md-6 col-lg-3" data-aos="fade-up">
              <h4 className="h5 fw-semibold mb-3 border-bottom border-danger pb-1 d-inline-block">Did You Know?</h4>
              <ul className="list-unstyled text-secondary">
                <li>🩸 Every 2 seconds someone needs blood.</li>
                <li>🩸 One donation can save up to 3 lives.</li>
                <li>🩸 Blood donation is safe and simple.</li>
                <li>🩸 Healthy adults can donate every 56 days.</li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="col-12 col-md-6 col-lg-3" data-aos="fade-up">
              <h4 className="h5 fw-semibold mb-3 border-bottom border-danger pb-1 d-inline-block">Quick Links</h4>
              <ul className="list-unstyled">
                {["home", "about", "donate", "find", "centers"].map(section => (
                  <li key={section} className="d-flex align-items-center mb-2">
                    <ChevronRightIcon className="me-2 text-danger" style={{ width: '1rem', height: '1rem' }} />
                    <a
                      href={`#${section}`}
                      className="text-secondary text-decoration-none hover-danger"
                    >
                      {section.charAt(0).toUpperCase() + section.slice(1).replace('-', ' ')}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="col-12 col-md-6 col-lg-3" data-aos="fade-left">
              <h4 className="h5 fw-semibold mb-3 border-bottom border-danger pb-1 d-inline-block">Stay Updated</h4>
              <p className="text-secondary mb-3">Subscribe to our newsletter</p>
              <form onSubmit={handleSubscribe} className="d-flex flex-column flex-sm-row gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="form-control"
                />
                <button type="submit" className="btn btn-danger text-white">
                  Subscribe
                </button>
              </form>
              {msg && <p className="text-success small mt-2">{msg}</p>}
              {error && <p className="text-danger small mt-2">{error}</p>}
            </div>
          </div>

          {/* Bottom Section */}
          <div
            className="border-top border-secondary mt-4 pt-3 d-flex flex-column flex-md-row justify-content-center align-items-center text-secondary small"
            data-aos="fade-up"
          >
            <p className="mb-2 mb-md-0">© 2023 EthioLife Blood Bank. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition duration-300 animate-bounce">
          <i className="fas fa-tint text-2xl"></i>
        </button>
      </div>
    </>
  );
};


export default Home;
