
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const Student = require("./models/Students");

const app = express();

// Middleware: parse incoming JSON requests
app.use(express.json());

// Connect to MongoDB and start the server
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    app.listen(process.env.PORT || 4000, () => {
      console.log(
        `Server running at http://localhost:${process.env.PORT || 4000}`
      );
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Student Management API is running" });
});

// 1. CREATE a student - POST
app.post("/api/students", async (req, res) => {
  try {
    const { name, email, course, age } = req.body;

    if (
      typeof name !== "string" || !name.trim() ||
      typeof email !== "string" || !email.trim() ||
      typeof course !== "string" || !course.trim()
    ) {
      return res.status(400).json({
        message: "Name, email and course are required"
      });
    }

    const student = await Student.create({
      name,
      email,
      course,
      age
    });

    res.status(201).json({
      message: "Student created successfully",
      student
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message
      });
    }

    res.status(500).json({ message: "Internal server error" });
  }
});

// 2. READ all students - GET
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find();

    res.status(200).json({
      count: students.length,
      students
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// 3. READ one student by ID - GET
app.get("/api/students/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ student });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// 4. UPDATE selected fields - PATCH
app.patch("/api/students/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const allowedFields = ["name", "email", "course", "age"];
    const updates = req.body;

    if (
      !updates ||
      typeof updates !== "object" ||
      Array.isArray(updates) ||
      Object.keys(updates).length === 0
    ) {
      return res.status(400).json({
        message: "Provide at least one field to update"
      });
    }

    const invalidFields = Object.keys(updates).filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `Fields cannot be updated: ${invalidFields.join(", ")}`
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Student updated successfully",
      student
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Internal server error" });
  }
});

// 5. DELETE a student - DELETE
app.delete("/api/students/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Student deleted successfully",
      student
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

startServer();
