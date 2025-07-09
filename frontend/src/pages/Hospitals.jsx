import React, { useEffect, useState } from 'react';
import { adminRequest, publicRequest } from '../requestMethods';
import {
  Modal,
  Row,
  Col,
  Button,
  Form,
  Spinner,
  Alert,
  Table,
  Pagination,
} from 'react-bootstrap';
import './Hospitals.css';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Pencil, Trash, CheckCircle, XCircle } from 'lucide-react';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
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

  // Edit Form State
  const [editForm, setEditForm] = useState({
    _id: '',
    name: '',
    email: '',
    tel: '',
    address: '',
    verified: false,
    profileImage: '',
    licenseNumber: '',
    licenseDocument: '',
  });

  useEffect(() => {
    fetchHospitals();
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

  const filteredHospitals = hospitals.filter(hospital =>
    (hospital.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (verifiedFilter === '' ||
      (verifiedFilter === 'verified' && hospital.verified) ||
      (verifiedFilter === 'unverified' && !hospital.verified))
  );

  const requestSort = (key) => {
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

  const handleEditClick = (hospital) => {
    setEditForm({
      _id: hospital._id,
      name: hospital.name || '',
      email: hospital.email || '',
      tel: hospital.tel || '',
      address: hospital.address || '',
      verified: hospital.verified || false,
      profileImage: hospital.profileImage || '',
      licenseNumber: hospital.licenseNumber || '',
      licenseDocument: hospital.officialDocument || '',
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setEditForm((prev) => ({
      ...prev,
      licenseDocument: file,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);

      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('email', editForm.email);
      formData.append('tel', editForm.tel);
      formData.append('address', editForm.address);
      formData.append('verified', editForm.verified);
      formData.append('licenseNumber', editForm.licenseNumber);

      if (editForm.licenseDocument instanceof File) {
        formData.append('officialDocument', editForm.licenseDocument);
      }

      const res = await adminRequest.put(
        `/hospitals/${editForm._id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const updated = hospitals.map((h) =>
        h._id === res.data.hospital._id ? res.data.hospital : h
      );

      setHospitals(updated);
      setShowEditModal(false);
      toast.success("Hospital updated successfully");
    } catch (err) {
      console.error('Update failed:', err);
      toast.error(err?.response?.data?.message || "Failed to update hospital");
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = (hospital) => {
    setDeleteHospital(hospital);
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
      toast.success("Hospital deleted successfully");
    } catch {
      setDeleteError('Failed to delete hospital.');
    }
    setDeleteLoading(false);
  };

  const SortArrow = ({ column }) =>
    sortConfig.key === column ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : null;

  const handlePDFExport = () => {
    const doc = new jsPDF();
    doc.text('Hospital List Report', 14, 10);
    autoTable(doc, {
      head: [[
        'Name', 'Email', 'Address', 'Telephone', 'License No.', 'Verified'
      ]],
      body: filteredHospitals.map(d => [
        d.name || '-',
        d.email || '-',
        d.address || '-',
        d.tel || 0,
        d.licenseNumber || '-',
        d.verified ? 'Yes' : 'No',
      ]),
    });
    doc.save('hospitals_report.pdf');
  };

  const handleExcelExport = () => {
    const wsData = [
      ['Name', 'Email', 'Address', 'Telephone', 'License No.', 'Verified'],
      ...filteredHospitals.map(d => [
        d.name || '-',
        d.email || '-',
        d.address || '-',
        d.tel || 0,
        d.licenseNumber || '-',
        d.verified ? 'Yes' : 'No',
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hospitals');
    XLSX.writeFile(wb, 'hospitals.xlsx');
  };

  return (
    <div className="hospitals-page container mt-4">
      <ToastContainer />

      <div className="d-flex justify-content-end flex-wrap gap-2 mt-3 mb-3">
        <div className="action-buttons-group">
          <button className='export-btn' onClick={handlePDFExport}>Export PDF</button>
          <button className='export-btn' onClick={handleExcelExport}>Export Excel</button>
        </div>
      </div>

      <Row>
        <Col md={6}>
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
        </Col>
        <Col md={6}>
          <Form.Select
            className="mb-3"
            value={verifiedFilter}
            onChange={e => {
              setVerifiedFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Hospitals</option>
            <option value="verified">Only Verified</option>
            <option value="unverified">Only Unverified</option>
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center my-5"><Spinner animation="border" /></div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <Table responsive hover bordered className="hospital-table shadow-sm rounded">
            <thead className="table-header text-white custom-table-header">
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
                <th>License No.</th>
                <th>License Doc</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedHospitals.map((hospital, idx) => (
                <tr key={hospital._id} className="hospital-row">
                  <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td>
                    <img
                      src={
                        hospital.profileImage
                          ? `http://localhost:8000${hospital.profileImage}`
                          : '/images/default-avatar.png'
                      }
                      alt={hospital.name || "Profile"}
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        border: '2px solid #ccc',
                      }}
                    />
                  </td>
                  <td>{hospital.name || '-'}</td>
                  <td>{hospital.email || '-'}</td>
                  <td>{hospital.tel || '-'}</td>
                  <td>{hospital.address || '-'}</td>
                  <td>{hospital.licenseNumber || '-'}</td>
                  <td>
                    {hospital.officialDocument ? (
                      <a
                        href={`http://localhost:8000/uploads/${hospital.officialDocument}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-decoration-underline"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
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
                  <td>
                    <button onClick={() => handleEditClick(hospital)} title="Edit"><Pencil size={16} /></button>
                    <button onClick={() => confirmDelete(hospital)} title="Delete" className="delete"><Trash size={16} /></button>
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

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Hospital</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={editForm.address}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="tel"
                value={editForm.tel}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>License Number</Form.Label>
              <Form.Control
                type="text"
                name="licenseNumber"
                value={editForm.licenseNumber}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>License Document</Form.Label>
              {typeof editForm.licenseDocument === 'string' && editForm.licenseDocument && (
                <div className="mb-2">
                  <a
                    href={`http://localhost:8000/uploads/${editForm.licenseDocument}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Existing Document
                  </a>
                </div>
              )}
              <Form.Control
                type="file"
                name="licenseDocument"
                onChange={handleFileChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Verified"
                name="verified"
                checked={editForm.verified}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
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
