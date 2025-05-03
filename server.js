require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const mongoose = require('mongoose');

// Import middleware and configurations
const corsOptions = require("./config/corsOptions");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");

// Import database Connection
const connectDB = require('./config/dbConn')

// Define constants
const PORT = process.env.PORT || 5500; // Port for server.

// Connect to MongoDB before starting the server
(async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Middleware setup
    app.use(logger); // Logger middleware
    app.use(cors(corsOptions)); // CORS middleware
    app.use(express.urlencoded({ extended: false })); // URL-encoded data handling
    app.use(express.json()); // JSON data handling

    // Static file serving
    app.use("/", express.static(path.join(__dirname, "public")));

    // Define API routes
    app.use("/", require("./routes/root"));
    app.use("/states", require("./routes/api/states"));

    // 404 Handler
    app.all('*', (req, res) => {
      res.status(404);
      if (req.accepts("html")) {
        res.sendFile(path.join(__dirname, "views", "404.html"));
      } else if (req.accepts("json")) {
        res.json({ error: "404 Not Found" });
      } else {
        res.type("txt").send("404 Not Found");
      }
    });

    // Error handler middleware
    app.use(errorHandler);

    // Start the server once connected to DB
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
})();