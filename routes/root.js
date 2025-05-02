const express = require("express");
const router = express.Router();
const path = require("path");

// Handle get requests for the root, OR index.html
// Current installed version of express does not work with the '' method, need regex.
router.get(/^\/$|\/index(\.html)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

module.exports = router;
