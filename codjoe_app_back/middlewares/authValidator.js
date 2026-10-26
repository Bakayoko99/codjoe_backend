
const { body } = require('express-validator');

/**
 * Politique de mot de passe CNIL : au moins 10 caractères, une majuscule,
 * une minuscule, un chiffre et un caractère spécial.
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{10,128}$/;

const signUpValidator = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('Le prénom est obligatoire.')
        .bail()
        .isLength({ max: 50 }).withMessage('Le prénom ne doit pas dépasser 50 caractères.')
        .escape(),
    body('lastName')
        .trim()
        .notEmpty().withMessage('Le nom est obligatoire.')
        .bail()
        .isLength({ max: 50 }).withMessage('Le nom ne doit pas dépasser 50 caractères.')
        .escape(),
    body('address')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 4, max: 75 }).withMessage("L'adresse doit contenir entre 4 et 75 caractères.")
        .escape(),
    body('email')
        .trim()
        .notEmpty().withMessage("L'adresse email est obligatoire.")
        .bail()
        .isEmail().withMessage("Le format de l'adresse email est invalide.")
        .bail()
        .normalizeEmail(),
    body('country')
        .trim()
        .notEmpty().withMessage('Le pays est obligatoire.'),
    body('birthday')
        .notEmpty().withMessage('La date de naissance est obligatoire.')
        .bail()
        .isDate().withMessage('La date de naissance doit être une date valide (AAAA-MM-JJ).'),
    body('password')
        .notEmpty().withMessage('Le mot de passe est obligatoire.')
        .bail()
        .isLength({ min: 10, max: 128 }).withMessage('Le mot de passe doit contenir au moins 10 caractères.')
        .bail()
        .matches(PASSWORD_REGEX).withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.')
];

const loginValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage("L'adresse email est obligatoire.")
        .bail()
        .isEmail().withMessage("Le format de l'adresse email est invalide."),
    body('password')
        .notEmpty().withMessage('Le mot de passe est obligatoire.')
];

const updateProfileValidator = [
    body('firstName').optional().trim().notEmpty().withMessage('Le prénom ne peut pas être vide.').isLength({ max: 50 }).escape(),
    body('lastName').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide.').isLength({ max: 50 }).escape(),
    body('address').optional({ checkFalsy: true }).trim().isLength({ min: 4, max: 75 }).withMessage("L'adresse doit contenir entre 4 et 75 caractères.").escape(),
    body('email').optional().trim().isEmail().withMessage("Le format de l'adresse email est invalide.").normalizeEmail(),
    body('country').optional().trim().notEmpty().withMessage('Le pays ne peut pas être vide.'),
    body('birthday').optional().isDate().withMessage('La date de naissance doit être une date valide (AAAA-MM-JJ).')
];

module.exports = { signUpValidator, loginValidator, updateProfileValidator, PASSWORD_REGEX };
