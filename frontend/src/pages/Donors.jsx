import React, { useEffect, useState } from 'react';
import './Donors.css';
import { adminRequest, publicRequest } from '../requestMethods';
import { Modal } from 'react-bootstrap';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  Eye,
  Pencil,
  Trash,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PlusCircle,
} from 'lucide-react';

const Donors = () => {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [editForm, setEditForm] = useState({
    _id: '', name: '', email: '', tel: '', address: '', age: '', weight: '',
    bloodgroup: '', disease: '', verified: false, rating: '', numberOfDonations: '',
    lastDonationDate: '', nextDonationDate: ''
  });

  const [addForm, setAddForm] = useState({
    name: '', email: '', tel: '', address: '', age: '', weight: '', bloodgroup: '',
    disease: '', verified: false, rating: '', numberOfDonations: '',
    lastDonationDate: '', nextDonationDate: '', profileImage: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const donorsPerPage = 6;

  const [darkMode, setDarkMode] = useState(() => {
    // Load initial mode from localStorage or default to false
    return localStorage.getItem('donorsDarkMode') === 'true';
  });

  // Fetch all donors from API
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const res = await publicRequest.get('/donors');
        setDonors(res.data);
        setFilteredDonors(res.data);
      } catch (err) {
        showToast('Failed to load donors', 'error');
        console.error(err);
      }
    };
    fetchDonors();
  }, []);

  // Filter donors on search or blood group filter
  useEffect(() => {
    let updated = [...donors];
    if (searchQuery) {
      updated = updated.filter(d =>
        (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (bloodGroupFilter) {
      updated = updated.filter(d => d.bloodgroup === bloodGroupFilter);
    }
    setFilteredDonors(updated);
    setCurrentPage(1);
  }, [searchQuery, bloodGroupFilter, donors]);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Export PDF report
  const handlePDFExport = () => {
    const doc = new jsPDF();
    doc.text('Donor List Report', 14, 10);
    autoTable(doc, {
      head: [[
        'Name', 'Email', 'Blood Group', 'Donations', 'Verified', 'Last Donation', 'Next Eligible'
      ]],
      body: filteredDonors.map(d => [
        d.name || '-',
        d.email || '-',
        d.bloodgroup || '-',
        d.numberOfDonations || 0,
        d.verified ? 'Yes' : 'No',
        d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : '-',
        d.nextDonationDate ? new Date(d.nextDonationDate).toLocaleDateString() : '-',
      ]),
    });
    doc.save('donors_report.pdf');
  };

  // Export Excel report
  const handleExcelExport = () => {
    const wsData = [
      ['Name', 'Email', 'Blood Group', 'Donations', 'Verified', 'Last Donation', 'Next Eligible'],
      ...filteredDonors.map(d => [
        d.name || '-',
        d.email || '-',
        d.bloodgroup || '-',
        d.numberOfDonations || 0,
        d.verified ? 'Yes' : 'No',
        d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : '-',
        d.nextDonationDate ? new Date(d.nextDonationDate).toLocaleDateString() : '-',
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Donors');
    XLSX.writeFile(wb, 'donors_report.xlsx');
  };

  const handleAddChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddSubmit = async () => {
    try {
      const res = await publicRequest.post('/', addForm);
      setDonors(prev => [...prev, res.data]);
      setFilteredDonors(prev => [...prev, res.data]);
      showToast('New donor added successfully');
      setShowAddModal(false);
      setAddForm({
        name: '', email: '', tel: '', address: '', age: '', weight: '', bloodgroup: '',
        disease: '', verified: false, rating: '', numberOfDonations: '',
        lastDonationDate: '', nextDonationDate: '', profileImage: ''
      });
    } catch (err) {
      console.error(err);
      showToast('Failed to add donor', 'error');
    }
  };

  // Open donation history modal for donor
  const openDonationHistory = (donor) => {
    setSelectedDonor(donor);
    setShowHistoryModal(true);
  };

  // Confirm delete modal
  const confirmDelete = (donor) => {
    setSelectedDonor(donor);
    setShowDeleteModal(true);
  };

  // Handle deleting donor
  const handleDelete = async () => {
    try {
      await publicRequest.delete(`/donors/${selectedDonor._id}`);
      const updated = donors.filter(d => d._id !== selectedDonor._id);
      setDonors(updated);
      setFilteredDonors(updated);
      setShowDeleteModal(false);
      showToast('Donor deleted successfully', 'success');
    } catch (error) {
      console.error('Delete failed:', error);
      showToast('Failed to delete donor', 'error');
    }
  };

  // Open edit modal and populate form
  const handleEditClick = (donor) => {
    setEditForm({
      _id: donor._id,
      name: donor.name || '',
      email: donor.email || '',
      tel: donor.tel || '',
      address: donor.address || '',
      age: donor.age || '',
      weight: donor.weight || '',
      bloodgroup: donor.bloodgroup || '',
      disease: donor.disease || '',
      verified: donor.verified || false,
      profileImage: donor.profileImage || null,
    });
    setShowEditModal(true);
  };

  // Handle form input changes in edit modal
  const handleInputChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (type === 'file') {
      setEditForm(prev => ({ ...prev, profileImage: files[0] }));
    } else if (type === 'checkbox') {
      setEditForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Submit edited donor
  const handleEditSubmit = async () => {
    try {
      const formData = new FormData();
      for (const key in editForm) {
        if (key === 'profileImage' && editForm[key] instanceof File) {
          formData.append('image', editForm[key]);
        } else {
          formData.append(key, editForm[key]);
        }
      }

      const res = await adminRequest.put(`/donors/${editForm._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updated = donors.map(d => d._id === res.data.donor._id ? res.data.donor : d);
      setDonors(updated);
      setFilteredDonors(updated);
      setShowEditModal(false);
      showToast('Donor updated successfully', 'success');
    } catch (err) {
      console.error('Update failed:', err);
      showToast('Failed to update donor', 'error');
    }
  };

  useEffect(() => {
    const root = document.body; // or use .donors-page div
    if (darkMode) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
    localStorage.setItem('donorsDarkMode', darkMode);
  }, [darkMode]);

  // Pagination logic
  const indexOfLast = currentPage * donorsPerPage;
  const indexOfFirst = indexOfLast - donorsPerPage;
  const currentDonors = filteredDonors.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredDonors.length / donorsPerPage);

  // Aggregate total donation by blood group for dashboard widget & chart
  const bloodGroupStats = donors.reduce((acc, donor) => {
    if (!donor.bloodgroup) return acc;
    if (!acc[donor.bloodgroup]) acc[donor.bloodgroup] = 0;
    acc[donor.bloodgroup] += donor.donationAmount || 0;
    return acc;
  }, {});

  const bloodGroupStatsArray = Object.entries(bloodGroupStats).map(([bloodgroup, total]) => ({
    bloodgroup,
    total,
  }));

  return (
    <div className='donors-page'>

      {/* Toast Notification */}
      {toast.show && (<div className={`toast-notification ${toast.type}`}> {toast.message} </div>)}

      {/* Charts Section */}
      <section className="chart-section">
        <h5>Donation Trends (By Blood Group)</h5>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={bloodGroupStatsArray} margin={{ top: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bloodgroup" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Filters and Actions */}
      <div className='header'>
        <h4>Donors Management</h4>
        <div className="action-buttons-group">
          <button className='export-btn' onClick={handlePDFExport}>Export PDF</button>
          <button className='export-btn' onClick={handleExcelExport}>Export Excel</button>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="filter-input"
        />
        <select
          value={bloodGroupFilter}
          onChange={e => setBloodGroupFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Blood Groups</option>
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
            <option key={bg} value={bg}>{bg}</option>
          ))}
        </select>
      </div>

      {/* Donors Table */}
      <table className='donors-table'>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Blood Group</th>
            <th>Donations</th>
            <th>Verified</th>
            <th>Last Donation</th>
            <th>Next Eligible</th>
            <th>Age</th>
            <th>Weight</th>
            <th>Disease</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentDonors.map(donor => (
            <tr key={donor._id}>
              <td>{donor._id || '-'}</td>
              <td>{donor.name || '-'}</td>
              <td>{donor.email || '-'}</td>
              <td>{donor.tel || '-'}</td>
              <td>{donor.address || '-'}</td>
              <td>{donor.bloodgroup || '-'}</td>
              <td>{donor.numberOfDonations || 0}</td>
              <td className="verified-cell">
                {donor.verified ? <CheckCircle color="green" /> : <XCircle color="red" />}
              </td>
              <td>{donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : '-'}</td>
              <td>{donor.nextDonationDate ? new Date(donor.nextDonationDate).toLocaleDateString() : '-'}</td>
              <td>{donor.age || '-'}</td>
              <td>{donor.weight || '-'}</td>
              <td>{donor.disease || '-'}</td>
              <td>{donor.rating?.toFixed(1) || '0.0'}</td>
              <td className="action-buttons">
                <button onClick={() => openDonationHistory(donor)} title="View History"><Eye size={16} /></button>
                <button onClick={() => handleEditClick(donor)} title="Edit"><Pencil size={16} /></button>
                <button onClick={() => confirmDelete(donor)} title="Delete" className="delete"><Trash size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={currentPage === i + 1 ? 'active' : ''}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Donation History Modal */}
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Donation History - {selectedDonor?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDonor?.donationHistory?.length > 0 ? (
            <table className='history-table'>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount (ml)</th>
                  <th>Disease</th>
                  <th>Blood Group</th>
                  <th>Age</th>
                  <th>Weight</th>
                </tr>
              </thead>
              <tbody>
                {selectedDonor.donationHistory.map((entry, idx) => (
                  <tr key={idx}>
                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                    <td>{entry.amount}</td>
                    <td>{entry.disease}</td>
                    <td>{entry.bloodgroup}</td>
                    <td>{entry.age}</td>
                    <td>{entry.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No donation history found.</p>
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><AlertTriangle size={18} /> Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete donor <strong>{selectedDonor?.name}</strong>?</Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </Modal.Footer>
      </Modal>

      {/* Edit Donor Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Donor - {editForm.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="edit-form" onSubmit={e => { e.preventDefault(); handleEditSubmit(); }}>
            <div className="form-group">
              <label>Name:</label>
              <input name="name" value={editForm.name} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input type="email" name="email" value={editForm.email} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Phone:</label>
              <input name="tel" value={editForm.tel} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Address:</label>
              <input name="address" value={editForm.address} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Age:</label>
              <input type="number" min="0" name="age" value={editForm.age} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Weight (kg):</label>
              <input type="number" min="0" name="weight" value={editForm.weight} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Blood Group:</label>
              <select name="bloodgroup" value={editForm.bloodgroup} onChange={handleInputChange} required>
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Disease:</label>
              <input name="disease" value={editForm.disease} onChange={handleInputChange} />
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="verified"
                  checked={editForm.verified}
                  onChange={handleInputChange}
                /> Verified
              </label>
            </div>
            <div className="form-group">
              <label>Profile Image:</label>
              <input type="file" name="profileImage" onChange={handleInputChange} accept="image/*" />
              {typeof editForm.profileImage === 'string' && editForm.profileImage && (
                <img src={editForm.profileImage} alt="Current profile" className="edit-profile-img" />
              )}
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Donors;
