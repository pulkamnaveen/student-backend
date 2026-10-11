const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    course: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      min: 1
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);