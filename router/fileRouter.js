// Packages
const express = require('express');
const multer = require('multer');


// Middlewares
const verifyUser = require('../middleware/verifyUser');


// Initialize multer
const upload = multer();


// File Controllers
const { uploadFile, getFiles, download } = require('../controllers/fileControllers');


// Auth Router
const router = express.Router();


// API Routes
// ------------------------------------------------------------------------

// Route for uploading a file
router.route('/upload')
    .post(verifyUser, upload.single('file'), uploadFile);


// Route to get all the files for a specific user
router.route('/getFiles/:userID')
    .get(verifyUser, getFiles);


// Route to download a file
router.route('/download')
    .get(verifyUser, download);

// ------------------------------------------------------------------------



module.exports = router;