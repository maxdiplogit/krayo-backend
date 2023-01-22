const checkAccessTokenValid = (loggedInUser) => {
    const now = parseInt(Date.now() / 1000);
    const expiry = loggedInUser.exp;
    console.log('Now: ', now);
    console.log('Expiry: ', expiry);
    return now < expiry;
};


const verifyUser = async (req, res, next) => {
    const { loggedInUser, email } = req.body;
    console.log(loggedInUser);
    console.log(email);

    // console.log(checkAccessTokenValid(loggedInUser));

    // if (!checkAccessTokenValid(loggedInUser)) {
    //     return res.status(403).json({ message: 'Access Token expired. Login required' });
    // }
    next();
};


module.exports = verifyUser;