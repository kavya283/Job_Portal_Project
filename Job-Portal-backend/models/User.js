const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,

    companyName: String,

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },


    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
      select: false,
    },

    role: {
      type: String,
      enum: ["candidate", "employer"],
      default: null,
    },

    provider: {
      type: String,
      enum: ["local", "google", "linkedin"],
      default: "local",
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    linkedinId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
