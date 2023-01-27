// Packages
const jwt_decode = require('jwt-decode');
const { OAuth2Client } = require('google-auth-library');


// Setting up a new client(s) depending on the number of apps that require access to this web application
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// Models
const User = require('../models/User');


// Checking validity of the accessToken by checking if it has expired or not
const checkAccessTokenValid = (accessToken) => {
    if (accessToken?.length === 0) {
        return false;
    }
    const now = parseInt(Date.now() / 1000);
    const expiry = jwt_decode(accessToken).exp;
    console.log('Now: ', now);
    console.log('Expiry: ', expiry);
    return now < expiry;
};


// Checking validity of accessToken by sending an request to the Google OAuth API and getting back a response about the accessToken
const verify = async (accessToken) => {
    const ticket = await client.verifyIdToken({
        idToken: accessToken,
        audience: process.env.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    console.log('UserID Verify: ', userid);
};


const verifyUser = async (req, res, next) => {
    console.log(req.headers.authorization);
    const auth = req.headers.authorization;

    if (!req.headers.authorization) {
        return res.status(403).json({ error: 'AccessToken not provided in header' });
    }

    const foundUser = await User.findOne({ accessToken: auth.split(' ')[1] }).exec();

    if (!foundUser) {
        return res.status(403).json({ error: 'No user with this accessToken exists. Login Again.' });
    }

    if (!checkAccessTokenValid(auth.split(' ')[1])) {
        return res.status(403).json({ error: 'Invalid AccessToken. Login Again.' });
    }

    verify(auth.split(' ')[1]);

    // if (!checkAccessTokenValid(loggedInUser)) {
    //     return res.status(403).json({ message: 'Access Token expired. Login required' });
    // }
    next();
};


module.exports = verifyUser;