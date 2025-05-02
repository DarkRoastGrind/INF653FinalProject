// npm run dev TO RUN THE PROGRAM

// import common core modules for server
// 1. Import express
// 2. Import expressApp
// 3. Import path
// 4. Import cors requirements
// 5. Import corsOptions config file
// 6. Import the logger middleware for event logging.
// 7. Import error handler for handling errors.
require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn')

const PORT = process.env.PORT || 3500; // Port for server.

// Connect to the mongo database
connectDB();


app.use(logger); // call the logger from the logEvents middleware.

app.use(credentials); // Use credentials
app.use(cors(corsOptions)); // Cross origin resource sharing.

app.use(express.urlencoded({ extended: false })); // built-in middleware to handle urlencoded data
app.use(express.json()); // Additional layer of middleware for json data.
app.use(cookieParser()); // Middleware for cookies

// Serve static files, applying css, text, etc.
app.use("/", express.static(path.join(__dirname, "/public")));

// ---------------------------- routes ---------------------------- //
app.use("/", require("./routes/root")); // Supply root folder route.
app.use("/register", require("./routes/register")); // Supply register route.
app.use("/auth", require("./routes/auth")); // Supply auth route.
app.use("/refresh", require("./routes/refresh")); // Supply refresh route.
app.use("/logout", require("./routes/logout")); // Supply logout route.

// Verifies everything below using JWT.
app.use(verifyJWT);
app.use("/employees", require("./routes/api/employees")); // Employees for an API
// ---------------------------------------------------------------- //

// Catch all - Send 404 response for all other requests.
// app.all applies to ALL html methods.
app.all(/^\/.*$/, (req, res) => {
  // If the request is an html, respond with an html error
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// Error handler.
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  // Open the server, ALWAYS HAVE AT THE END OF YOUR SERVER FILE.
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
