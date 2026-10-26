
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
        req.user = decoded.user;
        next();
    });
};

/**
 * RBAC — Réserve la route aux utilisateurs ayant le rôle "admin".
 * Doit être utilisé après verifyToken.
 */
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès réservé aux administrateurs.' });
    }
    next();
};

/**
 * RBAC — Autorise uniquement le propriétaire de la ressource (comparaison avec
 * le paramètre d'URL donné) ou un administrateur. Doit être utilisé après verifyToken.
 * @param {string} paramName - Nom du paramètre d'URL contenant l'ID utilisateur cible.
 */
const requireSelfOrAdmin = (paramName = 'userID') => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentification requise.' });
    }
    const targetId = req.params[paramName];
    if (req.user.role === 'admin' || String(req.user.id) === String(targetId)) {
        return next();
    }
    return res.status(403).json({ message: "Vous n'êtes pas autorisé à accéder à cette ressource." });
};

module.exports = { verifyToken, requireAdmin, requireSelfOrAdmin };