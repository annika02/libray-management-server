const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { router: visaRoutes, connectDB } = require("./visaRoutes");

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Routes
app.use("/api/visas", visaRoutes);

// Start Server
connectDB().then(() => {
  app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
});
