import React, { useEffect, useState } from 'react';
import './Donors.css';
import { adminRequest, publicRequest } from '../requestMethods';
import { Modal } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  Pencil,
  Trash,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const Donors = () => {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [editForm, setEditForm] = useState({
    _id: '',
    name: '',
    email: '',
    tel: '',
    address: '',
    age: '',
    weight: '',
    bloodgroup: '',
    disease: '',
    verified: false,
    numberOfDonations: '',
    lastDonationDate: '',
    nextDonationDate: '',
    profileImage: '',
  });

  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    tel: '',
    address: '',
    age: '',
    weight: '',
    bloodgroup: '',
    disease: '',
    numberOfDonations: 0,
    verified: false,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const donorsPerPage = 6;

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('donorsDarkMode') === 'true';
  });

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

  useEffect(() => {
    let updated = [...donors];

    if (searchQuery) {
      updated = updated.filter(d =>
        (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (bloodGroupFilter) {
      updated = updated.filter(d => {
        const donorBloodgroup =
          d.bloodgroup ||
          d.donationHistory?.[0]?.bloodgroup ||
          '';
        return donorBloodgroup === bloodGroupFilter;
      });
    }

    setFilteredDonors(updated);
    setCurrentPage(1);
  }, [searchQuery, bloodGroupFilter, donors]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handlePDFExport = () => {
    const doc = new jsPDF();
    doc.text('Donor List Report', 14, 10);
    autoTable(doc, {
      head: [[
        'Name', 'Email', 'Address', 'Telephone', 'Verified'
      ]],
      body: filteredDonors.map(h => [
        h.name || '-',
        h.email || '-',
        h.address || '-',
        h.tel || '-',
        h.verified ? 'Yes' : 'No',
      ]),
    });
    doc.save('Donors.pdf');
  };

  const handleExcelExport = () => {
    const wsData = [
      ['Name', 'Email', 'Address', 'Telephone', 'Verified'],
      ...filteredDonors.map(h => [
        h.name || '-',
        h.email || '-',
        h.address || '-',
        h.tel || '-',
        h.verified ? 'Yes' : 'No',
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Donors');
    XLSX.writeFile(wb, 'Donors.xlsx');
  };

  const confirmDelete = (donor) => {
    setSelectedDonor(donor);
    setShowDeleteModal(true);
  };

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

  const handleEditClick = (donor) => {
    setEditForm({
      _id: donor._id,
      name: donor.name || '',
      email: donor.email || '',
      tel: donor.tel || '',
      address: donor.address || '',
      age: donor.age || '',
      weight: donor.weight || '',
      bloodgroup: donor.donationHistory?.[0]?.bloodgroup || '',
      disease: donor.donationHistory?.[0]?.disease || '',
      verified: donor.verified || false,
      numberOfDonations: donor.numberOfDonations || 0,
      profileImage: donor.profileImage || '',
    });
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setEditForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async () => {
    try {
      const payload = {
        name: editForm.name,
        email: editForm.email,
        tel: editForm.tel,
        address: editForm.address,
        age: editForm.age,
        weight: editForm.weight,
        verified: editForm.verified,
        bloodgroup: editForm.bloodgroup,
        disease: editForm.disease,
        numberOfDonations: editForm.numberOfDonations,
      };

      const res = await adminRequest.put(`/donors/${editForm._id}`, payload);

      const updated = donors.map(d =>
        d._id === res.data.donor._id ? res.data.donor : d
      );
      setDonors(updated);
      setFilteredDonors(updated);
      setShowEditModal(false);
      showToast('Donor updated successfully', 'success');
    } catch (err) {
      console.error('Update failed:', err);
      showToast('Failed to update donor', 'error');
    }
  };

  const openAddModal = () => {
    setAddForm({
      name: '',
      email: '',
      password: '',
      tel: '',
      address: '',
      age: '',
      weight: '',
      bloodgroup: '',
      disease: '',
      numberOfDonations: 0,
      verified: false,
    });
    setShowAddModal(true);
  };

  const handleAddInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setAddForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setAddForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSubmit = async () => {
    try {
      const payload = {
        name: addForm.name,
        email: addForm.email,
        password: addForm.password,
        tel: addForm.tel,
        address: addForm.address,
        age: addForm.age,
        weight: addForm.weight,
        bloodgroup: addForm.bloodgroup,
        disease: addForm.disease,
        numberOfDonations: addForm.numberOfDonations,
        verified: addForm.verified,
      };

      const res = await publicRequest.post('/donors', payload);
      const newDonor = res.data;

      setDonors(prev => [newDonor, ...prev]);
      setFilteredDonors(prev => [newDonor, ...prev]);
      setShowAddModal(false);
      showToast('Donor added successfully', 'success');
    } catch (error) {
      console.error('Add donor failed:', error);
      showToast('Failed to add donor', 'error');
    }
  };

  useEffect(() => {
    const root = document.body;
    if (darkMode) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
    localStorage.setItem('donorsDarkMode', darkMode);
  }, [darkMode]);

  const indexOfLast = currentPage * donorsPerPage;
  const indexOfFirst = indexOfLast - donorsPerPage;
  const currentDonors = filteredDonors.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredDonors.length / donorsPerPage);

  return (
    <div className='donors-page'>

      {toast.show && (<div className={`toast-notification ${toast.type}`}>{toast.message}</div>)}

      <div className="d-flex justify-content-end flex-wrap gap-2 mt-3 mb-3">
        <div className="action-buttons-group">
          <button className='export-btn' onClick={handlePDFExport}>Export PDF</button>
          <button className='export-btn' onClick={handleExcelExport}>Export Excel</button>
          <button onClick={openAddModal}>Add Donor</button>
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

      <table className='donors-table attractive-table'>
        <thead>
          <tr>
            <th style={{ width: "100px" }}>Image</th>
            <th>Id</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Blood Group History</th>
            <th>Donations</th>
            <th>Verified</th>
            <th>Last Donation</th>
            <th>Next Eligible</th>
            <th>Age</th>
            <th>Weight</th>
            <th>Disease History</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentDonors.map(donor => (
            <tr key={donor._id}>
              <td data-label="Image">
                <img
                  src={
                    donor.profileImage
                      ? `http://localhost:8000${donor.profileImage}`
                      : '/images/default-avatar.png'
                  }
                  alt={donor.name || "Profile"}
                  className="donor-avatar"
                />
              </td>
              <td data-label="Id">{donor._id || '-'}</td>
              <td data-label="Name">{donor.name || '-'}</td>
              <td data-label="Email">{donor.email || '-'}</td>
              <td data-label="Phone">{donor.tel || '-'}</td>
              <td data-label="Address">{donor.address || '-'}</td>

              <td data-label="Blood Group History">
                {donor.donationHistory?.length > 0 ? (
                  <div className="history-cell">
                    {donor.donationHistory.map((donation, i) => (
                      <div key={i} className="history-card">
                        <span className="history-bloodgroup">
                          {donation.bloodgroup || 'N/A'}
                        </span>
                        <span className="history-date">
                          {donation.date
                            ? new Date(donation.date).toLocaleDateString()
                            : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  'N/A'
                )}
              </td>

              <td data-label="Donations">{donor.numberOfDonations || 0}</td>

              <td data-label="Verified" className="verified-cell">
                {donor.verified ? (
                  <CheckCircle color="green" />
                ) : (
                  <XCircle color="red" />
                )}
              </td>

              <td data-label="Last Donation">
                {donor.lastDonationDate
                  ? new Date(donor.lastDonationDate).toLocaleDateString()
                  : '-'}
              </td>
              <td data-label="Next Eligible">
                {donor.nextDonationDate
                  ? new Date(donor.nextDonationDate).toLocaleDateString()
                  : '-'}
              </td>
              <td data-label="Age">{donor.age || '-'}</td>
              <td data-label="Weight">{donor.weight || '-'}</td>

              <td data-label="Disease History">
                {donor.donationHistory?.length > 0 ? (
                  <div className="history-cell">
                    {donor.donationHistory.map((donation, i) => (
                      <div key={i} className="history-card disease-card">
                        {donation.disease || 'N/A'}
                      </div>
                    ))}
                  </div>
                ) : (
                  'N/A'
                )}
              </td>

              <td className="action-buttons" data-label="Actions">
                <button
                  onClick={() => handleEditClick(donor)}
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => confirmDelete(donor)}
                  title="Delete"
                  className="delete"
                >
                  <Trash size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><AlertTriangle size={18} /> Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete donor <strong>{selectedDonor?.name}</strong>?
        </Modal.Body>
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
          {editForm.profileImage && (
            <div className="profile-image-preview" style={{ marginBottom: '1rem' }}>
              <img
                src={
                  editForm.profileImage
                    ? `http://localhost:8000${editForm.profileImage}`
                    : '/images/default-avatar.png'
                }
                alt={editForm.name || "Profile"}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #ccc',
                }}
              />
            </div>
          )}

          <form
            className="edit-form"
            onSubmit={e => {
              e.preventDefault();
              handleEditSubmit();
            }}
          >
            <div className="form-group">
              <label>Name:</label>
              <input
                name="name"
                value={editForm.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone:</label>
              <input
                name="tel"
                value={editForm.tel}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Address:</label>
              <input
                name="address"
                value={editForm.address}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Age:</label>
              <input
                type="number"
                min="0"
                name="age"
                value={editForm.age}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Weight (kg):</label>
              <input
                type="number"
                min="0"
                name="weight"
                value={editForm.weight}
                onChange={handleInputChange}
              />
            </div>

            {/* New Blood Group field */}
            <div className="form-group">
              <label>Blood Group:</label>
              <select
                name="bloodgroup"
                value={editForm.bloodgroup}
                onChange={handleInputChange}
                required
              >
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {/* New Disease field */}
            <div className="form-group">
              <label>Disease:</label>
              <input
                name="disease"
                value={editForm.disease}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Number of Donations:</label>
              <input
                type="number"
                min="0"
                name="numberOfDonations"
                value={editForm.numberOfDonations}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="verified"
                  checked={editForm.verified}
                  onChange={handleInputChange}
                />
                Verified
              </label>
            </div>

            <button type="submit" className="btn btn-primary mt-3">Save Changes</button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Add Donor Modal - simplified for brevity */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Donor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form
            className="add-form"
            onSubmit={e => {
              e.preventDefault();
              handleAddSubmit();
            }}
          >
            {/* Include input fields for addForm similarly */}
            {/* ... */}
            <div className="form-group">
              <label>Name:</label>
              <input
                name="name"
                value={addForm.name}
                onChange={handleAddInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={addForm.email}
                onChange={handleAddInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={addForm.password}
                onChange={handleAddInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone:</label>
              <input
                name="tel"
                value={addForm.tel}
                onChange={handleAddInputChange}
              />
            </div>

            <div className="form-group">
              <label>Address:</label>
              <input
                name="address"
                value={addForm.address}
                onChange={handleAddInputChange}
              />
            </div>

            <div className="form-group">
              <label>Age:</label>
              <input
                type="number"
                min="0"
                name="age"
                value={addForm.age}
                onChange={handleAddInputChange}
              />
            </div>

            <div className="form-group">
              <label>Weight (kg):</label>
              <input
                type="number"
                min="0"
                name="weight"
                value={addForm.weight}
                onChange={handleAddInputChange}
              />
            </div>

            <div className="form-group">
              <label>Blood Group:</label>
              <select
                name="bloodgroup"
                value={addForm.bloodgroup}
                onChange={handleAddInputChange}
                required
              >
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Disease:</label>
              <input
                name="disease"
                value={addForm.disease}
                onChange={handleAddInputChange}
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="verified"
                  checked={addForm.verified}
                  onChange={handleAddInputChange}
                />
                Verified
              </label>
            </div>

            <button type="submit" className="btn btn-success mt-3">Add Donor</button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Dark Mode toggle */}
      <div className="dark-mode-toggle">
        <label>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
          Dark Mode
        </label>
      </div>
    </div>
  );
};

export default Donors;
