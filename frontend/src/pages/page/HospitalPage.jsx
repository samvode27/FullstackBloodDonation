import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useDispatch } from 'react-redux'
import { useNavigate } from "react-router-dom"
import { logout } from '../../redux/hospitalRedux';

const HospitalPage = () => {
  const [bloodRequests, setBloodRequests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    patientName: '',
    bloodType: '',
    quantity: '',
    urgency: 'Normal',
  });
  const [showTransfusionModal, setShowTransfusionModal] = useState(false);
  const [transfusionData, setTransfusionData] = useState({ staffName: '', date: '', notes: '' });
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const inventory = {
    'A+': 12,
    'A-': 5,
    'B+': 8,
    'B-': 3,
    'AB+': 6,
    'AB-': 2,
    'O+': 10,
    'O-': 4,
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const submitRequest = (e) => {
    e.preventDefault();
    const newRequest = {
      id: Date.now(),
      ...formData,
      status: 'Pending',
    };
    setBloodRequests([newRequest, ...bloodRequests]);
    setPatients([
      ...patients,
      { name: formData.patientName, bloodType: formData.bloodType },
    ]);
    setFormData({
      patientName: '',
      bloodType: '',
      quantity: '',
      urgency: 'Normal',
    });
    showToast('Blood request submitted.');
  };

  const updateStatus = (id, newStatus) => {
    setBloodRequests(
      bloodRequests.map((req) =>
        req.id === id ? { ...req, status: newStatus } : req
      )
    );
    showToast(`Request marked as ${newStatus}`);
  };

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const saveTransfusionLog = () => {
    setBloodRequests((prev) =>
      prev.map((req) =>
        req.id === selectedRequestId
          ? {
            ...req,
            transfusionLog: { ...transfusionData },
            status: 'Transfused',
          }
          : req
      )
    );
    showToast('Transfusion logged successfully.');
    setTransfusionData({ staffName: '', date: '', notes: '' });
    setShowTransfusionModal(false);
  };

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const handleLogout = () => {
    dispatch(logout())
    navigate("/")
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">🏥 Hospital Blood Bank System</h2>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>


      {toast && (
        <div
          className={`alert alert-${toast.type} alert-dismissible fade show`}
          role="alert"
        >
          {toast.message}
        </div>
      )}

      <div className="row">
        {/* Request Form */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              New Blood Request
            </div>
            <div className="card-body">
              <form onSubmit={submitRequest}>
                <div className="mb-2">
                  <input
                    type="text"
                    name="patientName"
                    className="form-control"
                    placeholder="Patient Name"
                    value={formData.patientName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-2">
                  <select
                    name="bloodType"
                    className="form-select"
                    value={formData.bloodType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Blood Type</option>
                    {Object.keys(inventory).map((bt) => (
                      <option key={bt}>{bt}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <input
                    type="number"
                    name="quantity"
                    className="form-control"
                    placeholder="Quantity (units)"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <select
                    name="urgency"
                    className="form-select"
                    value={formData.urgency}
                    onChange={handleChange}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <button className="btn btn-primary w-100">Submit Request</button>
              </form>
            </div>
          </div>
        </div>

        {/* Inventory Display */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">Blood Inventory</div>
            <div className="card-body row">
              {Object.entries(inventory).map(([type, count]) => (
                <div key={type} className="col-4 mb-2">
                  <div className="border rounded text-center p-2">
                    <h6 className="mb-0">{type}</h6>
                    <span className="badge bg-secondary">{count} units</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-warning">Blood Requests</div>
        <div className="card-body table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Patient</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bloodRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    No requests yet.
                  </td>
                </tr>
              ) : (
                bloodRequests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.patientName}</td>
                    <td>{req.bloodType}</td>
                    <td>{req.quantity}</td>
                    <td>
                      <span
                        className={`badge bg-${req.urgency === 'Critical'
                          ? 'danger'
                          : req.urgency === 'Urgent'
                            ? 'warning'
                            : 'info'
                          }`}
                      >
                        {req.urgency}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">
                        {req.status}
                      </span>
                    </td>
                    <td>
                      {req.status === 'Fulfilled' && !req.transfusionLog && (
                        <button
                          className="btn btn-sm btn-dark"
                          onClick={() => {
                            setSelectedRequestId(req.id);
                            setShowTransfusionModal(true);
                          }}
                        >
                          <i className="bi bi-clipboard-plus"></i> Log
                        </button>
                      )}
                      {req.status !== 'Fulfilled' && req.status !== 'Transfused' && (
                        <>
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() => updateStatus(req.id, 'Approved')}
                          >
                            <i className="bi bi-check-circle"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => updateStatus(req.id, 'Fulfilled')}
                          >
                            <i className="bi bi-box-seam"></i>
                          </button>
                        </>
                      )}
                      {req.transfusionLog && (
                        <span className="badge bg-success">Transfused</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patients Section */}
      <div className="card shadow-sm">
        <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
          <span>Patients</span>
          <input
            type="text"
            className="form-control w-25"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="card-body">
          <ul className="list-group">
            {filteredPatients.length === 0 ? (
              <li className="list-group-item">No matching patients.</li>
            ) : (
              filteredPatients.map((p, idx) => (
                <li
                  key={idx}
                  className="list-group-item d-flex justify-content-between"
                >
                  <span>{p.name}</span>
                  <span className="badge bg-primary">{p.bloodType}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Transfusion Modal */}
      {showTransfusionModal && (
        <div className="modal show fade d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content shadow">
              <div className="modal-header">
                <h5 className="modal-title">Log Transfusion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowTransfusionModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Staff Name"
                  value={transfusionData.staffName}
                  onChange={(e) =>
                    setTransfusionData({
                      ...transfusionData,
                      staffName: e.target.value,
                    })
                  }
                />
                <input
                  type="datetime-local"
                  className="form-control mb-2"
                  value={transfusionData.date}
                  onChange={(e) =>
                    setTransfusionData({
                      ...transfusionData,
                      date: e.target.value,
                    })
                  }
                />
                <textarea
                  className="form-control mb-2"
                  rows="3"
                  placeholder="Notes"
                  value={transfusionData.notes}
                  onChange={(e) =>
                    setTransfusionData({
                      ...transfusionData,
                      notes: e.target.value,
                    })
                  }
                ></textarea>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowTransfusionModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={saveTransfusionLog}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalPage;
