const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const userSchema = require("../schemas/userModel");
const docSchema = require("../schemas/docModel");
const appointmentSchema = require("../schemas/appointmentModel");

// Register
const registerController = async (req, res) => {
  try {
    const existsUser = await userSchema.findOne({ email: req.body.email });
    if (existsUser) {
      return res.status(200).send({ message: "User already exists", success: false });
    }
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    const newUser = new userSchema(req.body);
    await newUser.save();

    return res.status(201).send({ message: "Register Success", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: `${error.message}` });
  }
};

// Login
const loginController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ email: req.body.email });
    if (!user) return res.status(200).send({ message: "User not found", success: false });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(200).send({ message: "Invalid email or password", success: false });

    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: "1d" });
    user.password = undefined;

    return res.status(200).send({
      message: "Login success successfully",
      success: true,
      token,
      userData: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: `${error.message}` });
  }
};

// Auth Check
const authController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    if (!user) return res.status(200).send({ message: "user not found", success: false });

    return res.status(200).send({ success: true, data: user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "auth error", success: false, error });
  }
};

// Doctor Application
const docController = async (req, res) => {
  try {
    const { userId, fullName, email, phone } = req.body;

    const existingDoctor = await docSchema.findOne({ userId });
    if (existingDoctor) {
      return res.status(400).send({ success: false, message: "You have already applied" });
    }

    const newDoctor = new docSchema({
      userId,
      fullName,
      email,
      phone,
      status: "pending",
    });

    await newDoctor.save();

    const adminUser = await userSchema.findOne({ type: "admin" });
    if (!adminUser) {
      return res.status(404).send({ success: false, message: "Admin user not found" });
    }

    const notification = adminUser.notification || [];
    notification.push({
      type: "apply-doctor-request",
      message: `${newDoctor.fullName} has applied for doctor registration`,
      data: {
        userId: newDoctor._id,
        fullName: newDoctor.fullName,
        onClickPath: "/admin/doctors",
      },
    });

    await userSchema.findByIdAndUpdate(adminUser._id, { notification });

    return res.status(201).send({
      success: true,
      message: "Doctor Registration request sent successfully",
    });
  } catch (error) {
    console.error("Error in docController:", error);
    return res.status(500).send({
      success: false,
      message: "Error while applying",
      error: error.message,
    });
  }
};

// Notifications
const getallnotificationController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    user.seennotification.push(...user.notification);
    user.notification = [];

    const updatedUser = await user.save();
    return res.status(200).send({
      success: true,
      message: "All notification marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "unable to fetch", success: false, error });
  }
};

const deleteallnotificationController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    user.notification = [];
    user.seennotification = [];

    const updatedUser = await user.save();
    updatedUser.password = undefined;
    return res.status(200).send({
      success: true,
      message: "notification deleted",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "unable to delete", success: false, error });
  }
};

const getAllDoctorsControllers = async (req, res) => {
  try {
    const docUsers = await docSchema.find({ status: "approved" });
    return res.status(200).send({
      message: "doctor Users data list",
      success: true,
      data: docUsers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "something went wrong", success: false, error });
  }
};

// Appointment
const appointmentController = async (req, res) => {
  try {
    let { userInfo, doctorInfo } = req.body;
    userInfo = JSON.parse(userInfo);
    doctorInfo = JSON.parse(doctorInfo);

    let documentData = null;
    if (req.file) {
      documentData = {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
      };
    }

    req.body.status = "pending";

    const newAppointment = new appointmentSchema({
      userId: req.body.userId,
      doctorId: req.body.doctorId,
      userInfo,
      doctorInfo,
      date: req.body.date,
      document: documentData,
      status: req.body.status,
    });

    await newAppointment.save();

    const doctorUser = await userSchema.findOne({ _id: doctorInfo.userId });
    if (doctorUser) {
      doctorUser.notification.push({
        type: "New Appointment",
        message: `New Appointment request from ${userInfo.fullName}`,
      });
      await doctorUser.save();
    }

    return res.status(200).send({
      message: "Appointment booked successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "something went wrong", success: false, error });
  }
};

// ✅ FIXED: Get All User Appointments (now uses req.query.userId)
const getAllUserAppointments = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).send({ success: false, message: "User ID is required" });
    }

    const appointments = await appointmentSchema
      .find({ userId })
      .populate("doctorId", "fullName specialization");

    const appointmentsWithDoctor = appointments.map((appointment) => {
      return {
        _id: appointment._id,
        date: appointment.date,
        status: appointment.status,
        docName: appointment.doctorId?.fullName || "N/A",
        specialization: appointment.doctorId?.specialization || "N/A",
      };
    });

    return res.status(200).send({
      message: "Appointments retrieved successfully",
      success: true,
      data: appointmentsWithDoctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "something went wrong", success: false, error });
  }
};

// Get user documents
const getDocsController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    const allDocs = user.documents;
    if (!allDocs) {
      return res.status(200).send({ message: "No documents", success: true });
    }
    return res.status(200).send({
      message: "User documents fetched successfully",
      success: true,
      data: allDocs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "something went wrong", success: false, error });
  }
};

// Upload Document
const uploadDocumentController = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!req.file) {
      return res.status(400).send({ success: false, message: "No file uploaded" });
    }

    const user = await userSchema.findById(userId);
    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    const newDoc = {
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
    };

    user.documents = user.documents || [];
    user.documents.push(newDoc);
    await user.save();

    res.status(200).send({
      success: true,
      message: "Document uploaded successfully",
      data: newDoc,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).send({ success: false, message: "Something went wrong", error });
  }
};

module.exports = {
  registerController,
  loginController,
  authController,
  docController,
  getallnotificationController,
  deleteallnotificationController,
  getAllDoctorsControllers,
  appointmentController,
  getAllUserAppointments,
  getDocsController,
  uploadDocumentController,
};
