
const express = require('express');

const router = express.Router();

const {
    getUserCartItems, addNewCartItems, removeCartItems, updateCartItemQuantity, updateCartItemSize,
    deleteUserAccount, exportUserData,
    getUserProfile, updateUserProfile, getAllUsers, updateUserRole
} = require('../controllers/userController');
const { verifyToken, requireAdmin, requireSelfOrAdmin } = require('../middlewares/verifyToken');
const { updateProfileValidator } = require('../middlewares/authValidator');


/**
 * @swagger
 * tags:
 *   name: Panier
 *   description: Gestion du panier utilisateur
 */

/**
 * @swagger
 * /api/users/{userID}/cart:
 *   get:
 *     summary: Récupérer le contenu du panier
 *     tags: [Panier]
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Articles du panier
 *       400:
 *         description: Utilisateur introuvable ou panier vide
 */
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: "Back-office — Lister tous les utilisateurs (admin uniquement)"
 *     tags: [Utilisateurs]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       403:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', verifyToken, requireAdmin, getAllUsers);

/**
 * @swagger
 * /api/users/{userID}:
 *   get:
 *     summary: "RGPD — Droit d'accès : consulter son profil"
 *     tags: [Utilisateurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *       403:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Utilisateur introuvable
 *   put:
 *     summary: "RGPD — Droit de rectification : mettre à jour son profil"
 *     tags: [Utilisateurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *       400:
 *         description: Validation échouée ou email déjà utilisé
 *       403:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Utilisateur introuvable
 */
router.get('/:userID', verifyToken, requireSelfOrAdmin('userID'), getUserProfile);
router.put('/:userID', verifyToken, requireSelfOrAdmin('userID'), updateProfileValidator, updateUserProfile);

/**
 * @swagger
 * /api/users/{userID}/role:
 *   patch:
 *     summary: "Back-office — Modifier le rôle d'un utilisateur (admin uniquement)"
 *     tags: [Utilisateurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string, enum: [user, admin] }
 *     responses:
 *       200:
 *         description: Rôle mis à jour
 *       400:
 *         description: Rôle invalide
 *       403:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch('/:userID/role', verifyToken, requireAdmin, updateUserRole);

router.get('/:userID/cart', verifyToken, requireSelfOrAdmin('userID'), getUserCartItems);

/**
 * @swagger
 * /api/users/{userID}/cart/add:
 *   post:
 *     summary: Ajouter des articles au panier
 *     tags: [Panier]
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:       { type: string }
 *                     size:     { type: string }
 *                     quantity: { type: integer }
 *     responses:
 *       200:
 *         description: Panier mis à jour
 */
router.post('/:userID/cart/add', verifyToken, requireSelfOrAdmin('userID'), addNewCartItems);

/**
 * @swagger
 * /api/users/{userID}/cart/remove:
 *   post:
 *     summary: Supprimer un article du panier
 *     tags: [Panier]
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId: { type: string }
 *               size:      { type: string }
 *     responses:
 *       200:
 *         description: Article supprimé
 *       404:
 *         description: Utilisateur ou article introuvable
 */
router.post('/:userID/cart/remove', verifyToken, requireSelfOrAdmin('userID'), removeCartItems);

/**
 * @swagger
 * /api/users/{userID}/cart/update-quantity:
 *   post:
 *     summary: Mettre à jour la quantité d'un article
 *     tags: [Panier]
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId: { type: string }
 *               size:      { type: string }
 *               quantity:  { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Quantité mise à jour
 *       404:
 *         description: Article introuvable dans le panier
 */
router.post('/:userID/cart/update-quantity', verifyToken, requireSelfOrAdmin('userID'), updateCartItemQuantity);

/**
 * @swagger
 * /api/users/{userID}/cart/update-size:
 *   post:
 *     summary: Modifier la taille d'un article dans le panier
 *     tags: [Panier]
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId: { type: string }
 *               oldSize:   { type: string }
 *               newSize:   { type: string }
 *     responses:
 *       200:
 *         description: Taille mise à jour
 *       400:
 *         description: Un article avec cette taille existe déjà
 *       404:
 *         description: Article introuvable
 */
router.post('/:userID/cart/update-size', verifyToken, requireSelfOrAdmin('userID'), updateCartItemSize);

/**
 * @swagger
 * /api/users/{userID}:
 *   delete:
 *     summary: "RGPD — Droit à l'oubli : supprimer le compte utilisateur"
 *     tags: [Utilisateurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Compte supprimé
 *       404:
 *         description: Utilisateur introuvable
 */
router.delete('/:userID', verifyToken, requireSelfOrAdmin('userID'), deleteUserAccount);

/**
 * @swagger
 * /api/users/{userID}/data:
 *   get:
 *     summary: "RGPD — Droit d'accès : exporter ses données personnelles"
 *     tags: [Utilisateurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Données personnelles exportées
 *       404:
 *         description: Utilisateur introuvable
 */
router.get('/:userID/data', verifyToken, requireSelfOrAdmin('userID'), exportUserData);

module.exports = router;