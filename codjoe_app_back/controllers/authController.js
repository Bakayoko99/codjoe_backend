/**
 * @module authController
 * @description Contrôleur d'authentification (inscription, connexion, vérification email).
 */

const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');

const userModel = require('../models/userModel');

/**
 * Inscription d'un nouvel utilisateur.
 * Génère un token de vérification email (double opt-in RGPD) et retourne un JWT.
 * @param {Object} req - Corps : firstName, lastName, email, password, country, birthday
 * @param {Object} res - 200 {token, emailVerificationToken} | 400 | 500
 */
const signUp = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, country, birthday } = req.body;

    try {
        let user = await userModel.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new userModel({
            firstName,
            lastName,
            email,
            password,
            country,
            birthday,
            emailVerificationToken: crypto.randomBytes(32).toString('hex'),
            consentDate: new Date(),
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, config.key, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token, emailVerificationToken: user.emailVerificationToken });
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server signup error');
    }
};

/**
 * Connexion d'un utilisateur existant.
 * @param {Object} req - Corps : email, password
 * @param {Object} res - 200 {token} | 400 | 500
 */
const logIn = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(payload, config.key, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server login error');
    }
};

/**
 * RGPD — Double opt-in : confirme l'adresse email via le token envoyé à l'inscription.
 * @param {Object} req - Paramètre :token dans l'URL
 * @param {Object} res - 200 | 400 | 500
 */
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await userModel.findOne({ emailVerificationToken: token });
        if (!user) {
            return res.status(400).json({ message: 'Token invalide ou expiré' });
        }
        user.emailVerified = true;
        user.emailVerificationToken = null;
        await user.save();
        res.status(200).json({ message: 'Email vérifié avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { signUp, logIn, verifyEmail };
