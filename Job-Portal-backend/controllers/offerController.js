const OfferLetter = require("../models/OfferLetter");
const Application = require("../models/Application");
const Interview = require("../models/Interview");
const { createAndSendNotification } = require("../services/notificationService");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const mongoose = require("mongoose");

/* =====================================================
   CREATE OFFER (FROM FRONTEND)
===================================================== */
const createOffer = async (req, res) => {
  try {
    const { candidate, job, salary, joiningDate } = req.body;

    if (!candidate || !job) {
      return res.status(400).json({ message: "Missing data" });
    }

    const application = await Application.findOne({ candidate, job })
      .populate("candidate", "name email")
      .populate("job", "title companyName");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // ✅ Prevent duplicate
    let existing = await OfferLetter.findOne({ candidate, job });
    if (existing) {
      return res.status(400).json({ message: "Offer already exists" });
    }

    // ✅ Create offer
    const offer = await OfferLetter.create({
      candidate: new mongoose.Types.ObjectId(candidate),
      job: new mongoose.Types.ObjectId(job),
      salary,
      joiningDate,
      status: "sent",
    });

    /* ================= PDF ================= */
    if (!fs.existsSync("./offers")) fs.mkdirSync("./offers");

    const filePath = `./offers/offer-${offer._id}.pdf`;

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(22).text("OFFER LETTER", { align: "center" });
    doc.moveDown();
    doc.text(`Candidate: ${application.candidate.name}`);
    doc.text(`Job Title: ${application.job.title}`);
    doc.text(`Company: ${application.job.companyName}`);
    doc.text(`Salary: ₹${salary}`);
    doc.text(`Joining Date: ${joiningDate}`);
    doc.moveDown();
    doc.text("Congratulations! Welcome to the team 🎉");

    doc.end();

    stream.on("finish", async () => {
      try {
        const io = req.app.get("socketio");

        // ✅ Save PDF path
        offer.offerPDF = `offers/offer-${offer._id}.pdf`;
        await offer.save();

        console.log("📎 PDF created:", offer.offerPDF);

        // ✅ Send email + notification
        await createAndSendNotification(io, {
          recipientId: application.candidate._id,
          recipientEmail: application.candidate.email,

          senderId: req.user._id,
          jobId: job,

          type: "OFFER_SENT",
          sendEmail: true,

          subject: "🎉 Offer Letter Received",
          message: `🎉 Offer from ${application.job.companyName}`,

          candidateName: application.candidate.name,
          jobTitle: application.job.title,
          companyName: application.job.companyName,

          // ✅ ATTACH PDF
          attachments: [
            {
              filename: "OfferLetter.pdf",
              path: `./offers/offer-${offer._id}.pdf`,
            },
          ],

          portalLink: "http://localhost:3000/dashboard",
        });

        res.json({
          message: "Offer created & email sent",
          offer,
        });

      } catch (err) {
        console.error("❌ Post-PDF Error:", err);
        res.status(500).json({ message: "Email failed" });
      }
    });

  } catch (err) {
    console.error("❌ Create Offer Error:", err);
    res.status(500).json({ message: "Failed to create offer" });
  }
};

/* =====================================================
   COMPLETE INTERVIEW → AUTO OFFER
===================================================== */
const completeInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate({
      path: "application",
      populate: [
        { path: "candidate", select: "name email" },
        { path: "job", select: "title companyName" },
        { path: "employer", select: "_id" },
      ],
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (
      interview.application.employer._id.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    interview.status = "completed";
    await interview.save();

    await Application.findByIdAndUpdate(interview.application._id, {
      status: "interview_completed",
    });

    const candidate = interview.application.candidate;
    const job = interview.application.job;

    let offer = await OfferLetter.findOne({
      candidate: candidate._id,
      job: job._id,
    });

    if (!offer) {
      offer = await OfferLetter.create({
        candidate: candidate._id,
        job: job._id,
        salary: "500000",
        joiningDate: new Date(),
        status: "sent",
      });
    }

    /* ================= PDF ================= */
    if (!fs.existsSync("./offers")) fs.mkdirSync("./offers");

    const filePath = `./offers/offer-${offer._id}.pdf`;

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(22).text("OFFER LETTER", { align: "center" });
    doc.moveDown();
    doc.text(`Candidate: ${candidate.name}`);
    doc.text(`Job Title: ${job.title}`);
    doc.text(`Company: ${job.companyName}`);
    doc.text(`Salary: ₹${offer.salary}`);
    doc.text(`Joining Date: ${new Date().toDateString()}`);
    doc.moveDown();
    doc.text("Welcome to the team 🎉");

    doc.end();

    stream.on("finish", async () => {
      try {
        const io = req.app.get("socketio");

        offer.offerPDF = `offers/offer-${offer._id}.pdf`;
        await offer.save();

        await createAndSendNotification(io, {
          recipientId: candidate._id,
          recipientEmail: candidate.email,

          senderId: req.user._id,
          jobId: job._id,

          type: "OFFER_SENT",
          sendEmail: true,

          subject: "🎉 Offer Letter Received",
          message: `🎉 Offer from ${job.companyName}`,

          candidateName: candidate.name,
          jobTitle: job.title,
          companyName: job.companyName,

          attachments: [
            {
              filename: "OfferLetter.pdf",
              path: `./offers/offer-${offer._id}.pdf`,
            },
          ],

          portalLink: "http://localhost:3000/dashboard",
        });

        res.json({
          message: "Interview completed & offer sent",
          interview,
          offer,
        });

      } catch (err) {
        console.error("❌ Email Error:", err);
        res.status(500).json({ message: "Email failed" });
      }
    });

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
    const offers = await OfferLetter.find({
      candidate: new mongoose.Types.ObjectId(req.params.candidateId),
    })
      .populate("job", "title companyName")
      .sort({ createdAt: -1 });

    res.json(offers);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   OTHER FUNCTIONS
===================================================== */
const getOfferById = async (req, res) => {
  const offer = await OfferLetter.findById(req.params.id);
  res.json(offer);
};

const acceptOffer = async (req, res) => {
  const offer = await OfferLetter.findByIdAndUpdate(
    req.params.id,
    { status: "accepted" },
    { new: true }
  );
  res.json(offer);
};

const rejectOffer = async (req, res) => {
  const offer = await OfferLetter.findByIdAndUpdate(
    req.params.id,
    { status: "rejected" },
    { new: true }
  );
  res.json(offer);
};

const generateOfferPDF = async (req, res) => {
  const filePath = `./offers/offer-${req.params.id}.pdf`;

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "PDF not found" });
  }

  res.download(filePath);
};

module.exports = {
  createOffer,
  completeInterview,
  getCandidateOffers,
  generateOfferPDF,
  getOfferById,
  acceptOffer,
  rejectOffer,
};
