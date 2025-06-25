// src/pages/admin/Hospitals.jsx
import React, { useEffect, useState } from 'react';
import { publicRequest } from '../requestMethods';
import {
  Modal,
  Button,
  Form,
  Spinner,
  Alert,
  Table,
  Pagination,
} from 'react-bootstrap';
import './Hospitals.css';
import { Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editHospital, setEditHospital] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteHospital, setDeleteHospital] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');


  useEffect(() => {
    fetchHospitals();
    fetchStats();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await publicRequest.get('/hospitals');
      setHospitals(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load hospitals.');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await publicRequest.get('/hospitals/stats');
      setStats(res.data);
      setStatsLoading(false);
    } catch (err) {
      setStatsError('Failed to load hospital stats.');
      setStatsLoading(false);
    }
  };

  const filteredHospitals = hospitals.filter(hospital =>
    (hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (bloodGroupFilter === '' || hospital.bloodgroup === bloodGroupFilter) &&
    (verifiedFilter === '' ||
      (verifiedFilter === 'verified' && hospital.verified) ||
      (verifiedFilter === 'unverified' && !hospital.verified))
  );


  const requestSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedHospitals = React.useMemo(() => {
    if (!sortConfig.key) return filteredHospitals;
    return [...filteredHospitals].sort((a, b) => {
      let aVal = a[sortConfig.key] || '';
      let bVal = b[sortConfig.key] || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      return sortConfig.direction === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [filteredHospitals, sortConfig]);

  const totalPages = Math.ceil(sortedHospitals.length / itemsPerPage);
  const paginatedHospitals = sortedHospitals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEditClick = hospital => {
    setEditHospital({ ...hospital });
    setFormError(null);
    setShowEditModal(true);
  };

  const handleFormChange = e => {
    setEditHospital(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async e => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const { _id, name, email, address, tel } = editHospital;
      const res = await publicRequest.put(`/hospitals/updateprofile/${_id}`, {
        name,
        email,
        address,
        tel,
      });
      setHospitals(prev =>
        prev.map(h => (h._id === _id ? res.data.hospital : h))
      );
      setShowEditModal(false);
    } catch {
      setFormError('Failed to update profile.');
    }
    setFormLoading(false);
  };

  const handleDeleteClick = hospital => {
    setDeleteHospital(hospital);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await publicRequest.delete(`/hospitals/${deleteHospital._id}`);
      setHospitals(prev =>
        prev.filter(h => h._id !== deleteHospital._id)
      );
      setShowDeleteModal(false);
    } catch {
      setDeleteError('Failed to delete hospital.');
    }
    setDeleteLoading(false);
  };

  const SortArrow = ({ column }) =>
    sortConfig.key === column ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : null;

  return (
    <div className="hospitals-page container mt-4">
      <h1 className="mb-4">Hospitals Management</h1>

      <Form.Group controlId="searchHospital" className="mb-3">
        <Form.Control
          type="search"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </Form.Group>

      <Form.Select
        className="mb-3"
        value={verifiedFilter}
        onChange={e => {
          setVerifiedFilter(e.target.value);
          setCurrentPage(1); // Reset pagination
        }}
      >
        <option value="">All Hospitals</option>
        <option value="verified">Only Verified</option>
        <option value="unverified">Only Unverified</option>
      </Form.Select>


      {loading ? (
        <div className="text-center my-5"><Spinner animation="border" /></div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <Table responsive hover bordered className="hospital-table shadow-sm rounded">
            <thead className="table-header bg-primary text-white">
              <tr>
                <th>#</th>
                <th>Profile</th>
                <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
                  Name <SortArrow column="name" />
                </th>
                <th onClick={() => requestSort('email')} style={{ cursor: 'pointer' }}>
                  Email <SortArrow column="email" />
                </th>
                <th>Phone</th>
                <th>Address</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedHospitals.map((hospital, idx) => (
                <tr key={hospital._id} className="hospital-row">
                  <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td>
                    {hospital.profileImage ? (
                      <img
                        src={hospital.profileImage}
                        alt={hospital.name}
                        className="profile-img"
                      />
                    ) : (
                      <div className="profile-placeholder">
                        {hospital.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td>{hospital.name}</td>
                  <td>{hospital.email}</td>
                  <td>{hospital.tel || '-'}</td>
                  <td>{hospital.address || '-'}</td>
                  <td>
                    {hospital.verified ? (
                      <span className="verified-badge">
                        <CheckCircle className="icon me-1 text-success" /> Verified
                      </span>
                    ) : (
                      <span className="unverified-badge">
                        <XCircle className="icon me-1 text-danger" /> Not Verified
                      </span>
                    )}
                  </td>
                  <td className="d-flex gap-1 justify-content-center">
                    <Button
                      size="sm"
                      variant="outline-success"
                      className="action-btn"
                      onClick={() => handleEditClick(hospital)}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      className="action-btn"
                      onClick={() => handleDeleteClick(hospital)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>

                </tr>
              ))}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <Pagination className="justify-content-center">
              <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
              <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
              {Array.from({ length: totalPages }, (_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === currentPage}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
              <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
          )}
        </>
      )}

      {/* Stats Panel */}
      <aside className="stats-panel mt-4">
        <h2>Hospital Blood Group Stats</h2>
        {statsLoading ? (
          <div className="text-center my-3"><Spinner animation="border" /></div>
        ) : statsError ? (
          <Alert variant="danger">{statsError}</Alert>
        ) : stats.length === 0 ? (
          <div>No stats available.</div>
        ) : (
          <ul className="stats-list list-unstyled">
            {stats.map(({ _id: bg, count }) => (
              <li key={bg} className="d-flex justify-content-between border-bottom py-1">
                <strong>{bg || 'Unknown'}</strong>
                <span>{count}</span>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Header closeButton><Modal.Title>Edit Hospital</Modal.Title></Modal.Header>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={editHospital?.name || ''} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={editHospital?.email || ''} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control type="text" name="address" value={editHospital?.address || ''} onChange={handleFormChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control type="text" name="tel" value={editHospital?.tel || ''} onChange={handleFormChange} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={formLoading}>
              {formLoading ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Delete Hospital</Modal.Title></Modal.Header>
        <Modal.Body>
          {deleteError && <Alert variant="danger">{deleteError}</Alert>}
          Are you sure you want to delete <b>{deleteHospital?.name}</b>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={deleteLoading}>
            {deleteLoading ? <Spinner animation="border" size="sm" /> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Hospitals;
