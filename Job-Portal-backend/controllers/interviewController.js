const mongoose = require("mongoose"); // ✅ FIX
const Interview = require("../models/Interview");
const Application = require("../models/Application");
const Notification = require("../models/Notification");
const { sendEmail } = require("../services/emailService");
const OfferLetter = require("../models/OfferLetter");
const User = require("../models/User"); // ✅ FIX


/* =====================================================
   1️⃣ Schedule Interview (Employer)
===================================================== */
const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, roundName, date, mode, meetingLink, location, message } = req.body;

    const employerId = req.user._id;

    const application = await Application.findById(applicationId)
        .populate("candidate", "name email")
        .populate("job", "title companyName");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (!application.employer) {
    application.employer = req.user._id;
    await application.save();
    }

    // 🛑 FIX: Safe comparison
    if (application.employer.toString() !== employerId.toString()) {
      return res.status(403).json({ message: "Unauthorized employer" });
    }

    const interview = await Interview.create({
      application: applicationId,
      roundName,
      date,
      mode,
      meetingLink: mode === "Online" ? meetingLink : "",
      location: mode === "Offline" ? location : "",
      message,
    });

    application.status = "interview_scheduled";
    await application.save();

    await Notification.create({
      recipient: application.candidate._id,
      recipientRole: "candidate",
      sender: employerId,
      job: application.job._id,
      message: `Interview scheduled for ${roundName}`,
      type: "INTERVIEW_SCHEDULED",
      companyName: application.job.companyName
    });
    await sendEmail(
        application.candidate.email,
        "Interview Scheduled",
        "interviewScheduled",
        {
            candidateName: application.candidate.name,
            companyName: application.job.companyName,
            jobTitle: application.job.title,
            roundName,
            date,
            mode,
            meetingLink,
            location,
            message,
        }
    );

    res.status(201).json({
      message: "Interview scheduled successfully",
      interview,
    });

  } catch (err) {
    console.error("Schedule Interview Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
/* =====================================================
   2️⃣ Get Employer Interviews
===================================================== */
const getEmployerInterviews = async (req, res) => {
  try {
    const employerId = req.user._id;

    const applications = await Application.find({
      employer: employerId,
    });

    const appIds = applications.map((a) => a._id);

    const interviews = await Interview.find({
      application: { $in: appIds },
    })
      .populate({
        path: "application",
        populate: ["candidate", "job"],
      })
      .sort({ date: 1 });

    res.json(interviews);

  } catch (err) {
    console.error("Employer Interviews Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


/* =====================================================
   3️⃣ Get Candidate Interviews
===================================================== */
const getCandidateInterviews = async (req, res) => {
  try {
    const candidateId = req.user._id;

    const applications = await Application.find({
      candidate: candidateId,
    });

    const appIds = applications.map((a) => a._id);

    const interviews = await Interview.find({
      application: { $in: appIds },
    })
      .populate({
        path: "application",
        populate: ["job", "employer"],
      })
      .sort({ date: 1 });

    res.json(interviews);

  } catch (err) {
    console.error("Candidate Interviews Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


/* =====================================================
   4️⃣ Candidate Respond (Accept / Decline)
===================================================== */
const respondInterview = async (req, res) => {
  try {
    const { status } = req.body; // ✅ FIXED (was response)
    const interviewId = req.params.id;

    console.log("📥 Status:", status);

    // ✅ Validate interview ID
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({ message: "Invalid interview ID" });
    }

    // ✅ Validate status
    if (!status || !["accepted", "rejected"].includes(status.toLowerCase())) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const interview = await Interview.findById(interviewId).populate({
      path: "application",
      populate: [
        { path: "candidate", select: "name email" },
        { path: "job", select: "title companyName" },
        { path: "employer", select: "name email" },
      ],
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const candidate = interview.application.candidate;

    // ✅ AUTH CHECK
    if (candidate._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const normalizedStatus = status.toLowerCase();

    // ✅ SAVE RESPONSE
    interview.candidateResponse = normalizedStatus;
    await interview.save();

    const job = interview.application.job;
    let employer = interview.application.employer;

    console.log("📧 Employer:", employer);

    // ✅ FETCH EMPLOYER IF EMAIL MISSING
    if (!employer?.email && employer?._id) {
      employer = await User.findById(employer._id).select("name email");
    }

    // ✅ SEND EMAIL (SAFE)
    if (employer?.email) {
      sendEmail(
        employer.email,
        `Candidate ${normalizedStatus} Interview`,
        "interviewResponse",
        {
          candidateName: candidate.name,
          companyName: job.companyName,
          jobTitle: job.title,
          roundName: interview.roundName,
          date: new Date(interview.date).toLocaleString(),
          mode: interview.mode,
          meetingLink: interview.meetingLink,
          location: interview.location,
          status: normalizedStatus,
        }
      ).catch((err) => console.error("Email failed:", err));
    }

    // ✅ NOTIFICATION
    if (employer?._id) {
      await Notification.create({
        recipient: employer._id,
        recipientRole: "employer",
        sender: candidate._id,
        job: job._id,
        message: `Candidate has ${normalizedStatus} the interview`,
        type: "STATUS_UPDATE",
      });
    }

    res.json({
      message: `Interview ${normalizedStatus}`,
      interview,
    });

  } catch (err) {
    console.error("❌ Respond Interview Error:", err);

    res.status(500).json({
      message: "Server Error",
      error: err.message, // 🔥 now you see real error
    });
  }
};

/* =====================================================
   5️⃣ Mark Interview Completed
===================================================== */
const completeInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate({
        path: "application",
        populate: [
          { path: "candidate", select: "name email" },
          { path: "job", select: "title companyName" },
        ],
      });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (
      interview.application.employer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    /* ================= UPDATE STATUS ================= */
    interview.status = "completed";
    await interview.save();

    const candidate = interview.application.candidate;
    const job = interview.application.job;

    /* ================= PREVENT DUPLICATE OFFER ================= */
    const existingOffer = await OfferLetter.findOne({
      candidate: candidate._id,
      job: job._id,
    });

    let offer = null;

    if (!existingOffer) {
      /* ================= CREATE OFFER ================= */
      offer = await OfferLetter.create({
        candidate: candidate._id,
        job: job._id,
        salary: "500000", // 👉 you can make dynamic later
        joiningDate: new Date(),
      });

      /* ================= NOTIFICATION ================= */
      await Notification.create({
        recipient: candidate._id,
        recipientRole: "candidate",
        sender: req.user._id,
        job: job._id,
        message: "🎉 You have received an Offer Letter!",
        type: "OFFER_SENT",
      });

      /* ================= EMAIL ================= */
      await sendEmail(
        candidate.email,
        "Offer Letter",
        "offerLetter", // 👉 make sure this template exists
        {
          candidateName: candidate.name,
          jobTitle: job.title,
          companyName: job.companyName,
        }
      );
    }

    res.json({
      message: "Interview marked completed",
      interview,
      offerCreated: !existingOffer,
      offer,
    });

  } catch (err) {
    console.error("Complete Interview Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
/* =====================================================
   6️⃣ Delete Interview
===================================================== */
const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate("application");

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.application.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await interview.deleteOne();

    res.json({
      message: "Interview deleted successfully",
    });

  } catch (err) {
    console.error("Delete Interview Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  scheduleInterview,
  getEmployerInterviews,
  getCandidateInterviews,
  respondInterview,
  completeInterview,
  deleteInterview,
};
