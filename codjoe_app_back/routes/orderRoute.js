const express = require('express');
const { createOrder, getUserOrders, getOrderById, getAllOrders, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { verifyToken, requireAdmin, requireSelfOrAdmin } = require('../middlewares/verifyToken');

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: "Back-office — Lister toutes les commandes (admin uniquement)"
 *     tags: [Commandes]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de toutes les commandes
 *       403:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/orders', verifyToken, requireAdmin, getAllOrders);

/**
 * @swagger
 * tags:
 *   name: Commandes
 *   description: Gestion des commandes clients
 */

/**
 * @swagger
 * /api/users/{userID}/orders/create:
 *   post:
 *     summary: Créer une nouvelle commande
 *     tags: [Commandes]
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
 *             $ref: '#/components/schemas/CreateOrderInput'
 *     responses:
 *       201:
 *         description: Commande créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Panier vide
 *       403:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Utilisateur introuvable
 */
router.post('/users/:userID/orders/create', verifyToken, requireSelfOrAdmin('userID'), createOrder);

/**
 * @swagger
 * /api/users/{userID}/orders:
 *   get:
 *     summary: Récupérer toutes les commandes d'un utilisateur
 *     tags: [Commandes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste des commandes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/Order' } }
 *                 count: { type: integer }
 *       403:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/users/:userID/orders', verifyToken, requireSelfOrAdmin('userID'), getUserOrders);

/**
 * @swagger
 * /api/orders/{orderID}:
 *   get:
 *     summary: Récupérer une commande par son ID
 *     tags: [Commandes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Commande trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       403:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/orders/:orderID', verifyToken, getOrderById);

/**
 * @swagger
 * /api/orders/{orderID}/status:
 *   put:
 *     summary: Mettre à jour le statut d'une commande
 *     tags: [Commandes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderID
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *       400:
 *         description: Statut invalide
 *       403:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/orders/:orderID/status', verifyToken, requireAdmin, updateOrderStatus);

/**
 * @swagger
 * /api/orders/{orderID}/cancel:
 *   put:
 *     summary: Annuler une commande
 *     tags: [Commandes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Commande annulée
 *       400:
 *         description: Impossible d'annuler (déjà expédiée ou livrée)
 *       403:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/orders/:orderID/cancel', verifyToken, cancelOrder);

module.exports = router;
