
// const verifyToken = (req, res, next) => {
//     const token = req.headers["authorization"];
//     if (!token) return res.status(403).send("Access denied.");
//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//         if (err) return res.status(401).send("Invalid token.");
//         req.user = decoded;
//         next();
//     });
// };

const jwt = require('jsonwebtoken');
const config = require('../config');


const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(403).send("Access denied.");
    
    // Extraire le token (supporte "Bearer token" et "token" directement)
    const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;
    
    jwt.verify(token, config.key, (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err.message);
            return res.status(401).send("Invalid token.");
        }
        req.user = decoded;
        next();
    });
};


module.exports = { verifyToken };