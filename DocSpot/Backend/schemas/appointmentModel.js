const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // This name must match what you used in userModel
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "doctor", // Must match docModel
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    default: "pending", // lowercase by convention
    enum: ["pending", "approved", "rejected"],
  },
});

module.exports = mongoose.model("appointment", appointmentSchema);
