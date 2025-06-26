const express = require('express');
const router = express.Router();
const Campaign = require('../Models/Campaign');
const createUploader = require('../middlewares/upload');
const fs = require('fs');
const path = require('path');

const upload = createUploader('campaigns');

// Create campaign with image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    const imageUrl = req.file ? `campaigns/${req.file.filename}` : '';

    if (!title || !description || !date) {
      return res.status(400).json({ error: 'Title, description and date are required.' });
    }

    const newCampaign = new Campaign({ title, description, date, location, imageUrl });
    await newCampaign.save();
    
    res.status(201).json(newCampaign);
  } catch (err) {
    console.error('Campaign creation error:', err);
    res.status(500).json({ error: 'Server error creating campaign.' });
  }
});

// Get all campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ date: 1 });
    res.status(200).json(campaigns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get campaigns' });
  }
});

// Delete campaign by id
router.delete('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    // Delete image file if exists
    if (campaign.imageUrl) {
      const imagePath = path.join(__dirname, '..', campaign.imageUrl);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Failed to delete image file:', err);
      });
    }

    await Campaign.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Campaign deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// Edit campaign by id (PUT) with optional image upload
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    // If new image uploaded, delete old image file
    if (req.file && campaign.imageUrl) {
      const oldImagePath = path.join(__dirname, '..', campaign.imageUrl);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error('Failed to delete old image file:', err);
      });
    }

    // Update fields
    campaign.title = title || campaign.title;
    campaign.description = description || campaign.description;
    campaign.date = date || campaign.date;
    campaign.location = location || campaign.location;
    if (req.file) {
      campaign.imageUrl = `/campaigns/${req.file.filename}`;
    }

    await campaign.save();
    res.status(200).json(campaign);
  } catch (err) {
    console.error('Campaign update error:', err);
    res.status(500).json({ error: 'Server error updating campaign.' });
  }
});

module.exports = router;
