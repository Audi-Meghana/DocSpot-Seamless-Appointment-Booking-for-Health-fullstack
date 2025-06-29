// Load environment variables first
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectToDB = require("./config/connectToDB");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectToDB();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/user/', require('./routes/userRoutes'));
app.use('/api/admin/', require('./routes/adminRoutes'));
app.use('/api/doctor', require('./routes/doctorRoutes'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", success: false });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
