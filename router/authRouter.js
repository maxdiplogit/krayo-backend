// Packages
const express = require('express');


// Auth Controller
const { verifyToken, logout } = require('../controllers/authControllers');


// Auth Router
const router = express.Router();


// API Routes
// ------------------------------------------------------------------------

// Route for verifying access token after login
router.route('/verifyToken')
    .post(verifyToken);


// Route for logging out the user and removing the accessToken from the database as well
router.route('/logout')
    .post(logout);

// ------------------------------------------------------------------------


module.exports = router