
const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer();

const cpUpload = upload.fields([{ name: 'mainImg', maxCount: 1 }, { name: 'imgs', maxCount: 8 }]);

const { getProducts, getProductById, addProduct, deleteProduct } = require('../controllers/productController');

router.get('/', getProducts);

router.get('/:id', getProductById)

router.post('/add', cpUpload, addProduct);

router.delete('/delete/:id', deleteProduct);


module.exports = router;