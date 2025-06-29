const docSchema = require("../schemas/docModel");
const appointmentSchema = require("../schemas/appointmentModel");
const userSchema = require("../schemas/userModel");
const fs = require("fs");
const path = require("path");

// ================== Apply for Doctor Account ==================
const applyDoctorController = async (req, res) => {
  try {
    const { fullName, email, phone, userId } = req.body;

    if (!fullName || !email || !phone || !userId) {
      return res.status(400).send({
        success: false,
        message: "All fields are required",
      });
    }

    const existingDoctor = await docSchema.findOne({ userId });
    if (existingDoctor) {
      return res.status(400).send({
        success: false,
        message: "You have already applied for a doctor account",
      });
    }

    const newDoctor = new docSchema({
      fullName,
      email,
      phone,
      userId,
      status: "pending",
    });

    await newDoctor.save();

    const adminUser = await userSchema.findOne({ isAdmin: true });
    if (adminUser) {
      adminUser.notification = adminUser.notification || [];

      adminUser.notification.push({
        type: "apply-doctor-request",
        message: `${fullName} has applied for a Doctor Account`,
        data: {
          doctorId: newDoctor._id,
          name: newDoctor.fullName,
          onClickPath: "/admin/doctors",
        },
      });

      await adminUser.save();
    }

    return res.status(200).send({
      success: true,
      message: "Doctor account applied successfully",
    });
  } catch (error) {
    console.error("Error applying for doctor:", error);
    return res.status(500).send({
      success: false,
      message: "Error while applying for doctor account",
      error: error.message,
    });
  }
};

// ================== Update Doctor Profile ==================
const updateDoctorProfileController = async (req, res) => {
  try {
    const doctor = await docSchema.findOneAndUpdate(
      { userId: req.body.userId },
      req.body,
      { new: true }
    );

    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).send({
      success: true,
      data: doctor,
      message: "Successfully updated profile",
    });
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    return res.status(500).send({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ================== Get All Doctor Appointments ==================
const getAllDoctorAppointmentsController = async (req, res) => {
  try {
    const doctor = await docSchema.findOne({ userId: req.body.userId });

    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    const allAppointments = await appointmentSchema
      .find({ doctorId: doctor._id })
      .populate("userId", "fullName email phone")
      .populate("doctorId", "fullName email specialization");

    return res.status(200).send({
      success: true,
      message: "All appointments fetched successfully",
      data: allAppointments,
    });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    return res.status(500).send({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ================== Update Appointment Status ==================
const handleStatusController = async (req, res) => {
  try {
    const { userid, appointmentId, status } = req.body;

    const appointment = await appointmentSchema.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).send({
        success: false,
        message: "Appointment not found",
      });
    }

    const user = await userSchema.findById(userid);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    user.notification = user.notification || [];

    user.notification.push({
      type: "status-updated",
      message: `Your appointment status has been updated to "${status}"`,
      onClickPath: "/appointments",
    });

    await user.save();

    return res.status(200).send({
      success: true,
      message: "Successfully updated appointment status",
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return res.status(500).send({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ================== Download Appointment Document ==================
const documentDownloadController = async (req, res) => {
  try {
    const { appointId } = req.query;

    const appointment = await appointmentSchema.findById(appointId);
    if (!appointment) {
      return res.status(404).send({
        success: false,
        message: "Appointment not found",
      });
    }

    const documentPath = appointment.document?.path;

    if (!documentPath || typeof documentPath !== "string") {
      return res.status(404).send({
        success: false,
        message: "Document not found or path is invalid",
      });
    }

    const absoluteFilePath = path.resolve(__dirname, "..", documentPath);

    fs.access(absoluteFilePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).send({
          success: false,
          message: "File not found",
        });
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(absoluteFilePath)}"`
      );
      res.setHeader("Content-Type", "application/pdf");

      const fileStream = fs.createReadStream(absoluteFilePath);
      fileStream.pipe(res);
    });
  } catch (error) {
    console.error("Error downloading document:", error);
    return res.status(500).send({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ================== Exports ==================
module.exports = {
  applyDoctorController,
  updateDoctorProfileController,
  getAllDoctorAppointmentsController,
  handleStatusController,
  documentDownloadController,
};
