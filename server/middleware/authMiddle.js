const jwt = require('jsonwebtoken');
const ACCESS_SECRET = process.env.ACCESS_SECRET;

function authMiddle(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || authHeader === 'Bearer null')
            throw new Error('No Auth Header');

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
        console.log(e.message)
        return res.status(401).json({
            status: 'fail',
            message: e.message,
        })
    }
}

module.exports = authMiddle;