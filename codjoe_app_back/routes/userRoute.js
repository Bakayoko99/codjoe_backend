
const express = require('express');

const router = express.Router();

const { getUserCartItems, addNewCartItems, removeCartItems, updateCartItemQuantity, updateCartItemSize, deleteUserAccount, exportUserData } = require('../controllers/userController');


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
router.get('/:userID/cart', getUserCartItems);

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
router.post('/:userID/cart/add', addNewCartItems);

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
router.post('/:userID/cart/remove', removeCartItems);

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
router.post('/:userID/cart/update-quantity', updateCartItemQuantity);

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
router.post('/:userID/cart/update-size', updateCartItemSize);

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
router.delete('/:userID', deleteUserAccount);

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
router.get('/:userID/data', exportUserData);

module.exports = router;