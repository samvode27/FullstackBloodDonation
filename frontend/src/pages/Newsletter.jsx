// src/pages/Newsletter.jsx
import React, { useEffect, useState } from 'react';
import { adminRequest } from '../requestMethods';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './Newsletter.css';

const Newsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const subscriberGoal = 500;

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const res = await adminRequest.get('/newsletter');
        setSubscribers(res.data.map(sub => ({ ...sub, visible: true })));
      } catch (err) {
        console.error('Failed to fetch subscribers', err);
      }
    };

    fetchSubscribers();
  }, []);

  const pieData = [
    { name: 'Subscribed', value: subscribers.length },
    { name: 'Remaining to Goal', value: Math.max(subscriberGoal - subscribers.length, 0) },
  ];

  const COLORS = ['#f43f5e', '#9CA3AF']; // rose-500 & gray-200

  return (
    <div className="newsletter-glass-container">
      <h2 className="newsletter-title">📬 Newsletter Subscribers</h2>

      <div className="insight-summary">
        <span className="subscriber-badge">
          🧑‍💻 {subscribers.length} people subscribed to receive updates
        </span>
        <p className="text-muted">Goal: <strong>{subscriberGoal}</strong> subscribers</p>
      </div>

      {/* Pie Chart */}
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
     <div className="table-tools">
  <input
    type="text"
    placeholder="🔍 Search by email..."
    className="search-input"
    onChange={(e) => {
      const query = e.target.value.toLowerCase();
      setSubscribers((prev) =>
        prev.map(sub => ({
          ...sub,
          visible: sub.email.toLowerCase().includes(query),
        }))
      );
    }}
  />
     </div>

     <div className="custom-table-wrapper">
  <table className="custom-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Email</th>
        <th>Subscribed On</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {subscribers.map((sub, index) =>
        sub.visible !== false ? (
          <tr key={sub._id}>
            <td>{index + 1}</td>
            <td>{sub.email}</td>
            <td>{sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleString() : 'Unknown'}</td>
            <td>
              <button
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(sub.email);
                }}
                title="Copy Email"
              >
                📋
              </button>
            </td>
          </tr>
        ) : null
      )}
      {subscribers.filter((s) => s.visible !== false).length === 0 && (
        <tr>
          <td colSpan="4" className="text-muted text-center">
            No matching subscribers.
          </td>
        </tr>
      )}
    </tbody>
  </table>
     </div>

    </div>
  );
};

export default Newsletter;
