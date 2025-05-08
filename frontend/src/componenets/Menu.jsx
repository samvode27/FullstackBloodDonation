import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBox,
  FaCalendarAlt,
  FaChartBar,
  FaClipboard,
  FaCog,
  FaElementor,
  FaHdd,
  FaHome,
  FaUser,
  FaUsers,
  FaTint
} from "react-icons/fa";
import { MdLocalHospital } from "react-icons/md";

const Menu = () => {
  const [activeLink, setActiveLink] = useState("/admin");

  const handleActiveLink = (link) => {
    setActiveLink(link);
  };

  const getLinkClasses = (link) => 
    `list-group-item list-group-item-action d-flex align-items-center gap-2 ${
      activeLink === link ? "active bg-danger text-white border-danger" : ""
    }`;

  return (
    <div className="bg-light p-3" style={{ width: '280px', height: '110vh' }}>
      <div className="list-group">

        <Link to="/admin" onClick={() => handleActiveLink("/admin")} className={getLinkClasses("/admin")}>
          <FaHome /> Home
        </Link>

        <div className="list-group-item d-flex align-items-center gap-2">
          <FaUser className="text-danger" /> Profile
        </div>

        <hr />

        <Link to="/admin/donors" onClick={() => handleActiveLink("/admin/donors")} className={getLinkClasses("/admin/donors")}>
          <FaTint /> Donors
        </Link>

        <Link to="/admin/prospects" onClick={() => handleActiveLink("/admin/prospects")} className={getLinkClasses("/admin/prospects")}>
          <FaUsers /> Prospects
        </Link>

        <Link to="/admin/hospitals" onClick={() => handleActiveLink("/admin/hospitals")} className={getLinkClasses("/admin/hospitals")}>
          <MdLocalHospital /> Hospitals
        </Link>

        <hr />

        <div className="list-group-item d-flex align-items-center gap-2">
          <FaElementor className="text-danger" /> Elements
        </div>

        <div className="list-group-item d-flex align-items-center gap-2">
          <FaCog className="text-danger" /> Settings
        </div>

        <div className="list-group-item d-flex align-items-center gap-2">
          <FaHdd className="text-danger" /> Backups
        </div>

        <hr />

        <div className="list-group-item d-flex align-items-center gap-2">
          <FaChartBar className="text-danger" /> Charts
        </div>

        <div className="list-group-item d-flex align-items-center gap-2">
          <FaClipboard className="text-danger" /> All logs
        </div>

        <div className="list-group-item d-flex align-items-center gap-2">
          <FaCalendarAlt className="text-danger" /> Calendar
        </div>

      </div>
    </div>
  );
};

export default Menu;
