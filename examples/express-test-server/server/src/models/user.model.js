const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      min: 7,
      max: 200,
    },
    password: {
      type: String,
      min: 5,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      min: 7,
      max: 200,
    },
    adharNumber: {
      type: String,
      min: 7,
      max: 200,
    },
    dob: {
      type: Date,
      default: null,
    },
    name: {
      type: String,
      min: 1,
      max: 500,
    },
    gender: {
      type: String,
      min: 1,
      max: 500,
      enum: ["male", "female", "other"],
      default: null,
    },
    educationComplete: {
      type: String,
      min: 1,
      max: 500,
      enum: ["graduation", "post-graduation", "phd", "other"],
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
