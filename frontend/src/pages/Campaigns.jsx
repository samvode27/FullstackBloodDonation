import React, { useState, useEffect } from 'react';
import { adminRequest } from '../requestMethods';
import toast from 'react-hot-toast';
import './Campaigns.css';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    imageFile: null,
    imagePreview: null,
  });
  const [editingCampaign, setEditingCampaign] = useState(null); // campaign being edited
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    imageFile: null,
    imagePreview: null,
  });
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await adminRequest.get('/campaign');
      setCampaigns(res.data);
    } catch (err) {
      toast.error('Failed to fetch campaigns');
    }
  };

  // Form input handlers for add
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Image input handler for add
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({
        ...form,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  // Submit new campaign
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.date) {
      return toast.error('Please fill in required fields.');
    }

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('date', form.date);
      formData.append('location', form.location);
      if (form.imageFile) formData.append('image', form.imageFile);

      await adminRequest.post('/campaign', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Campaign added!');
      setForm({ title: '', description: '', date: '', location: '', imageFile: null, imagePreview: null });
      fetchCampaigns();
    } catch {
      toast.error('Failed to add campaign.');
    }
  };

  // Delete campaign
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await adminRequest.delete(`/campaign/${id}`);
      toast.success('Campaign deleted');
      fetchCampaigns();
    } catch {
      toast.error('Failed to delete campaign');
    }
  };

  // Open edit modal and fill form
  const openEditModal = (campaign) => {
    setEditingCampaign(campaign);
    setEditForm({
      title: campaign.title,
      description: campaign.description,
      date: campaign.date.split('T')[0], // format yyyy-mm-dd
      location: campaign.location || '',
      imageFile: null,
      imagePreview: campaign.imageUrl || null,
    });
    setShowEditModal(true);
  };

  // Edit form input handler
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Edit image input handler
  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm({
        ...editForm,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  // Submit edit form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.title || !editForm.description || !editForm.date) {
      return toast.error('Please fill in required fields.');
    }

    try {
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('description', editForm.description);
      formData.append('date', editForm.date);
      formData.append('location', editForm.location);
      if (editForm.imageFile) formData.append('image', editForm.imageFile);

      await adminRequest.put(`/campaign/${editingCampaign._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Campaign updated!');
      setShowEditModal(false);
      setEditingCampaign(null);
      fetchCampaigns();
    } catch {
      toast.error('Failed to update campaign.');
    }
  };

  // Close edit modal and reset
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingCampaign(null);
    setEditForm({ title: '', description: '', date: '', location: '', imageFile: null, imagePreview: null });
  };

  return (
    <div className="campaigns-container p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-red-600">Manage Campaigns</h2>

      {/* Add Campaign Form */}
      <form onSubmit={handleSubmit} className="mb-10 space-y-4 bg-white p-6 rounded-lg shadow-md">
        <input
          type="text"
          name="title"
          placeholder="Campaign Title*"
          value={form.title}
          onChange={handleChange}
          className="input-field"
          required
        />
        <textarea
          name="description"
          placeholder="Description*"
          value={form.description}
          onChange={handleChange}
          className="input-field h-24 resize-none"
          required
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="input-field"
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location (optional)"
          value={form.location}
          onChange={handleChange}
          className="input-field"
        />

        <div>
          <label className="block mb-1 font-semibold">Campaign Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
          />
          {form.imagePreview && (
            <img
              src={form.imagePreview}
              alt="Preview"
              className="mt-3 w-48 h-32 object-cover rounded shadow"
            />
          )}
        </div>

        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 transition rounded-md px-6 py-2 text-white font-semibold"
        >
          Add Campaign
        </button>
      </form>

      {/* Existing Campaigns */}
      <h3 className="text-2xl font-semibold mb-6 text-gray-700">Existing Campaigns</h3>

      {campaigns.length === 0 ? (
        <p className="text-gray-500 text-center">No campaigns created yet.</p>
      ) : (
        <ul className="space-y-6">
          {campaigns.map(({ _id, title, description, date, location, imageUrl }) => (
            <li
              key={_id}
              className="border p-4 rounded-lg shadow hover:shadow-lg transition flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              {imageUrl ? (
                <img
                  src={`http://localhost:8000/uploads/${imageUrl}`}
                  alt={title}
                  className="w-32 h-24 object-cover rounded"
                />
              ) : (
                <div className="bg-gray-200 w-32 h-24 flex items-center justify-center text-gray-400 italic rounded">
                  No Image
                </div>
              )}

              <div className="flex-grow">
                <h4 className="text-lg font-bold">{title}</h4>
                <p className="text-gray-700 line-clamp-3">{description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(date).toLocaleDateString()} {location && `| ${location}`}
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                  onClick={() => openEditModal({ _id, title, description, date, location, imageUrl })}
                  title="Edit Campaign"
                >
                  ✏️ Edit
                </button>
                <button
                  className="text-red-600 hover:text-red-800 font-semibold"
                  onClick={() => handleDelete(_id)}
                  title="Delete Campaign"
                >
                  🗑 Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Edit Campaign</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Campaign Title*"
                value={editForm.title}
                onChange={handleEditChange}
                className="input-field"
                required
              />
              <textarea
                name="description"
                placeholder="Description*"
                value={editForm.description}
                onChange={handleEditChange}
                className="input-field h-24 resize-none"
                required
              />
              <input
                type="date"
                name="date"
                value={editForm.date}
                onChange={handleEditChange}
                className="input-field"
                required
              />
              <input
                type="text"
                name="location"
                placeholder="Location (optional)"
                value={editForm.location}
                onChange={handleEditChange}
                className="input-field"
              />

              <div>
                <label className="block mb-1 font-semibold">Campaign Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="file-input"
                />
                {editForm.imagePreview && (
                  <img
                    src={editForm.imagePreview}
                    alt="Preview"
                    className="mt-3 w-48 h-32 object-cover rounded shadow"
                  />
                )}
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 transition rounded-md px-6 py-2 text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
