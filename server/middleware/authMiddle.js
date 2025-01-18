const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET_CODE;

function authMiddle(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || authHeader === 'Bearer null')
            return res.json({
                status: 'fail',
                message: 'Not authorised',
            });

        const jwt_token = authHeader.split(' ')[1];

        if (!jwt_token)
            return res.json({
                status: 'fail',
                message: 'no token found',
            })

        
        const decodedObj = jwt.verify(jwt_token, JWT_SECRET);
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