const express = require("express");
const router = express.Router();
const { createBloodRequest, getAllRequests, approveRequest, rejectRequest, getRequestsByHospital } = require("../cotrollers/bloodRequest");
const { identifier } = require("../middlewares/identification");
const { verifyToken } = require("../middlewares/verifyToken");

router.post("/request", verifyToken, createBloodRequest);

// Get all requests (admin)
router.get('/', getAllRequests);

// Approve request
router.patch('/:id/approve', approveRequest);

// Reject request
router.patch('/:id/reject', rejectRequest);

//Request History
router.get('/myrequests', verifyToken, getRequestsByHospital);


module.exports = router;
