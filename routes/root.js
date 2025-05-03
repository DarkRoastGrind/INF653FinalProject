const express = require('express');
const router = express.Router();
const path = require('path');

// Serve the index.html file for the root and /index routes
router.get(['/', '/index', '/index.html'], (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'views', 'index.html'));
});

module.exports = router;