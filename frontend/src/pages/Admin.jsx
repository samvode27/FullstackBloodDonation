import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import {
  Droplet, Users, Hospital, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { publicRequest } from '../requestMethods'; // Adjust path if needed
import './Admin.css';

const Admin = () => {
  const [bloodStats, setBloodStats] = useState([]);
  const [topDonors, setTopDonors] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [summary, setSummary] = useState({
    donors: 0,
    hospitals: 0,
    requests: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        bloodRes,
        reqsRes,
        topRes,
        donorCountRes,
        hospitalCountRes
      ] = await Promise.all([
        publicRequest.get('/donors/stats'),
        publicRequest.get('/blood'),
        publicRequest.get('/donors/top'),
        publicRequest.get('/donors/count'),
        publicRequest.get('/hospitals/count'),
      ]);

      const requestsData = Array.isArray(reqsRes.data) ? reqsRes.data : [];
      const bloodData = Array.isArray(bloodRes.data) ? bloodRes.data : [];
      const topDonorData = Array.isArray(topRes.data?.topDonors) ? topRes.data.topDonors : [];
      const donorCount = Number(donorCountRes?.data?.count) || 0;
      const hospitalCount = Number(hospitalCountRes?.data?.count) || 0;

      setBloodStats(bloodData);
      setAllRequests(requestsData);
      setTopDonors(topDonorData);
      setSummary({
        donors: donorCount,
        hospitals: hospitalCount,
        requests: requestsData.length,
        approved: requestsData.filter(r => r.status === 'Approved').length,
        rejected: requestsData.filter(r => r.status === 'Rejected').length,
      });
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
    }
  };


  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Admin Dashboard</h2>

      <div className="summary-cards">
        <div className="card bg-primary text-white">
          <Users size={28} />
          <h5>{summary.donors}</h5>
          <span>Total Donors</span>
        </div>
        <div className="card bg-success text-white">
          <Hospital size={28} />
          <h5>{summary.hospitals}</h5>
          <span>Hospitals</span>
        </div>
        <div className="card bg-warning text-white">
          <Droplet size={28} />
          <h5>{summary.requests}</h5>
          <span>Blood Requests</span>
        </div>
        <div className="card bg-info text-white">
          <ThumbsUp size={28} />
          <h5>{summary.approved}</h5>
          <span>Approved</span>
        </div>
        <div className="card bg-danger text-white">
          <ThumbsDown size={28} />
          <h5>{summary.rejected}</h5>
          <span>Rejected</span>
        </div>
      </div>

      <div className="charts-container">
        {bloodStats.length > 0 && (
          <div className="chart-box">
            <h4>Donations by Blood Group</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bloodStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bloodGroup" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalDonated" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="chart-box">
          <h4>Request Approval Trend</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={[
                { name: "Approved", value: summary.approved },
                { name: "Rejected", value: summary.rejected },
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#28a745" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Admin;
