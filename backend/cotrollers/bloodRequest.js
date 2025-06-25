const BloodRequest = require('../Models/BloodRequest');
const Donor = require('../Models/Donor'); 

const createBloodRequest = async (req, res) => {
  try {
    const { bloodGroup, amount, caseDescription, urgency } = req.body;
    const hospitalId = req.user.userId;

    const newRequest = new BloodRequest({
      hospital: hospitalId,
      bloodGroup,
      amount,
      caseDescription,
      urgency
    });

    await newRequest.save();
    res.status(201).json({ success: true, message: "Blood request submitted!", request: newRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to submit request." });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find().populate('hospital', 'name email').sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blood requests' });
  }
};

const approveRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id).populate('hospital');
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const { bloodGroup, amount } = request;
    const requestedAmount = amount;

    // Aggregate total available units from donationHistory
    const donors = await Donor.find({ 'donationHistory.bloodgroup': bloodGroup });

    let totalAvailable = 0;

    for (let donor of donors) {
      const totalFromDonor = donor.donationHistory
        .filter(d => d.bloodgroup === bloodGroup)
        .reduce((sum, entry) => sum + entry.amount, 0);

      totalAvailable += totalFromDonor;
    }

    if (totalAvailable < requestedAmount) {
      request.status = 'Rejected';
      await request.save();
      return res.status(200).json({ 
        message: 'Not sufficient amount of blood, so the request is rejected by Admin',
        status: 'Rejected'
      });
    }

    // Deduct donation from donors
    let amountLeft = requestedAmount;
    for (let donor of donors) {
      for (let entry of donor.donationHistory) {
        if (entry.bloodgroup !== bloodGroup) continue;
        if (amountLeft <= 0) break;

        const deduct = Math.min(entry.amount, amountLeft);
        entry.amount -= deduct;
        amountLeft -= deduct;
      }
      await donor.save();
      if (amountLeft <= 0) break;
    }

    request.status = 'Approved';
    await request.save();

    res.status(200).json({ 
      message: 'The request is approved by the Admin',
      status: 'Approved',
      hospitalId: request.hospital._id 
    });

  } catch (err) {
    console.error('Error approving request:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to process request' }); 
  }
};

const rejectRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = 'Rejected';
    await request.save();

    res.status(200).json({ message: 'Request rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject request' });
  }
};

// Add to bloodRequest.js controller
const getRequestsByHospital = async (req, res) => {
  try {
    const hospitalId = req.user.userId;
    const requests = await BloodRequest.find({ hospital: hospitalId }).sort({ createdAt: -1 });
    
    res.status(200).json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch hospital requests' });
  }
};


module.exports = { createBloodRequest, getAllRequests, rejectRequest, approveRequest, getRequestsByHospital };
