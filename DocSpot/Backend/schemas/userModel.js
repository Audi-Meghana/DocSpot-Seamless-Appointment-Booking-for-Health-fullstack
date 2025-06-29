const mongoose = require("mongoose");

const userModel = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Name is required"],
    set: function (value) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
  },
  email: {
    type: String,
    required: [true, "Email is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone is required"],
  },
  type: {
    type: String,
    required: [true, "Type is required"],
  },
  notification: {
    type: Array,
    default: [],
  },
  seennotification: {
    type: Array,
    default: [],
  },
  isdoctor: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model("user", userModel);
