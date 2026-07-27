
const express = require('express');

const router = express.Router();

const { signUp, logIn, verifyEmail } = require('../controllers/authController');
const { signUpValidator, loginValidator } = require('../middlewares/authValidator');


/**
 * @swagger
 * tags:
 *   name: Authentification
 *   description: Inscription et connexion des utilisateurs
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Créer un nouveau compte utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignUpInput'
 *     responses:
 *       200:
 *         description: Compte créé — retourne un token JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthToken'
 *       400:
 *         description: Validation échouée ou email déjà existant
 *       500:
 *         description: Erreur serveur
 */
router.post('/signup', signUpValidator, signUp);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion avec email et mot de passe
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Connexion réussie — retourne un token JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthToken'
 *       400:
 *         description: Identifiants invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/login', loginValidator, logIn);

/**
 * @swagger
 * /api/auth/verify-email/{token}:
 *   get:
 *     summary: "RGPD — Double opt-in : vérifier l'adresse email"
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Email vérifié
 *       400:
 *         description: Token invalide
 */
router.get('/verify-email/:token', verifyEmail);

router.get('/cj', (req, res) => {
    res.send('Codjoe App auth route');
});

module.exports = router;