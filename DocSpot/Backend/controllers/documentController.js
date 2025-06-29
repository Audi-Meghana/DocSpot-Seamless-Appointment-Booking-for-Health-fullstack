const fs = require("fs");
const path = require("path");
const appointmentSchema = require("../schemas/appointmentModel");

// ================== Download Document ==================
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
        message: "Document path invalid or missing",
      });
    }

    const absoluteFilePath = path.resolve(__dirname, "..", documentPath);
    const fileExtension = path.extname(absoluteFilePath).toLowerCase();

    // Determine correct content type
    let contentType = "application/octet-stream"; // default fallback
    if (fileExtension === ".pdf") contentType = "application/pdf";
    else if (fileExtension === ".jpeg" || fileExtension === ".jpg") contentType = "image/jpeg";
    else if (fileExtension === ".png") contentType = "image/png";

    // Ensure the file exists
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
      res.setHeader("Content-Type", contentType);

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

module.exports = {
  documentDownloadController,
};
