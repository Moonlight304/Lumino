const jwt = require('jsonwebtoken');
const ACCESS_SECRET = process.env.ACCESS_SECRET;

function authMiddle(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || authHeader === 'Bearer null')
            return res.json({
                status: 'fail',
                message: 'Not authorised',
            });

        const access_token = authHeader.split(' ')[1];

        if (!access_token)
            return res.json({
                status: 'fail',
                message: 'no token found',
            })

        
        const decodedObj = jwt.verify(access_token, ACCESS_SECRET);
        req.user = decodedObj;

        next();
    }
    catch (e) {
        return res.json({
            status: 'fail',
            message: e.message,
        })
    }
}

module.exports = authMiddle;