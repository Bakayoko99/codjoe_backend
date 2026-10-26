
const express = require('express');
const router = express.Router();

const { getCategories, addCategory, getCategoriesProducts } = require('../controllers/categoryController');
const { verifyToken, requireAdmin } = require('../middlewares/verifyToken');

/**
 * @swagger
 * tags:
 *   name: Catégories
 *   description: Gestion des catégories et de leurs produits
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Récupérer toutes les catégories
 *     tags: [Catégories]
 *     responses:
 *       200:
 *         description: Liste des catégories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:      { type: string }
 *                   name:     { type: string, example: 'tshirts' }
 *                   products: { type: array, items: { type: string } }
 */
router.get('/', getCategories);

/**
 * @swagger
 * /api/categories/{name}:
 *   post:
 *     summary: Créer une nouvelle catégorie
 *     tags: [Catégories]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 *         description: Nom de la catégorie
 *     responses:
 *       200:
 *         description: Catégorie créée
 *   get:
 *     summary: Récupérer les produits d'une catégorie
 *     tags: [Catégories]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 *         description: Nom de la catégorie
 *     responses:
 *       200:
 *         description: Produits de la catégorie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category: { type: string }
 *                 products:  { type: array, items: { $ref: '#/components/schemas/Product' } }
 *                 total:     { type: integer }
 *       404:
 *         description: Catégorie ou produits introuvables
 */
router.post('/:name', verifyToken, requireAdmin, addCategory);

router.get('/:name', getCategoriesProducts);

module.exports = router;
