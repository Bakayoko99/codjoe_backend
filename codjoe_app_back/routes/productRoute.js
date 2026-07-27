
const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer();

const cpUpload = upload.fields([{ name: 'mainImg', maxCount: 1 }, { name: 'imgs', maxCount: 8 }]);

const { getProducts, getProductById, addProduct, deleteProduct } = require('../controllers/productController');

/**
 * @swagger
 * tags:
 *   name: Produits
 *   description: Gestion du catalogue produits
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Récupérer tous les produits
 *     tags: [Produits]
 *     responses:
 *       200:
 *         description: Liste de tous les produits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', getProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Récupérer un produit par son ID
 *     tags: [Produits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB du produit
 *     responses:
 *       200:
 *         description: Produit trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produit introuvable
 */
router.get('/:id', getProductById);

/**
 * @swagger
 * /api/products/add:
 *   post:
 *     summary: Ajouter un nouveau produit (avec images)
 *     tags: [Produits]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, price, quantity, soldOut, sizes, category, mainImg, imgs]
 *             properties:
 *               name:     { type: string, example: 'T-Shirt Codjoe' }
 *               price:    { type: string, example: '29.99' }
 *               quantity: { type: integer, example: 50 }
 *               soldOut:  { type: boolean, example: false }
 *               sizes:    { type: string, example: 'S,M,L,XL' }
 *               category: { type: string, example: 'tshirts' }
 *               mainImg:  { type: string, format: binary }
 *               imgs:     { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Produit créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Aucune image fournie
 */
router.post('/add', cpUpload, addProduct);

/**
 * @swagger
 * /api/products/delete/{id}:
 *   delete:
 *     summary: Supprimer un produit
 *     tags: [Produits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB du produit
 *     responses:
 *       200:
 *         description: Produit supprimé
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: 'Product deleted'
 */
router.delete('/delete/:id', deleteProduct);

module.exports = router;