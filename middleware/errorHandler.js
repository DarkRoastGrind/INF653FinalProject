const { logEvents } = require("./logEvents");

const errorHandler = (err, req, res, next) => {
  // Log the full error for debugging purposes
  logEvents(
    `${err.name}: ${err.message}\nStack Trace: ${err.stack}`,
    "errLog.txt"
  );

  // In development, we log the stack trace to the console
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // Send a generic error message to the client
  res.status(500).json({ message: "An internal server error occurred" });
};

module.exports = errorHandler;
