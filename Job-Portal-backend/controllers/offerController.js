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
    `We are pleased to offer you the position of ${data.jobTitle} at ${data.companyName}. Based on your qualifications, we believe you will be a great addition to our team.`,
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

  doc.fontSize(12).fillColor("#374151").text(
    "This offer is subject to company policies and successful completion of onboarding formalities.",
    { align: "justify" }
  );
  doc.moveDown();
  doc.text("Please log in to the portal to accept or reject this offer.", { lineGap: 4 });
  doc.moveDown(2);

  doc.fillColor("#111827").text("We look forward to working with you!");
  doc.moveDown(2);
  doc.text("Sincerely,");
  doc.moveDown(1);
  doc.text(data.companyName);

  doc.moveDown(2);
  doc.moveTo(doc.x, doc.y).lineTo(doc.x + 200, doc.y).stroke();
  doc.text("Authorized Signature");

  doc.end();

  return new Promise((resolve) => stream.on("finish", resolve));
};

/* =====================================================
   CREATE OFFER
===================================================== */
const createOffer = async (req, res) => {
  try {
    const { candidate, job, salary, joiningDate } = req.body;
    if (!candidate || !job) return res.status(400).json({ message: "Missing data" });

    const application = await Application.findOne({ candidate, job })
      .populate("candidate", "name email")
      .populate("job", "title companyName");

    if (!application) return res.status(404).json({ message: "Application not found" });

    let existing = await OfferLetter.findOne({ candidate, job });
    if (existing) return res.status(400).json({ message: "Offer already exists" });

    const offer = await OfferLetter.create({ candidate, job, salary, joiningDate, status: "sent" });

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

    const io = req.app.get("socketio");
    offer.offerPDF = `offers/offer-${offer._id}.pdf`;
    await offer.save();

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
        { path: "employer", select: "_id" },
      ],
    });

    if (!interview) return res.status(404).json({ message: "Interview not found" });

    interview.status = "completed";
    await interview.save();

    const candidate = interview.application.candidate;
    const job = interview.application.job;

    let offer = await OfferLetter.findOne({ candidate: candidate._id, job: job._id });
    if (!offer) offer = await OfferLetter.create({ candidate: candidate._id, job: job._id, salary: "500000", joiningDate: new Date(), status: "sent" });

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
      offer,
      attachments: [{ filename: "OfferLetter.pdf", path: filePath }],
      portalLink: "http://localhost:3000/dashboard",
    });

    res.json({ message: "Interview completed & offer sent", interview, offer });
  } catch (err) {
    console.error("❌ Complete Interview Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* =====================================================
   GET CANDIDATE OFFERS (BY ID)
===================================================== */
const getCandidateOffers = async (req, res) => {
  try {
    let candidateId = req.params.candidateId;

    // If calling `/candidate/me`, use logged-in user
    if (!candidateId && req.user) candidateId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(candidateId))
      return res.status(400).json({ message: "Invalid candidate ID" });

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
  const offer = await OfferLetter.findById(req.params.id);
  res.json(offer);
};

/* =====================================================
   ACCEPT / REJECT OFFER
===================================================== */
const acceptOffer = async (req, res) => {
  const offer = await OfferLetter.findByIdAndUpdate(req.params.id, { status: "accepted" }, { new: true });
  res.json(offer);
};

const rejectOffer = async (req, res) => {
  const offer = await OfferLetter.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
  res.json(offer);
};

/* =====================================================
   DOWNLOAD / GENERATE PDF
===================================================== */
const generateOfferPDF = async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../offers", `offer-${req.params.id}.pdf`);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "PDF not found" });

    res.download(filePath, `OfferLetter-${req.params.id}.pdf`, (err) => {
      if (err) {
        console.error("❌ Error sending PDF:", err);
        if (!res.headersSent) res.status(500).json({ message: "Failed to download PDF" });
      }
    });
  } catch (err) {
    console.error("❌ Generate PDF Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createOffer,
  completeInterview,
  getCandidateOffers,
  getOfferById,
  acceptOffer,
  rejectOffer,
  generateOfferPDF,
  generateStyledPDF, // exported for internal use
};
