import React, { useEffect, useState } from 'react';
import {
  Button,
  Spinner,
  Pagination,
  OverlayTrigger,
  Tooltip as BootstrapTooltip,
  Form,
} from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { publicRequest } from '../requestMethods';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './BloodRequest.css';

const COLORS = ['#28a745', '#ffc107', '#dc3545'];
const STATUS_LABELS = ['Approved', 'Pending', 'Rejected'];

const BloodRequest = () => {
  const [requests, setRequests] = useState([]);
  const [bloodStats, setBloodStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [darkMode, setDarkMode] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, statsRes] = await Promise.all([
          publicRequest.get("/blood"),
          publicRequest.get("/donors/stats")
        ]);
        setRequests(reqRes.data);
        setBloodStats(statsRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const storedMode = localStorage.getItem('darkMode');
    if (storedMode === 'true') setDarkMode(true);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const getAvailability = (bloodGroup) => {
    const found = bloodStats.find(stat => stat.bloodGroup === bloodGroup);
    return found ? found.totalDonated : 0;
  };

  const handleAction = async (id, action) => {
    try {
      const res = await publicRequest.patch(`/blood/${id}/${action}`);
      const updatedMessage = res.data.message || `${action} successful`;
      setRequests(prev => prev.map(req => req._id === id ? { ...req, status: res.data.status } : req));
      const statsRes = await publicRequest.get("/donors/stats");
      setBloodStats(statsRes.data);
      toast.success(updatedMessage);
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${action} request`);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Hospital', 'Blood Group', 'Amount', 'Available', 'Status']],
      body: paginatedRequests.map(r => [
        r.hospital?.name || 'Unknown',
        r.bloodGroup,
        r.amount,
        getAvailability(r.bloodGroup),
        r.status
      ]),
    });
    doc.save('blood_requests.pdf');
  };

  const handleExportCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      paginatedRequests.map(r => ({
        Hospital: r.hospital?.name || 'Unknown',
        BloodGroup: r.bloodGroup,
        Amount: r.amount,
        Available: getAvailability(r.bloodGroup),
        Status: r.status,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Requests');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'blood_requests.xlsx');
  };

  const filteredRequests = requests
    .filter(req =>
      req.hospital?.name?.toLowerCase().includes(searchTerm) ||
      req.bloodGroup.toLowerCase().includes(searchTerm)
    )
    .filter(req => statusFilter === 'All' || req.status === statusFilter)
    .filter(req => {
      if (!fromDate && !toDate) return true;
      const created = new Date(req.createdAt);
      if (fromDate && created < new Date(fromDate)) return false;
      if (toDate && created > new Date(toDate)) return false;
      return true;
    });

  const statusData = STATUS_LABELS.map((label, index) => ({
    name: label,
    value: filteredRequests.filter(r => r.status === label).length,
    color: COLORS[index],
  }));

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="danger" /></div>;

  return (
    <div className="container py-4">
      <div className="mb-4 row g-3">
        <div className="col-md-4">
          <input
            type="text"
            placeholder="Search by hospital or blood group..."
            className="form-control shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          />
        </div>
        <div className="col-md-2">
          <Form.Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Pending">Pending</option>
          </Form.Select>
        </div>
        <div className="col-md-2">
          <Form.Control type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="col-md-2">
          <Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <div className="col-md-2 d-flex gap-2">
          <Button variant="outline-danger" onClick={handleExportPDF}>PDF</Button>
          <Button variant="outline-dark" onClick={handleExportCSV}>CSV</Button>
        </div>
      </div>

      <div className="d-flex justify-content-center mb-5 mt-5">
        <PieChart width={450} height={240}>
          <Pie
            data={statusData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, value }) => `${name} (${value})`}
            dataKey="value"
          >
            {statusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip />
          <Legend />
        </PieChart>
      </div>

      <div className="table-responsive shadow-sm">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Hospital</th>
              <th>Blood Type</th>
              <th>Amount</th>
              <th>Available</th>
              <th>Status</th>
              <th>Actions</th>
              <th>Requested On</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.length === 0 ? (
              <tr><td colSpan="7" className="text-center text-muted py-4">No requests found.</td></tr>
            ) : (
              paginatedRequests.map(req => {
                const available = getAvailability(req.bloodGroup);
                const requested = parseInt(
                  (typeof req.amount === 'string' ? req.amount.replace(/[^\d]/g, '') : req.amount) || 0,
                  10
                );
                const canApprove = available >= requested;

                return (
                  <tr key={req._id} className={`fade-in ${req.status === 'Approved' ? 'table-success' : req.status === 'Rejected' ? 'table-danger' : ''}`}>
                    <td>{req.hospital?.name || "Unknown"}</td>
                    <td>{req.bloodGroup}</td>
                    <td>{requested}</td>
                    <OverlayTrigger placement="top" overlay={<BootstrapTooltip>{available}ml in stock</BootstrapTooltip>}>
                      <td style={{ cursor: 'help' }}>{available}</td>
                    </OverlayTrigger>
                    <td>
                      <span className={`badge rounded-pill ${req.status === 'Approved' ? 'bg-success' : req.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      {req.status === 'Pending' && (
                        <div className="d-flex flex-column flex-sm-row gap-2">
                          <Button variant="success" size="sm" disabled={!canApprove} onClick={() => handleAction(req._id, 'approve')}>Approve</Button>
                          <Button variant="danger" size="sm" onClick={() => handleAction(req._id, 'reject')}>Reject</Button>
                          {!canApprove && <div className="text-danger small mt-1">Not enough stock</div>}
                        </div>
                      )}
                    </td>
                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination className="justify-content-center my-4">
          {[...Array(totalPages)].map((_, idx) => (
            <Pagination.Item
              key={idx}
              active={currentPage === idx + 1}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}
    </div>
  );
};

export default BloodRequest;
