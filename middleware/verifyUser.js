// Packages
const jwt_decode = require('jwt-decode');


// Models
const User = require('../models/User');


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


const verifyUser = async (req, res, next) => {
    console.log(req.headers.authorization);
    const auth = req.headers.authorization;

    if (!req.headers.authorization) {
        return res.status(403).json({ error: 'AccessToken not provided in header' });
    }

    if (!checkAccessTokenValid(auth.split(' ')[1])) {
        return res.status(403).json({ error: 'Invalid AccessToken. Login Again.' });
    }

    const foundUser = await User.findOne({ accessToken: auth.split(' ')[1] }).exec();

    if (!foundUser) {
        return res.status(403).json({ error: 'No user with this accessToken exists. Login Again.' });
    }

    // if (!checkAccessTokenValid(loggedInUser)) {
    //     return res.status(403).json({ message: 'Access Token expired. Login required' });
    // }
    next();
};


module.exports = verifyUser;