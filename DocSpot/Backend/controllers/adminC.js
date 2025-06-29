const docSchema = require("../schemas/docModel");
const userSchema = require("../schemas/userModel");
const appointmentSchema = require("../schemas/appointmentModel");

// ================= Get All Users =================
const getAllUsersControllers = async (req, res) => {
  try {
    const users = await userSchema.find({});
    return res.status(200).send({
      message: "Users data list",
      success: true,
      data: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong", success: false });
  }
};

// ================= Get All Doctors =================
const getAllDoctorsControllers = async (req, res) => {
  try {
    const docUsers = await docSchema.find({});
    return res.status(200).send({
      message: "Doctor Users data list",
      success: true,
      data: docUsers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong", success: false });
  }
};

// ================= Approve Doctor Status =================
const getStatusApproveController = async (req, res) => {
  try {
    const { doctorId, status, userid } = req.body;

    const doctor = await docSchema.findByIdAndUpdate(doctorId, { status }, { new: true });
    const user = await userSchema.findById(userid);

    user.notification.push({
      type: "doctor-account-approved",
      message: `Your doctor account has been ${status}`,
      onClickPath: "/notification",
    });

    user.isdoctor = status === "approved";
    await user.save();

    return res.status(201).send({
      message: "Doctor approval status updated successfully",
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong", success: false });
  }
};

// ================= Reject Doctor Status =================
const getStatusRejectController = async (req, res) => {
  try {
    const { doctorId, status, userid } = req.body;

    const doctor = await docSchema.findByIdAndUpdate(doctorId, { status }, { new: true });
    const user = await userSchema.findById(userid);

    user.notification.push({
      type: "doctor-account-status",
      message: `Your doctor account has been ${status}`,
      onClickPath: "/notification",
    });

    await user.save();

    return res.status(201).send({
      message: "Doctor rejection status updated successfully",
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong", success: false });
  }
};

// ================= Display All Appointments (Admin) =================
const displayAllAppointmentController = async (req, res) => {
  try {
    const allAppointments = await appointmentSchema
      .find({})
      .populate("userId", "fullName email")
      .populate("doctorId", "fullName email");

    return res.status(200).send({
      success: true,
      message: "Successfully fetched all appointments",
      data: allAppointments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong", success: false });
  }
};

module.exports = {
  getAllDoctorsControllers,
  getAllUsersControllers,
  getStatusApproveController,
  getStatusRejectController,
  displayAllAppointmentController,
};
