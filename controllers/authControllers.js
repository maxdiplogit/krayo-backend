// Packages
const jwt_decode = require('jwt-decode');


// Models
const User = require('../models/User');


// Function for checking the validity of the accessToken
const checkAccessTokenValid = (expiry) => {
    const now = parseInt(Date.now() / 1000);
    console.log('Now: ', now);
    console.log('Expiry: ', expiry);
    return now < expiry;
};


// Controllers
// ------------------------------------------------------------------------

module.exports.verifyToken = async (req, res, next) => {
    const { accessToken } = req.body;

    console.log(jwt_decode(accessToken));

    console.log(checkAccessTokenValid(jwt_decode(accessToken).exp));

    if (!checkAccessTokenValid(jwt_decode(accessToken).exp)) {
        return res.status(403).json({ error: 'AccessToken not valid!' });
    }

    const user = jwt_decode(accessToken);

    const foundUser = await User.findOne({ email: user.email }).exec();

    if (!foundUser) {
        const newUser = new User({ name: user.name, email: user.email, accessToken: accessToken });
        await newUser.save();
        return res.status(201).json({ user: newUser, accessToken });
    }

    foundUser.accessToken = accessToken;
    await foundUser.save()

    res.status(200).json({ user: foundUser, accessToken });
};


module.exports.logout = async (req, res, next) => {
    const { accessToken } = req.body;
    console.log(accessToken);

    const foundUser = await User.findOne({ accessToken: accessToken }).exec();

    foundUser.accessToken = '';
    await foundUser.save();

    res.status(204).send('Logged out successfully!');
}

// ------------------------------------------------------------------------