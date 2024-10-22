
const express = require('express');
const router = express.Router();

const { getCategories, addCategory, getCategoriesProducts } = require('../controllers/categoryController');

router.get('/', getCategories);

router.post('/:name', addCategory);

router.get('/:name', getCategoriesProducts);

module.exports = router;