const OfferLetter = require("../models/OfferLetter");
const Application = require("../models/Application");
const Interview = require("../models/Interview");
const { createAndSendNotification } = require("../services/notificationService");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

/* =====================================================
   REUSABLE PDF GENERATOR
===================================================== */
const generateStyledPDF = (filePath, data) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke("#e5e7eb");
  doc.fontSize(24).fillColor("#4f46e5").text("OFFER LETTER", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor("#6b7280").text(`Date: ${new Date().toDateString()}`, { align: "right" });
  doc.moveDown(2);

  doc.fontSize(18).fillColor("#111827").text(data.companyName);
  doc.moveDown(1);

  doc.fontSize(13).text("To,").text(data.candidateName).text(`Email: ${data.email}`);
  doc.moveDown(2);

  doc.fontSize(13).fillColor("#000").text("Subject: Offer of Employment", { underline: true });
  doc.moveDown(1.5);

  doc.fontSize(12).fillColor("#374151").text(`Dear ${data.candidateName},`);
  doc.moveDown();
  doc.text(
    `We are pleased to offer you the position of ${data.jobTitle} at ${data.companyName}.`,
    { align: "justify", lineGap: 4 }
  );

  doc.moveDown();

  const boxY = doc.y;
  doc.rect(doc.x, boxY, 500, 95).fill("#f3f4f6").stroke();

  doc.fillColor("#111827").fontSize(12)
    .text(`Position: ${data.jobTitle}`, doc.x + 10, boxY + 10)
    .text(`Salary: ₹${data.salary}`, doc.x + 10, boxY + 30)
    .text(`Joining Date: ${data.joiningDate}`, doc.x + 10, boxY + 50);

  doc.moveDown(6);

  doc.text("We look forward to working with you!");
  doc.moveDown(2);

  doc.text("Sincerely,");
  doc.moveDown(1);
  doc.text(data.companyName);

  doc.end();

  return new Promise((resolve) => stream.on("finish", resolve));
};

/* =====================================================
   CREATE OFFER
===================================================== */
const createOffer = async (req, res) => {
  try {
    const { candidate, job, salary, joiningDate } = req.body;

    if (!candidate || !job) {
      return res.status(400).json({ message: "Missing data" });
    }

    console.log("📥 Incoming:", { candidate, job });

    /* ✅ FIND APPLICATION */
    let application = await Application.findOne({ candidate, job })
      .populate("candidate", "name email")
      .populate("job", "title companyName");

    if (!application) {
      console.log("⚠️ Fallback search...");
      application = await Application.findOne({ candidate })
        .populate("candidate", "name email")
        .populate("job", "title companyName");
    }

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    /* ✅ CHECK EXISTING OFFER */
    const existing = await OfferLetter.findOne({
      candidate: application.candidate._id,
      job: application.job._id,
    });

    if (existing) {
      return res.status(400).json({ message: "Offer already exists" });
    }

    /* ✅ CREATE OFFER */
    const offer = await OfferLetter.create({
      candidate: application.candidate._id,
      job: application.job._id,
      salary,
      joiningDate,
      status: "sent",
    });

    /* ✅ 🔥 UPDATE APPLICATION STATUS (MAIN FIX) */
    application.status = "offer_sent";
    await application.save();

    /* ✅ CREATE PDF */
    if (!fs.existsSync("./offers")) fs.mkdirSync("./offers");

    const filePath = `./offers/offer-${offer._id}.pdf`;

    await generateStyledPDF(filePath, {
      candidateName: application.candidate.name,
      email: application.candidate.email,
      jobTitle: application.job.title,
      companyName: application.job.companyName,
      salary,
      joiningDate: new Date(joiningDate).toDateString(),
    });

    offer.offerPDF = `offers/offer-${offer._id}.pdf`;
    await offer.save();

    /* ✅ NOTIFICATION */
    const io = req.app.get("socketio");

    await createAndSendNotification(io, {
      recipientId: application.candidate._id,
      recipientEmail: application.candidate.email,
      senderId: req.user._id,
      jobId: application.job._id,
      type: "OFFER_SENT",
      sendEmail: true,
      subject: "🎉 Offer Letter Received",
      message: `🎉 Offer from ${application.job.companyName}`,
      candidateName: application.candidate.name,
      jobTitle: application.job.title,
      companyName: application.job.companyName,
      offer,
      attachments: [{ filename: "OfferLetter.pdf", path: filePath }],
      portalLink: "http://localhost:3000/dashboard",
    });

    res.json({ message: "Offer created & email sent", offer });

  } catch (err) {
    console.error("❌ Create Offer Error:", err);
    res.status(500).json({ message: "Failed to create offer" });
  }
};

/* =====================================================
   COMPLETE INTERVIEW → OFFER
===================================================== */
const completeInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate({
      path: "application",
      populate: [
        { path: "candidate", select: "name email" },
        { path: "job", select: "title companyName" },
      ],
    });

    if (!interview) return res.status(404).json({ message: "Interview not found" });

    interview.status = "completed";
    await interview.save();

    const application = interview.application;

    /* ✅ UPDATE STATUS */
    application.status = "offer_sent";
    await application.save();

    const candidate = application.candidate;
    const job = application.job;

    let offer = await OfferLetter.findOne({ candidate: candidate._id, job: job._id });

    if (!offer) {
      offer = await OfferLetter.create({
        candidate: candidate._id,
        job: job._id,
        salary: "500000",
        joiningDate: new Date(),
        status: "sent",
      });
    }

    if (!fs.existsSync("./offers")) fs.mkdirSync("./offers");

    const filePath = `./offers/offer-${offer._id}.pdf`;

    await generateStyledPDF(filePath, {
      candidateName: candidate.name,
      email: candidate.email,
      jobTitle: job.title,
      companyName: job.companyName,
      salary: offer.salary,
      joiningDate: new Date().toDateString(),
    });

    offer.offerPDF = `offers/offer-${offer._id}.pdf`;
    await offer.save();

    res.json({ message: "Interview completed & offer sent", interview, offer });

  } catch (err) {
    console.error("❌ Complete Interview Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
/* =====================================================
   GET CANDIDATE OFFERS
===================================================== */
const getCandidateOffers = async (req, res) => {
  try {
    const candidateId = req.params.candidateId || req.user._id;

    const offers = await OfferLetter.find({ candidate: candidateId })
      .populate("job", "title companyName")
      .sort({ createdAt: -1 });

    res.json(offers);
  } catch (err) {
    console.error("❌ Get Candidate Offers Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   GET SINGLE OFFER
===================================================== */
const getOfferById = async (req, res) => {
  try {
    const offer = await OfferLetter.findById(req.params.id);
    res.json(offer);
  } catch (err) {
    res.status(500).json({ message: "Error fetching offer" });
  }
};

/* =====================================================
   ACCEPT OFFER
===================================================== */
const acceptOffer = async (req, res) => {
  try {
    const offer = await OfferLetter.findByIdAndUpdate(
      req.params.id,
      { status: "accepted" },
      { new: true }
    );

    // 🔥 ALSO UPDATE APPLICATION STATUS
    await Application.findOneAndUpdate(
      { candidate: offer.candidate, job: offer.job },
      { status: "hired" }
    );

    res.json(offer);
  } catch (err) {
    res.status(500).json({ message: "Error accepting offer" });
  }
};

/* =====================================================
   REJECT OFFER
===================================================== */
const rejectOffer = async (req, res) => {
  try {
    const offer = await OfferLetter.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    await Application.findOneAndUpdate(
      { candidate: offer.candidate, job: offer.job },
      { status: "rejected" }
    );

    res.json(offer);
  } catch (err) {
    res.status(500).json({ message: "Error rejecting offer" });
  }
};

/* =====================================================
   DOWNLOAD PDF
===================================================== */
const generateOfferPDF = async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../offers", `offer-${req.params.id}.pdf`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "PDF not found" });
    }

    res.download(filePath, `OfferLetter-${req.params.id}.pdf`);
  } catch (err) {
    res.status(500).json({ message: "Error downloading PDF" });
  }
};
/* =====================================================
   DELETE OFFER
===================================================== */
const deleteOffer = async (req, res) => {
  try {
    const offer = await OfferLetter.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // ❌ Prevent deleting accepted offers (best practice)
    if (offer.status === "accepted") {
      return res.status(400).json({ message: "Cannot delete accepted offer" });
    }

    // ✅ Delete PDF if exists
    if (offer.offerPDF) {
      const filePath = path.join(__dirname, "..", offer.offerPDF);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // ✅ Delete offer
    await offer.deleteOne();

    // ✅ OPTIONAL: Reset application status
    await Application.findOneAndUpdate(
      { candidate: offer.candidate, job: offer.job },
      { status: "interview_scheduled" } // or "applied" based on your flow
    );

    res.json({ message: "Offer deleted successfully" });

  } catch (err) {
    console.error("❌ Delete Offer Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===================================================== */
module.exports = {
  createOffer,
  completeInterview,
  getCandidateOffers,
  getOfferById,
  acceptOffer,
  rejectOffer,
  generateOfferPDF,
  generateStyledPDF,
  deleteOffer,
};
