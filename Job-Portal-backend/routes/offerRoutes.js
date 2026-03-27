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

const {
  authMiddleware,
  employerOnly,
} = require("../middleware/authMiddleware");

/* ===========================
   CREATE OFFER
=========================== */
router.post("/", authMiddleware, employerOnly, createOffer);

/* ===========================
   COMPLETE INTERVIEW → OFFER
=========================== */
router.put("/complete/:id", authMiddleware, employerOnly, completeInterview);

/* ===========================
   GET CANDIDATE OFFERS
=========================== */
router.get("/candidate/:candidateId", authMiddleware, getCandidateOffers);

/* ===========================
   DOWNLOAD PDF
=========================== */
router.get("/generate/:id", generateOfferPDF);

/* ===========================
   GET SINGLE OFFER
=========================== */
router.get("/:id", getOfferById);

/* ===========================
   ACCEPT / REJECT
=========================== */
router.put("/:id/accept", authMiddleware, acceptOffer);
router.put("/:id/reject", authMiddleware, rejectOffer);

module.exports = router;
