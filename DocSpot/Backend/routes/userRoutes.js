const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middlewares/authMiddleware");

const {
  registerController,
  loginController,
  authController,
  deleteallnotificationController,
  getallnotificationController,
  getAllDoctorsControllers,
  appointmentController,
  getAllUserAppointments,
  getDocsController,
} = require("../controllers/UserC");

const {
  applyDoctorController,
  documentDownloadController,
} = require("../controllers/doctorC");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ==================== AUTH ROUTES ====================
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/getuserdata", authMiddleware, authController);

// ==================== DOCTOR REGISTRATION ====================
router.post("/registerdoc", authMiddleware, applyDoctorController);

// ==================== GET DOCTORS FOR USERS ====================
router.get("/getalldoctorsu", authMiddleware, getAllDoctorsControllers);
router.get("/getDocsforuser", authMiddleware, getDocsController);

// ==================== APPOINTMENT ROUTES ====================
router.post("/getappointment", upload.single("image"), authMiddleware, appointmentController);
router.get("/getuserappointments", authMiddleware, getAllUserAppointments);

// ==================== NOTIFICATIONS ====================
router.post("/getallnotification", authMiddleware, getallnotificationController);
router.post("/deleteallnotification", authMiddleware, deleteallnotificationController);

// ==================== DOCUMENT DOWNLOAD ====================
router.get("/downloadDoc", authMiddleware, documentDownloadController);

module.exports = router;
