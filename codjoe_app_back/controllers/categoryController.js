
const categoryModel = require('../models/categoryModel');
const productModel = require('../models/productModel');

const getCategories = async (req, res, next) => {
    try {
        const categories = await categoryModel.find({});
        res.json(categories);
    } catch (error) {
        res.json({ message: error.message });
    }
};

const addCategory = async (req, res, next) => {
    const category = new categoryModel({
        name: req.params.name.toLowerCase(),
        products: []
    });

    try {
        const newCategory = await category.save();
        res.json(newCategory);
    } catch (error) {
        res.json({ message: error.message });
    }
};

const getCategoriesProducts = async (req, res, next) => {
    try {

        const category = await categoryModel.findOne({ name: req.params.name.toLowerCase() }).populate('products');

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        } else if (category.products.length === 0) {
            return res.status(404).json({ message: `No products found in ${req.params.name}` });
        }

        const products = [];

        const productList = await category.products.map(async productID => {

            const product = await productModel.findById(productID);

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            products.push(product);

        });

        Promise.all(productList).then(() => {
            res.json({
                category: category.name,
                products: products,
                total: products.length
            });
        });

    } catch (error) {
        res.json({ message: error.message });
    }
};

module.exports = { getCategories, addCategory, getCategoriesProducts };