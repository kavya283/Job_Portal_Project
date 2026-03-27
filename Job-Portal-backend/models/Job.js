const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    /* =========================================
       BASIC JOB INFO
    ========================================= */
    title: { 
      type: String, 
      required: true,
      trim: true
    },

    role: { 
      type: String,
      trim: true
    },

    companyName: { 
      type: String, 
      required: true,
      trim: true
    },

    description: { 
      type: String 
    },

    qualifications: { 
      type: String 
    },

    responsibilities: { 
      type: String 
    },

    /* =========================================
       SKILLS & EXPERIENCE
    ========================================= */

    skills: [
      {
        type: String,
        trim: true
      }
    ],

    experienceRequired: {
      type: Number,
      default: 0
    },

    /* =========================================
       JOB LOCATION & TYPE
    ========================================= */

    location: { 
      type: String, 
      required: true,
      trim: true
    },

    jobType: {
      type: String,
      enum: ["full-time", "part-time", "internship", "contract"],
      default: "full-time"
    },

    /* =========================================
       SALARY RANGE
    ========================================= */
    salaryMin: { 
      type: Number, 
      min: 0 
    },

    salaryMax: { 
      type: Number, 
      min: 0 
    },

    /* =========================================
       RELATIONSHIPS
    ========================================= */
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* =========================================
       JOB STATUS
    ========================================= */
    status: {
      type: String,
      enum: ["open", "closed", "draft"],
      default: "open",
    },

    /* =========================================
       WORKFLOW TRACKING (VERY IMPORTANT)
    ========================================= */
    applicationsCount: {
      type: Number,
      default: 0,
    },

    interviewsCount: {
      type: Number,
      default: 0,
    },

    /* =========================================
       ASSESSMENT SETTINGS
    ========================================= */
    hasAssessment: {
      type: Boolean,
      default: false
    },

    assessmentDuration: {
      type: Number,
      default: 30
    },

    assessmentPassingScore: {
      type: Number,
      default: 60
    },

    /* =========================================
       INTERVIEW SETTINGS
    ========================================= */

    interviewRequired: {
      type: Boolean,
      default: true
    },

    /* =========================================
       EXPIRY SYSTEM
    ========================================= */
    expiryDate: {
      type: Date,
    },

    /* =========================================
       SOFT DELETE
    ========================================= */
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* =========================================
   VALIDATION: salaryMin <= salaryMax
========================================= */
jobSchema.pre("save", function (next) {
  if (
    this.salaryMin != null &&
    this.salaryMax != null &&
    this.salaryMin > this.salaryMax
  ) {
    return next(new Error("Minimum salary cannot be greater than maximum salary"));
  }
  next();
});

/* =========================================
   TEXT SEARCH INDEX (Optimized)
========================================= */
jobSchema.index({
  title: "text",
  role: "text",
  companyName: "text",
  description: "text",
  qualifications: "text",
  responsibilities: "text",
  location: "text",
  skills: "text"
});

/* =========================================
   PERFORMANCE INDEXES
========================================= */
jobSchema.index({ employer: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ jobType: 1 });

module.exports = mongoose.model("Job", jobSchema);
