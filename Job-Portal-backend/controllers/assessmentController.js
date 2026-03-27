const Assessment = require("../models/Assessment");
const Application = require("../models/Application");
const Job = require("../models/Job");
const XLSX = require("xlsx");
const { sendEmail } = require("../services/emailService");
const { createAndSendNotification } = require("../services/notificationService");

/* ======================================================
   CREATE ASSESSMENT (Employer)
====================================================== */
exports.createAssessment = async (req, res) => {
  try {
    const { questions } = req.body;

    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const existingAssessment = await Assessment.findOne({
      job: req.params.jobId
    });

    if (existingAssessment) {
      return res.status(400).json({
        message: "Assessment already exists for this job"
      });
    }

    const assessment = await Assessment.create({
      job: req.params.jobId,
      questions
    });

    await Job.findByIdAndUpdate(req.params.jobId, {
      hasAssessment: true
    });

    res.status(201).json({
      message: "Assessment created successfully",
      assessment
    });

  } catch (err) {
    console.error("Create Assessment Error:", err.message);
    res.status(500).json({ message: "Failed to create assessment" });
  }
};


/* ======================================================
   START ASSESSMENT (Candidate)
====================================================== */
exports.startAssessment = async (req, res) => {
  try {
    const candidateId = req.user.id;

    const application = await Application.findOne({
      job: req.params.jobId,
      candidate: candidateId
    });

    if (!application) {
      return res.status(403).json({
        message: "You must apply to this job first"
      });
    }

    if (application.assessmentStatus === "completed") {
      return res.status(400).json({
        message: "Assessment already completed"
      });
    }

    const assessment = await Assessment.findOne({
      job: req.params.jobId
    });

    if (!assessment) {
      return res.status(404).json({
        message: "Assessment not available"
      });
    }

    application.assessmentStatus = "in_progress";
    await application.save();

    res.json({
      assessmentId: assessment._id,
      questions: assessment.questions
    });

  } catch (err) {
    console.error("Start Assessment Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


/* ======================================================
   SUBMIT ASSESSMENT (WITH NOTIFICATION + EMAIL)
====================================================== */
exports.submitAssessment = async (req, res) => {
  try {
    const { answers } = req.body;

    const assessment = await Assessment.findOne({
      job: req.params.jobId
    });

    if (!assessment) {
      return res.status(404).json({
        message: "Assessment not found"
      });
    }

    let score = 0;

    answers.forEach((ans) => {
      const question = assessment.questions[ans.questionIndex];
      if (!question) return;

      const correctAnswer = question.correctAnswer;

      if (
        String(ans.selectedOption).trim().toLowerCase() ===
        String(correctAnswer).trim().toLowerCase()
      ) {
        score++;
      }
    });

    const totalQuestions = assessment.questions.length;

    const result =
      score >= totalQuestions * 0.6 ? "pass" : "fail";

    // ✅ UPDATE APPLICATION + POPULATE JOB (IMPORTANT FIX)
    const application = await Application.findOneAndUpdate(
      {
        job: req.params.jobId,
        candidate: req.user.id
      },
      {
        assessmentScore: score,
        assessmentResult: result,
        assessmentStatus: "completed",
        status: "assessment_submitted"
      },
      { new: true }
    )
      .populate("candidate", "name email")
      .populate("job", "title companyName"); // ✅ FIX

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    const io = req.app.get("socketio");

    // 🔥 BETTER RESULT TEXT
    const resultText = result === "pass" ? "PASSED ✅" : "FAILED ❌";

    // 🔔 NOTIFICATION + 📧 EMAIL (FULLY FIXED)
    await createAndSendNotification(io, {
      recipientId: application.candidate._id,
      recipientEmail: application.candidate.email,
      senderId: application.employer,
      jobId: req.params.jobId,

      type: "STATUS_UPDATE",
      message: `📝 Assessment Result: You ${resultText} (${score}/${totalQuestions})`,
      sendEmail: true,
      subject: "📝 Your Assessment Result",
      template: "assessmentResult",
      // ✅ REQUIRED DATA
      name: application.candidate.name,
      jobTitle: application.job?.title || "Job Role",
      companyName: application.job?.companyName || "",
      status: result,
      score,
      totalQuestions,
      // 🔥 ADD THIS (VERY IMPORTANT)
      portalLink: "http://localhost:3000/dashboard"
    });

    await sendEmail(
      application.candidate.email,
      "📝 Assessment Result",
      "assessmentResult",
      {
        name: application.candidate.name,
        jobTitle: application.job?.title,
        companyName: application.job?.companyName,
        status: result,
        score,
        totalQuestions,
        portalLink: "http://localhost:3000/dashboard"
      }
    );

    res.json({
      message: "Assessment submitted successfully",
      score,
      totalQuestions,
      result
    });

  } catch (err) {
    console.error("Submit Assessment Error:", err.message);
    res.status(500).json({ message: "Submission failed" });
  }
};

/* ======================================================
   GET CANDIDATE RESULT
====================================================== */
exports.getCandidateResult = async (req, res) => {
  try {
    const application = await Application.findOne({
      job: req.params.jobId,
      candidate: req.user.id
    });

    const assessment = await Assessment.findOne({
      job: req.params.jobId
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    res.json({
      assessmentScore: application.assessmentScore || 0,
      assessmentResult: application.assessmentResult || "fail",
      assessmentStatus: application.assessmentStatus || "pending",
      totalQuestions: assessment?.questions?.length || 0
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch result" });
  }
};


/* ======================================================
   EMPLOYER VIEW ALL RESULTS
====================================================== */
exports.getJobAssessmentResults = async (req, res) => {
  try {
    const applications = await Application.find({
      job: req.params.jobId
    })
      .populate("candidate", "name email")
      .select(
        "candidate resume assessmentScore assessmentResult assessmentStatus"
      )
      .sort({ assessmentScore: -1 });

    res.json(applications);

  } catch (err) {
    console.error("Job Results Error:", err.message);
    res.status(500).json({ message: "Failed to fetch results" });
  }
};


/* ======================================================
   UPLOAD EXCEL ASSESSMENT
====================================================== */
exports.uploadAssessmentExcel = async (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];

    const rows = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheetName]
    );

    const questions = rows.map(row => {
      const options = [
        row["Option A"],
        row["Option B"],
        row["Option C"],
        row["Option D"]
      ];

      const correctKey = row["Correct Answer"]?.trim().toUpperCase();

      const indexMap = { A: 0, B: 1, C: 2, D: 3 };

      return {
        question: row["Question"],
        options,
        correctAnswer: options[indexMap[correctKey]]
      };
    });

    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    const existingAssessment = await Assessment.findOne({
      job: req.params.jobId
    });

    if (existingAssessment) {
      return res.status(400).json({
        message: "Assessment already exists"
      });
    }

    const assessment = await Assessment.create({
      job: req.params.jobId,
      questions
    });

    await Job.findByIdAndUpdate(req.params.jobId, {
      hasAssessment: true
    });

    res.json({
      message: "Assessment created from Excel",
      totalQuestions: questions.length,
      assessment
    });

  } catch (err) {
    console.error("Excel Upload Error:", err.message);

    res.status(500).json({
      message: "Excel upload failed"
    });
  }
};
