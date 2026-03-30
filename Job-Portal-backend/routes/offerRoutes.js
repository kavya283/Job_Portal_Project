const express = require("express");
const router = express.Router();

const {
  createOffer,
  completeInterview,
  getCandidateOffers,
  generateOfferPDF,
  getOfferById,
  acceptOffer,
  rejectOffer,
} = require("../controllers/offerController");

const { authMiddleware, employerOnly } = require("../middleware/authMiddleware");

/* ===========================
   CREATE OFFER
=========================== */
router.post("/", authMiddleware, employerOnly, createOffer);

/* ===========================
   COMPLETE INTERVIEW → OFFER
=========================== */
router.put("/complete/:id", authMiddleware, employerOnly, completeInterview);

/* ===========================
   GET LOGGED-IN USER OFFERS
=========================== */
router.get("/candidate/me", authMiddleware, getCandidateOffers);

/* ===========================
   GET OFFERS BY CANDIDATE ID
=========================== */
router.get("/candidate/:candidateId", authMiddleware, getCandidateOffers);

/* ===========================
   DOWNLOAD / GENERATE PDF
=========================== */
router.get("/generate/:id", authMiddleware, generateOfferPDF);

/* ===========================
   GET SINGLE OFFER
=========================== */
router.get("/:id", getOfferById);

/* ===========================
   ACCEPT / REJECT OFFER
=========================== */
router.put("/:id/accept", authMiddleware, acceptOffer);
router.put("/:id/reject", authMiddleware, rejectOffer);

module.exports = router;
